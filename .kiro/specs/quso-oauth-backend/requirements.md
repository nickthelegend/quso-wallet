# Requirements Document

## Introduction

This document specifies the requirements for a custom OAuth 2.0 authentication backend that supports Google and GitHub providers. The system will implement secure authorization code flow with PKCE (Proof Key for Code Exchange) and state parameters, issue JWT-based session tokens, and integrate with Quso Wallet SDKs for both web (React) and mobile (Expo) applications.

## Glossary

- **OAuth Backend**: The Express-based Node.js server that handles OAuth 2.0 authentication flows
- **PKCE**: Proof Key for Code Exchange, a security extension to OAuth 2.0 for public clients
- **Code Verifier**: A cryptographically random string used in PKCE flow
- **Code Challenge**: A SHA256 hash of the code verifier, encoded in base64url format
- **State Parameter**: A random value used to prevent CSRF attacks in OAuth flows
- **Session JWT**: A JSON Web Token issued by the OAuth Backend to represent an authenticated user session
- **Provider**: An OAuth 2.0 identity provider (Google or GitHub)
- **Authorization Code**: A temporary code returned by the Provider after user consent
- **Access Token**: A token issued by the Provider to access user information
- **Redirect URI**: The callback URL where the Provider sends the authorization code
- **Client Application**: The React web or Expo mobile application using the OAuth Backend

## Requirements

### Requirement 1

**User Story:** As a user, I want to authenticate using my Google or GitHub account, so that I can securely access the application without creating new credentials.

#### Acceptance Criteria

1. WHEN a Client Application initiates authentication with a valid provider and redirect URL, THEN the OAuth Backend SHALL generate a code verifier, code challenge, and state parameter
2. WHEN the OAuth Backend receives valid authentication parameters, THEN the OAuth Backend SHALL redirect the user to the Provider's authorization URL with the code challenge and state parameter
3. WHEN a redirect URL is provided, THEN the OAuth Backend SHALL validate it against the allowed redirects list before proceeding
4. WHERE the provider is Google, the OAuth Backend SHALL request openid, email, and profile scopes
5. WHERE the provider is GitHub, the OAuth Backend SHALL request read:user and user:email scopes

### Requirement 2

**User Story:** As a developer, I want the OAuth flow to use PKCE, so that the authentication is secure against authorization code interception attacks.

#### Acceptance Criteria

1. WHEN generating a code verifier, THEN the OAuth Backend SHALL create a cryptographically random string of 32 bytes encoded in base64url format
2. WHEN generating a code challenge, THEN the OAuth Backend SHALL compute the SHA256 hash of the code verifier and encode it in base64url format
3. WHEN initiating the OAuth flow, THEN the OAuth Backend SHALL send the code challenge with method S256 to the Provider
4. WHEN exchanging the authorization code, THEN the OAuth Backend SHALL include the original code verifier in the token request
5. WHEN encoding base64url strings, THEN the OAuth Backend SHALL replace plus signs with hyphens, slashes with underscores, and remove padding equals signs

### Requirement 3

**User Story:** As a security engineer, I want state parameters in OAuth flows, so that CSRF attacks are prevented.

#### Acceptance Criteria

1. WHEN initiating an OAuth flow, THEN the OAuth Backend SHALL generate a unique state parameter using 16 cryptographically random bytes
2. WHEN storing state parameters, THEN the OAuth Backend SHALL associate each state with its corresponding code verifier, redirect URL, and provider
3. WHEN receiving a callback, THEN the OAuth Backend SHALL verify that the state parameter matches a stored value
4. IF the state parameter does not match any stored value, THEN the OAuth Backend SHALL reject the request with an error
5. WHEN a callback is successfully processed, THEN the OAuth Backend SHALL delete the state parameter from storage

### Requirement 4

**User Story:** As a developer, I want to exchange authorization codes for access tokens, so that I can retrieve user profile information from the provider.

#### Acceptance Criteria

1. WHEN the Provider redirects to the callback URL with an authorization code, THEN the OAuth Backend SHALL extract the code and state parameters
2. WHEN exchanging an authorization code, THEN the OAuth Backend SHALL send a POST request to the Provider's token endpoint with the code, code verifier, client credentials, and redirect URI
3. WHERE the provider is Google, the OAuth Backend SHALL use application/x-www-form-urlencoded content type for the token request
4. WHERE the provider is GitHub, the OAuth Backend SHALL include Accept: application/json header in the token request
5. WHEN the token exchange succeeds, THEN the OAuth Backend SHALL receive an access token from the Provider

### Requirement 5

**User Story:** As a user, I want my profile information retrieved from the OAuth provider, so that the application can identify me.

#### Acceptance Criteria

