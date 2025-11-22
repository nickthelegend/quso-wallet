import axios from 'axios';
import { OAuthProvider, TokenResponse, NormalizedUser } from './google';
import { config } from '../config';

/**
 * GitHub OAuth 2.0 Provider
 * 
 * Requirements:
 * - 1.5: Request read:user and user:email scopes
 * - 4.4: Include Accept: application/json header in token request
 * - 5.4: Extract user data from id, name/login, email, avatar_url fields
 * - 8.1: Implement provider interface with required methods
 */
export const githubProvider: OAuthProvider = {
  name: 'github',
  authUrl: config.github.authUrl,
  tokenUrl: config.github.tokenUrl,
  userInfoUrl: config.github.userInfoUrl,
  clientId: config.github.clientId,
  clientSecret: config.github.clientSecret,
  scope: 'read:user user:email',

  /**
   * Builds authorization URL parameters for GitHub OAuth
   * 
   * @param redirectUri - The callback URL for OAuth flow
   * @param codeChallenge - PKCE code challenge
   * @param state - CSRF protection state parameter
   * @returns Object containing all required OAuth parameters
   */
  buildAuthParams(
    redirectUri: string,
    codeChallenge: string,
    state: string
  ): Record<string, string> {
    return {
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: this.scope,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    };
  },

  /**
   * Exchanges authorization code for access token
   * Uses Accept: application/json header as per GitHub requirements
   * 
   * @param code - Authorization code from provider callback
   * @param redirectUri - Must match the redirect URI used in authorization
   * @param codeVerifier - PKCE code verifier
   * @returns Token response containing access_token
   */
  async exchangeCode(
    code: string,
    redirectUri: string,
    codeVerifier: string
  ): Promise<TokenResponse> {
    const params = new URLSearchParams({
      code: code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier
    });

    const response = await axios.post<TokenResponse>(
      this.tokenUrl,
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    );

    return response.data;
  },

  /**
   * Fetches and normalizes GitHub user profile
   * 
   * @param accessToken - Access token from token exchange
   * @returns Normalized user profile with consistent structure
   */
  async getUser(accessToken: string): Promise<NormalizedUser> {
    const response = await axios.get(this.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    const data = response.data;

    // Extract user data from GitHub-specific fields
    // id: unique GitHub user ID
    // email: user's email address (may be null)
    // name: user's display name (fallback to login if not set)
    // avatar_url: user's avatar URL
    return {
      id: String(data.id),
      email: data.email || null,
      name: data.name || data.login || 'Unknown',
      avatar: data.avatar_url || null,
      provider: 'github'
    };
  }
};
