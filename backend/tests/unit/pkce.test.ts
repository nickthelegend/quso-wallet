import { generateCodeVerifier, generateCodeChallenge, base64url } from '../../src/pkce';
import crypto from 'crypto';

describe('PKCE Module', () => {
  describe('base64url', () => {
    it('should encode buffer to base64url format', () => {
      const buffer = Buffer.from('hello world');
      const encoded = base64url(buffer);
      
      // Should not contain +, /, or =
      expect(encoded).not.toMatch(/[+/=]/);
      expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should replace + with - and / with _', () => {
      // Create a buffer that would produce + and / in standard base64
      const buffer = Buffer.from([0xff, 0xfe, 0xfd]);
      const encoded = base64url(buffer);
      
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
    });
  });

  describe('generateCodeVerifier', () => {
    it('should generate a 43-character base64url string', () => {
      const verifier = generateCodeVerifier();
      
      // 32 bytes in base64url = 43 characters (without padding)
      expect(verifier).toHaveLength(43);
      expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should generate unique verifiers', () => {
      const verifier1 = generateCodeVerifier();
      const verifier2 = generateCodeVerifier();
      
      expect(verifier1).not.toBe(verifier2);
    });

    it('should not contain base64 special characters', () => {
      const verifier = generateCodeVerifier();
      
      expect(verifier).not.toContain('+');
      expect(verifier).not.toContain('/');
      expect(verifier).not.toContain('=');
    });
  });

  describe('generateCodeChallenge', () => {
    it('should generate SHA256 hash of verifier in base64url format', async () => {
      const verifier = 'test-verifier';
      const challenge = await generateCodeChallenge(verifier);
      
      // SHA256 produces 32 bytes, which in base64url is 43 characters
      expect(challenge).toHaveLength(43);
      expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should produce consistent challenges for same verifier', async () => {
      const verifier = generateCodeVerifier();
      const challenge1 = await generateCodeChallenge(verifier);
      const challenge2 = await generateCodeChallenge(verifier);
      
      expect(challenge1).toBe(challenge2);
    });

    it('should produce different challenges for different verifiers', async () => {
      const verifier1 = generateCodeVerifier();
      const verifier2 = generateCodeVerifier();
      
      const challenge1 = await generateCodeChallenge(verifier1);
      const challenge2 = await generateCodeChallenge(verifier2);
      
      expect(challenge1).not.toBe(challenge2);
    });

    it('should match manual SHA256 calculation', async () => {
      const verifier = 'test-verifier';
      const challenge = await generateCodeChallenge(verifier);
      
      // Manually calculate expected challenge
      const hash = crypto.createHash('sha256').update(verifier).digest();
      const expected = hash
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      expect(challenge).toBe(expected);
    });
  });
});
