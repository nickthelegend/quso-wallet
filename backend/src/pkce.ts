import crypto from 'crypto';

/**
 * Converts a Buffer to base64url encoding (RFC 7636)
 * Replaces + with -, / with _, and removes padding =
 */
export function base64url(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generates a cryptographically random code verifier for PKCE
 * Returns a base64url-encoded string of 32 random bytes (43 characters)
 */
export function generateCodeVerifier(): string {
  const verifier = crypto.randomBytes(32);
  return base64url(verifier);
}

/**
 * Generates a code challenge from a code verifier using SHA256
 * Returns the base64url-encoded SHA256 hash of the verifier
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64url(hash);
}
