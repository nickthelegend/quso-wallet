# Implementation Plan

- [x] 1. Set up project structure and dependencies





  - Create package.json with required dependencies (express, axios, jsonwebtoken, cookie-parser, cors, dotenv)
  - Add dev dependencies (typescript, ts-node, @types packages, jest, fast-check)
  - Create tsconfig.json with appropriate compiler options
  - Create .env.example file with all required environment variables
  - Set up basic folder structure (src/, src/providers/, tests/)
  - _Requirements: 7.1_
-

- [x] 2. Implement PKCE cryptographic functions




  - Create src/pkce.ts with generateCodeVerifier, generateCodeChallenge, and base64url functions
  - Implement 32-byte random generation for code verifier
  - Implement SHA256 hashing for code challenge
  - Implement base64url encoding with proper character replacements
  - _Requirements: 2.1, 2.2, 2.5_

- [ ]* 2.1 Write property test for PKCE code verifier format
  - **Property 1: PKCE code verifier format**
  - **Validates: Requirements 2.1**

- [ ]* 2.2 Write property test for PKCE code challenge correctness
  - **Property 2: PKCE code challenge correctness**
  - **Validates: Requirements 2.2**

- [ ]* 2.3 Write property test for base64url encoding
  - **Property 3: Base64url encoding format**
  - **Validates: Requirements 2.5**

- [x] 3. Implement JWT session management





  - Create src/jwt.ts with signSession function
  - Implement JWT signing with HS256 algorithm
  - Use JWT_SECRET and JWT_EXPIRES from environment
  - Default to 7 days if JWT_EXPIRES not configured
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 3.1 Write property test for JWT payload completeness
  - **Property 13: Session JWT payload completeness**
  - **Validates: Requirements 6.1**

- [ ]* 3.2 Write property test for JWT signature verification
  - **Property 15: JWT signature verification**
  - **Validates: Requirements 6.2**

- [ ]* 3.3 Write unit test for JWT default expiration
  - Test that JWT defaults to 7 days when JWT_EXPIRES is not set
  - _Requirements: 6.3_

- [x] 4. Implement Google OAuth provider





  - Create src/providers/google.ts with provider object
  - Implement buildAuthParams with openid, email, profile scopes
  - Implement exchangeCode with application/x-www-form-urlencoded content type
  - Implement getUser to fetch and normalize Google user profile
  - Extract user data from sub, email, name, picture fields
  - _Requirements: 1.4, 4.3, 5.3, 8.1_

- [ ]* 4.1 Write unit test for Google provider configuration
  - Test Google provider has correct scopes, URLs, and credentials
  - _Requirements: 1.4, 7.3_

- [ ]* 4.2 Write property test for Google user profile normalization
  - Test that normalized profiles have all required fields
  - _Requirements: 5.5_

- [x] 5. Implement GitHub OAuth provider





  - Create src/providers/github.ts with provider object
  - Implement buildAuthParams with read:user, user:email scopes
  - Implement exchangeCode with Accept: application/json header
  - Implement getUser to fetch and normalize GitHub user profile
  - Extract user data from id, name/login, email, avatar_url fields
  - _Requirements: 1.5, 4.4, 5.4, 8.1_

- [ ]* 5.1 Write unit test for GitHub provider configuration
  - Test GitHub provider has correct scopes, URLs, and credentials
  - _Requirements: 1.5, 7.4_

- [ ]* 5.2 Write property test for GitHub user profile normalization
  - Test that normalized profiles have all required fields
  - _Requirements: 5.5_
- [x] 6. Implement core authentication logic




- [ ] 6. Implement core authentication logic

  - Create src/auth.ts with startAuth and handleCallback functions
  - Implement provider registry with Google and GitHub providers
  - Implement isAllowedRedirect function for redirect URL validation
  - Create in-memory Map for state storage
  - _Requirements: 8.2, 1.3_

- [ ]* 6.1 Write property test for redirect URL validation
  - **Property 8: Redirect URL validation**
  - **Validates: Requirements 1.3**

- [ ]* 6.2 Write property test for provider lookup
  - **Property 18: Provider lookup**
  - **Validates: Requirements 8.2**

- [ ]* 6.3 Write property test for provider interface compliance
  - **Property 17: Provider interface compliance**
  - **Validates: Requirements 8.1**
-

