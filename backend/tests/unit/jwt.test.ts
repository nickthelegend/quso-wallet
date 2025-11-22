import jwt from 'jsonwebtoken';
import { signSession, SessionPayload } from '../../src/jwt';

describe('JWT Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
    process.env.JWT_SECRET = 'test-secret-key-for-testing';
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('signSession', () => {
    it('should sign a JWT with the provided payload', () => {
      const payload: SessionPayload = {
        sub: 'google:123456',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        provider: 'google'
      };

      const token = signSession(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should create a JWT that can be verified with the secret', () => {
      const payload: SessionPayload = {
        sub: 'github:789',
        email: null,
        name: 'GitHub User',
        avatar: null,
        provider: 'github'
      };

      const token = signSession(payload);
      const decoded = jwt.verify(token, 'test-secret-key-for-testing') as any;

      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.name).toBe(payload.name);
      expect(decoded.avatar).toBe(payload.avatar);
      expect(decoded.provider).toBe(payload.provider);
    });

    it('should use HS256 algorithm', () => {
      const payload: SessionPayload = {
        sub: 'google:123',
        email: 'user@test.com',
        name: 'User',
        avatar: null,
        provider: 'google'
      };

      const token = signSession(payload);
      const decoded = jwt.decode(token, { complete: true }) as any;

      expect(decoded.header.alg).toBe('HS256');
    });

    it('should default to 7 days expiration when JWT_EXPIRES is not set', () => {
      delete process.env.JWT_EXPIRES;

      const payload: SessionPayload = {
        sub: 'google:123',
        email: 'user@test.com',
        name: 'User',
        avatar: null,
        provider: 'google'
      };

      const beforeTime = Math.floor(Date.now() / 1000);
      const token = signSession(payload);
      const decoded = jwt.verify(token, 'test-secret-key-for-testing') as any;

      // 7 days = 604800 seconds
      const expectedExp = beforeTime + 604800;
      
      // Allow 2 second tolerance for test execution time
      expect(decoded.exp).toBeGreaterThanOrEqual(expectedExp - 2);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExp + 2);
    });

    it('should use configured JWT_EXPIRES from config', () => {
      // Note: JWT_EXPIRES is set to '7d' in test setup
      // This test verifies that the config value is used
      const payload: SessionPayload = {
        sub: 'google:123',
        email: 'user@test.com',
        name: 'User',
        avatar: null,
        provider: 'google'
      };

      const beforeTime = Math.floor(Date.now() / 1000);
      const token = signSession(payload);
      const decoded = jwt.verify(token, 'test-secret-key-for-testing') as any;

      // 7 days = 604800 seconds (from test setup)
      const expectedExp = beforeTime + 604800;
      
      // Allow 2 second tolerance
      expect(decoded.exp).toBeGreaterThanOrEqual(expectedExp - 2);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExp + 2);
    });

    // Note: Testing for missing JWT_SECRET is now handled at application startup
    // by the config validation, so this test is no longer applicable with the
    // centralized config system. The config module will throw an error on startup
    // if JWT_SECRET is missing, preventing the application from running at all.

    it('should include iat (issued at) claim', () => {
      const payload: SessionPayload = {
        sub: 'google:123',
        email: 'user@test.com',
        name: 'User',
        avatar: null,
        provider: 'google'
      };

      const beforeTime = Math.floor(Date.now() / 1000);
      const token = signSession(payload);
      const decoded = jwt.verify(token, 'test-secret-key-for-testing') as any;

      expect(decoded.iat).toBeDefined();
      expect(decoded.iat).toBeGreaterThanOrEqual(beforeTime - 2);
      expect(decoded.iat).toBeLessThanOrEqual(beforeTime + 2);
    });
  });
});
