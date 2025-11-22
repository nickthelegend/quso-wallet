/**
 * Jest setup file to configure test environment
 * Sets up required environment variables for testing
 */

// Set required environment variables for tests
process.env.BASE_URL = 'http://localhost:3000';
process.env.ALLOWED_REDIRECTS = 'http://localhost:3001,http://localhost:19006';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.JWT_EXPIRES = '7d';

// Google OAuth test configuration
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
process.env.GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
process.env.GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// GitHub OAuth test configuration
process.env.GITHUB_CLIENT_ID = 'test-github-client-id';
process.env.GITHUB_CLIENT_SECRET = 'test-github-client-secret';
process.env.GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
process.env.GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
process.env.GITHUB_USERINFO_URL = 'https://api.github.com/user';
