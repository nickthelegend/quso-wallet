import axios from 'axios';
import { config } from '../config';

/**
 * Token response from OAuth provider
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  id_token?: string;
  scope?: string;
}

/**
 * Normalized user profile structure
 */
export interface NormalizedUser {
  id: string;
  email: string | null;
  name: string;
  avatar: string | null;
  provider: string;
}

/**
 * OAuth provider interface
 */
export interface OAuthProvider {
  name: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  
  buildAuthParams(
    redirectUri: string,
    codeChallenge: string,
    state: string
  ): Record<string, string>;
  
  exchangeCode(
    code: string,
    redirectUri: string,
    codeVerifier: string
  ): Promise<TokenResponse>;
  
  getUser(accessToken: string): Promise<NormalizedUser>;
}

/**
 * Google OAuth 2.0 Provider
 * 
 * Requirements:
 * - 1.4: Request openid, email, and profile scopes
 * - 4.3: Use application/x-www-form-urlencoded for token exchange
 * - 5.3: Extract user data from sub, email, name, picture fields
 * - 8.1: Implement provider interface with required methods
 */
export const googleProvider: OAuthProvider = {
  name: 'google',
  authUrl: config.google.authUrl,
  tokenUrl: config.google.tokenUrl,
  userInfoUrl: config.google.userInfoUrl,
  clientId: config.google.clientId,
  clientSecret: config.google.clientSecret,
  scope: 'openid email profile',

  /**
   * Builds authorization URL parameters for Google OAuth
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
      response_type: 'code',
      scope: this.scope,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      access_type: 'offline',
      prompt: 'consent'
    };
  },

  /**
   * Exchanges authorization code for access token
   * Uses application/x-www-form-urlencoded content type as per Google requirements
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
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data;
  },

  /**
   * Fetches and normalizes Google user profile
   * 
   * @param accessToken - Access token from token exchange
   * @returns Normalized user profile with consistent structure
   */
  async getUser(accessToken: string): Promise<NormalizedUser> {
    const response = await axios.get(this.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const data = response.data;

    // Extract user data from Google-specific fields
    // sub: unique Google user ID
    // email: user's email address
    // name: user's display name
    // picture: user's avatar URL
    return {
      id: data.sub,
      email: data.email || null,
      name: data.name || data.email || 'Unknown',
      avatar: data.picture || null,
      provider: 'google'
    };
  }
};
