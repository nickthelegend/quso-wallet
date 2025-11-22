import { Request, Response } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { OAuthProvider } from './providers/google';
import { googleProvider } from './providers/google';
import { githubProvider } from './providers/github';
import { generateCodeVerifier, generateCodeChallenge } from './pkce';
import { signSession } from './jwt';
import { config } from './config';

/**
 * State store entry structure
 */
interface StateEntry {
  codeVerifier: string;
  redirectTo: string;
  provider: string;
}

/**
 * In-memory state store for OAuth flow state management
 * In production, this should be replaced with Redis
 */
const stateStore = new Map<string, StateEntry>();

/**
 * Provider registry mapping provider names to provider implementations
 * Requirements: 8.2 - Provider lookup by name
 */
const providers: Record<string, OAuthProvider> = {
  google: googleProvider,
  github: githubProvider
};

/**
 * Validates if a redirect URL is in the allowed redirects list
 * Requirements: 1.3 - Validate redirect URL against whitelist
 * 
 * @param url - The redirect URL to validate
 * @returns true if the URL is allowed, false otherwise
 */
export function isAllowedRedirect(url: string): boolean {
  return config.allowedRedirects.includes(url);
}

/**
 * Initiates OAuth flow by redirecting to provider authorization URL
 * 
 * Requirements:
 * - 1.1: Generate code verifier, code challenge, and state parameter
 * - 1.2: Redirect to provider authorization URL with parameters
 * - 1.3: Validate redirect URL
 * - 3.1: Generate unique state parameter
 * - 3.2: Store state with verifier, redirect_to, and provider
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function startAuth(req: Request, res: Response): Promise<void> {
  try {
    const { provider: providerName, redirect_to } = req.query;

    // Validate provider parameter
    if (!providerName || typeof providerName !== 'string') {
      res.status(400).send('Invalid or missing provider parameter');
      return;
    }

    // Validate redirect_to parameter
    if (!redirect_to || typeof redirect_to !== 'string') {
      res.status(400).send('Invalid or missing redirect_to parameter');
      return;
    }

    // Check if provider is supported
    const provider = providers[providerName];
    if (!provider) {
      res.status(400).send(`Unsupported provider: ${providerName}`);
      return;
    }

    // Validate redirect URL against whitelist
    if (!isAllowedRedirect(redirect_to)) {
      res.status(400).send('Invalid redirect_to URL');
      return;
    }

    // Generate state parameter (16 random bytes = 32 hex characters)
    const state = crypto.randomBytes(16).toString('hex');

    // Generate PKCE code verifier and challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store state with associated data
    stateStore.set(state, {
      codeVerifier,
      redirectTo: redirect_to,
      provider: providerName
    });

    // Build callback URL
    const redirectUri = `${config.baseUrl}/auth/callback`;

    // Build authorization URL parameters
    const authParams = provider.buildAuthParams(redirectUri, codeChallenge, state);
    const authUrl = new URL(provider.authUrl);
    Object.entries(authParams).forEach(([key, value]) => {
      authUrl.searchParams.append(key, value);
    });

    // Redirect user to provider authorization URL
    res.redirect(authUrl.toString());
  } catch (error) {
    console.error('Error in startAuth:', error);
    res.status(500).send('Internal server error');
  }
}

/**
 * Handles OAuth callback from provider
 * 
 * Requirements:
 * - 3.3: Validate state parameter
 * - 3.5: Delete state after processing
 * - 4.1: Extract code and state from query parameters
 * - 4.2: Exchange authorization code for access token
 * - 5.1: Fetch user profile from provider
 * - 6.4: Create user identifier in "provider:id" format
 * - 6.5: Redirect to client with JWT in URL fragment
 * - 9.1: Handle provider callback errors
 * - 9.3: Handle invalid state parameters
 * - 9.4: Handle token exchange failures
 * - 9.5: Handle userinfo request failures
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export async function handleCallback(req: Request, res: Response): Promise<void> {
  let state: string | undefined;
  
  try {
    const { code, error, error_description } = req.query;
    state = req.query.state as string | undefined;

    // Requirement 9.1: Handle provider callback errors
    if (error) {
      const errorMsg = error_description 
        ? `Provider error: ${error} - ${error_description}`
        : `Provider error: ${error}`;
      console.error('Provider callback error:', { error, error_description });
      res.status(400).send(errorMsg);
      return;
    }

    // Validate required parameters
    if (!code || typeof code !== 'string') {
      res.status(400).send('Missing authorization code');
      return;
    }

    // Requirement 9.3: Handle invalid state parameters
    if (!state || typeof state !== 'string') {
      res.status(400).send('Missing state parameter');
      return;
    }

    // Retrieve and validate state
    const stateEntry = stateStore.get(state);
    if (!stateEntry) {
      console.error('Invalid state parameter received:', state);
      res.status(400).send('Invalid state parameter');
      return;
    }

    // Extract stored data
    const { codeVerifier, redirectTo, provider: providerName } = stateEntry;

    // Get provider
    const provider = providers[providerName];
    if (!provider) {
      // Clean up state even on error
      stateStore.delete(state);
      res.status(400).send(`Unsupported provider: ${providerName}`);
      return;
    }

    // Build callback URL
    const redirectUri = `${config.baseUrl}/auth/callback`;

    let tokenResponse;
    try {
      // Requirement 9.4: Handle token exchange failures
      tokenResponse = await provider.exchangeCode(code, redirectUri, codeVerifier);
    } catch (error) {
      // Clean up state on error
      stateStore.delete(state);
      
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        const errorMsg = errorData?.error_description || errorData?.error || error.message;
        console.error('Token exchange failed:', {
          provider: providerName,
          status: error.response?.status,
          error: errorData
        });
        res.status(500).send(`Token exchange failed: ${errorMsg}`);
      } else {
        console.error('Token exchange failed:', error);
        res.status(500).send('Token exchange failed');
      }
      return;
    }

    let user;
    try {
      // Requirement 9.5: Handle userinfo request failures
      user = await provider.getUser(tokenResponse.access_token);
    } catch (error) {
      // Clean up state on error
      stateStore.delete(state);
      
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        const errorMsg = errorData?.message || error.message;
        console.error('User info request failed:', {
          provider: providerName,
          status: error.response?.status,
          error: errorData
        });
        res.status(500).send(`Failed to fetch user information: ${errorMsg}`);
      } else {
        console.error('User info request failed:', error);
        res.status(500).send('Failed to fetch user information');
      }
      return;
    }

    // Create user identifier in "provider:id" format
    const userIdentifier = `${user.provider}:${user.id}`;

    // Create session JWT
    const sessionToken = signSession({
      sub: userIdentifier,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider
    });

    // Clean up state from store (Requirement 3.5)
    stateStore.delete(state);

    // Redirect to client with token in URL fragment
    const redirectUrl = `${redirectTo}#token=${sessionToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    // Clean up state on any unexpected error
    if (state) {
      stateStore.delete(state);
    }
    
    console.error('Unexpected error in handleCallback:', error);
    res.status(500).send('Internal server error');
  }
}