- [x] 7. Implement OAuth flow initiation (startAuth)




  - Generate state parameter using 16 random bytes
  - Generate code verifier and code challenge using PKCE functions
  - Store state with verifier, redirect_to, and provider in state store
  - Build authorization URL with provider-specific parameters
  - Redirect user to provider authorization URL
  - _Requirements: 1.1, 1.2, 3.1, 3.2_

- [ ]* 7.1 Write property test for state parameter generation
  - **Property 4: State parameter uniqueness and format**
  - **Validates: Requirements 3.1**

- [ ]* 7.2 Write property test for state storage completeness
  - **Property 5: State storage completeness**
  - **Validates: Requirements 3.2**

- [ ]* 7.3 Write property test for authorization URL construction
  - **Property 9: Authorization URL construction**
  - **Validates: Requirements 1.2, 2.3**

- [x] 8. Implement OAuth callback handling (handleCallback)




  - Extract code and state from query parameters
  - Validate state against stored values
  - Retrieve stored verifier, redirect_to, and provider
  - Exchange authorization code for access token with provider
  - Fetch user profile from provider using access token
  - Create user identifier in "provider:id" format
  - Issue Session JWT with user data
  - Delete state from store
  - Redirect to client with JWT in URL fragment
  - _Requirements: 3.3, 3.5, 4.1, 4.2, 5.1, 5.2, 6.4, 6.5_

- [ ]* 8.1 Write property test for state validation
  - **Property 6: State validation**
  - **Validates: Requirements 3.3**

- [ ]* 8.2 Write property test for state cleanup
  - **Property 7: State cleanup after callback**
  - **Validates: Requirements 3.5**

- [ ]* 8.3 Write property test for token exchange request completeness
  - **Property 10: Token exchange request completeness**
  - **Validates: Requirements 4.2, 2.4**

- [ ]* 8.4 Write property test for Bearer token format
  - **Property 12: Bearer token format**
  - **Validates: Requirements 5.2**

- [ ]* 8.5 Write property test for user profile normalization
  - **Property 11: User profile normalization**
  - **Validates: Requirements 5.5**

- [ ]* 8.6 Write property test for user identifier format
  - **Property 14: User identifier format**
  - **Validates: Requirements 6.4**

- [ ]* 8.7 Write property test for redirect with token in fragment
  - **Property 16: Redirect with token in fragment**
  - **Validates: Requirements 6.5**
-

- [x] 9. Implement error handling




  - Add error handling for invalid provider names (400)
  - Add error handling for invalid redirect URLs (400)
  - Add error handling for invalid state parameters (400)
  - Add error handling for provider callback errors
  - Add error handling for token exchange failures
  - Add error handling for userinfo request failures
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 9.1 Write unit tests for error handling
  - Test invalid provider returns 400
  - Test invalid redirect_to returns 400
  - Test invalid state returns 400
  - Test provider errors are handled gracefully
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 10. Implement Express server





  - Create src/server.ts with Express application setup
  - Configure CORS middleware with credentials support
  - Configure cookie-parser middleware
  - Add GET /auth/start route
  - Add GET /auth/callback route
  - Add GET /health route
  - Start server on configured PORT
  - Log server startup with port number
  - _Requirements: 10.1, 10.2, 10.3, 11.1, 11.4_

- [ ]* 10.1 Write integration test for health endpoint
  - Test GET /health returns 200 and "ok"
  - Test health endpoint doesn't require authentication
  - _Requirements: 11.1, 11.2_

- [ ]* 10.2 Write integration test for CORS configuration
  - Test CORS headers are present
  - Test credentials are enabled
  - _Requirements: 10.1, 10.2, 10.3_
-

- [x] 11. Implement environment configuration




  - Load all environment variables using dotenv
  - Parse ALLOWED_REDIRECTS as comma-separated list
  - Validate required environment variables on startup
  - Fail with clear error if required variables are missing
  - _Requirements: 7.1, 7.2_

- [ ]* 11.1 Write property test for comma-separated redirect parsing
  - **Property 19: Comma-separated redirect parsing**
  - **Validates: Requirements 7.2**

- [ ]* 11.2 Write unit test for environment variable validation
  - Test server fails to start with missing required variables
  - _Requirements: 7.5_
-

- [-] 12. Create documentation and examples


  - Create README.md with setup instructions
  - Document all environment variables in .env.example
  - Add example client integration code for React
  - Add example client integration code for Expo
  - Document OAuth flow sequence
  - _Requirements: All_

- [ ] 13. Final checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.
