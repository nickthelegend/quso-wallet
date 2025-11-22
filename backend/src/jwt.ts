import * as jwt from 'jsonwebtoken';
import { config } from './config';

/**
 * Session JWT payload structure
 */
export interface SessionPayload {
  sub: string;        // User identifier (provider:id)
  email: string | null;
  name: string;
  avatar: string | null;
  provider: string;
}

/**
 * Signs a session JWT with the configured secret and expiration
 * 
 * Requirements:
 * - 6.1: Create Session JWT with user data
 * - 6.2: Sign JWT with configured secret
 * - 6.3: Default to 7 days if JWT_EXPIRES not configured
 * 
 * @param payload - The session data to encode in the JWT
 * @returns Signed JWT token string
 */
export function signSession(payload: SessionPayload): string {
  // Sign JWT with HS256 algorithm (default)
  // JWT secret and expiration are loaded from config
  const token = jwt.sign(payload, config.jwtSecret, { 
    expiresIn: config.jwtExpires 
  } as jwt.SignOptions);
  
  return token;
}
