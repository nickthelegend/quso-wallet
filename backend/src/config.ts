import dotenv from 'dotenv';

// Load environment variables from .env file
// Requirement 7.1: Load configuration from environment variables
dotenv.config();

/**
 * Configuration interface for the OAuth backend
 */
export interface Config {
  // Server configuration
  port: number;
  baseUrl: string;
  allowedRedirects: string[];
  
  // JWT configuration
  jwtSecret: string;
  jwtExpires: string;
  
  // Google OAuth configuration
  google: {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
  };
  
  // GitHub OAuth configuration
  github: {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
  };
}

/**
 * List of required environment variables
 */
const REQUIRED_ENV_VARS = [
  'BASE_URL',
  'ALLOWED_REDIRECTS',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET'
];

/**
 * Validates that all required environment variables are present
 * Requirement 7.5: Fail with clear error if required variables are missing
 * 
 * @throws Error if any required environment variable is missing
 */
function validateEnvironment(): void {
  const missing: string[] = [];
  
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables:\n  - ${missing.join('\n  - ')}\n\nPlease check your .env file or environment configuration.`;
    throw new Error(errorMessage);
  }
}

/**
 * Parses comma-separated redirect URLs from environment variable
 * Requirement 7.2: Parse comma-separated list of valid redirect URLs
 * 
 * @param redirectsString - Comma-separated string of redirect URLs
 * @returns Array of trimmed redirect URLs
 */
function parseAllowedRedirects(redirectsString: string): string[] {
  return redirectsString
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0);
}

/**
 * Loads and validates configuration from environment variables
 * 
 * Requirements:
 * - 7.1: Load configuration from environment variables
 * - 7.2: Parse ALLOWED_REDIRECTS as comma-separated list
 * - 7.3: Load Google provider configuration
 * - 7.4: Load GitHub provider configuration
 * - 7.5: Fail with clear error if required variables are missing
 * 
 * @returns Validated configuration object
 * @throws Error if validation fails
 */
function loadConfig(): Config {
  // Validate required environment variables first
  validateEnvironment();
  
  // Parse allowed redirects
  const allowedRedirects = parseAllowedRedirects(process.env.ALLOWED_REDIRECTS!);
  
  return {
    // Server configuration
    port: parseInt(process.env.PORT || '3000', 10),
    baseUrl: process.env.BASE_URL!,
    allowedRedirects,
    
    // JWT configuration
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpires: process.env.JWT_EXPIRES || '7d',
    
    // Google OAuth configuration
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authUrl: process.env.GOOGLE_AUTH_URL || 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: process.env.GOOGLE_TOKEN_URL || 'https://oauth2.googleapis.com/token',
      userInfoUrl: process.env.GOOGLE_USERINFO_URL || 'https://www.googleapis.com/oauth2/v2/userinfo'
    },
    
    // GitHub OAuth configuration
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authUrl: process.env.GITHUB_AUTH_URL || 'https://github.com/login/oauth/authorize',
      tokenUrl: process.env.GITHUB_TOKEN_URL || 'https://github.com/login/oauth/access_token',
      userInfoUrl: process.env.GITHUB_USERINFO_URL || 'https://api.github.com/user'
    }
  };
}

/**
 * Singleton configuration instance
 * Loaded once at application startup
 */
export const config = loadConfig();