1. WHEN an access token is obtained, THEN the OAuth Backend SHALL request user profile information from the Provider's userinfo endpoint
2. WHEN requesting user information, THEN the OAuth Backend SHALL include the access token in the Authorization header as a Bearer token
3. WHERE the provider is Google, the OAuth Backend SHALL extract user ID from the sub field, email, name, and avatar from the picture field
4. WHERE the provider is GitHub, the OAuth Backend SHALL extract user ID from the id field, name from name or login fields, and avatar from avatar_url field
5. WHEN normalizing user profiles, THEN the OAuth Backend SHALL create a consistent structure containing id, email, name, avatar, and provider fields

### Requirement 6

**User Story:** As a developer, I want to issue JWT session tokens, so that authenticated users can access protected resources.

#### Acceptance Criteria

1. WHEN user authentication succeeds, THEN the OAuth Backend SHALL create a Session JWT containing user identifier, email, name, avatar, and provider
2. WHEN signing a Session JWT, THEN the OAuth Backend SHALL use the configured JWT secret and expiration time
3. WHEN the JWT expiration is not configured, THEN the OAuth Backend SHALL default to 7 days
4. WHEN creating a user identifier, THEN the OAuth Backend SHALL combine the provider name and provider user ID in the format "provider:id"
5. WHEN the Session JWT is created, THEN the OAuth Backend SHALL redirect the Client Application with the token in the URL fragment

### Requirement 7

**User Story:** As a developer, I want to configure OAuth providers through environment variables, so that credentials can be managed securely.

#### Acceptance Criteria

1. WHEN the OAuth Backend starts, THEN the OAuth Backend SHALL load configuration from environment variables for server port, base URL, allowed redirects, JWT settings, and provider credentials
2. WHEN configuring allowed redirects, THEN the OAuth Backend SHALL parse a comma-separated list of valid redirect URLs
3. WHERE the provider is Google, the OAuth Backend SHALL load client ID, client secret, authorization URL, token URL, and userinfo URL from environment variables
4. WHERE the provider is GitHub, the OAuth Backend SHALL load client ID, client secret, authorization URL, token URL, and userinfo URL from environment variables
5. WHEN required environment variables are missing, THEN the OAuth Backend SHALL fail to start with a clear error message

### Requirement 8

**User Story:** As a developer, I want a modular provider system, so that additional OAuth providers can be easily added.

#### Acceptance Criteria

1. WHEN implementing a provider, THEN the OAuth Backend SHALL define a provider object with name, URLs, credentials, scope, and methods for building auth parameters, exchanging codes, and getting user info
2. WHEN selecting a provider, THEN the OAuth Backend SHALL look up the provider by name from a registry of available providers
3. IF an unsupported provider is requested, THEN the OAuth Backend SHALL return an error indicating the provider is not supported
4. WHEN adding a new provider, THEN the OAuth Backend SHALL only require creating a new provider module without modifying core authentication logic
5. WHEN a provider module is created, THEN the OAuth Backend SHALL ensure it implements the buildAuthParams, exchangeCode, and getUser methods

### Requirement 9

**User Story:** As a developer, I want proper error handling in OAuth flows, so that failures are communicated clearly to users.

#### Acceptance Criteria

1. IF the Provider returns an error in the callback, THEN the OAuth Backend SHALL return the error to the client with appropriate status code
2. IF an invalid redirect URL is provided, THEN the OAuth Backend SHALL reject the request with a 400 status code
3. IF an invalid state parameter is received, THEN the OAuth Backend SHALL reject the callback with a 400 status code
4. IF the token exchange fails, THEN the OAuth Backend SHALL propagate the error to the client
5. IF the userinfo request fails, THEN the OAuth Backend SHALL propagate the error to the client

### Requirement 10

**User Story:** As a developer, I want CORS configured properly, so that web applications can communicate with the OAuth backend.

#### Acceptance Criteria

1. WHEN the OAuth Backend receives a cross-origin request, THEN the OAuth Backend SHALL allow requests from any origin
2. WHEN handling CORS requests, THEN the OAuth Backend SHALL enable credentials support for cookie-based authentication
3. WHEN responding to preflight requests, THEN the OAuth Backend SHALL include appropriate CORS headers
4. WHEN the OAuth Backend starts, THEN the OAuth Backend SHALL configure CORS middleware before route handlers
5. WHEN production deployment occurs, THEN the OAuth Backend SHALL restrict allowed origins to specific domains

### Requirement 11

**User Story:** As a system administrator, I want health check endpoints, so that I can monitor the OAuth backend status.

#### Acceptance Criteria

1. WHEN a GET request is made to /health, THEN the OAuth Backend SHALL respond with a 200 status code and "ok" message
2. WHEN the health endpoint is called, THEN the OAuth Backend SHALL respond without requiring authentication
3. WHEN monitoring systems check health, THEN the OAuth Backend SHALL respond within 100 milliseconds
4. WHEN the server is starting up, THEN the OAuth Backend SHALL log the port number it is listening on
5. WHEN the server fails to start, THEN the OAuth Backend SHALL log the error and exit with a non-zero status code
