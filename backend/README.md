# Quso OAuth Backend

OAuth 2.0 authentication backend for Quso Wallet with Google and GitHub providers.

## Features

- OAuth 2.0 Authorization Code flow with PKCE
- Support for Google and GitHub identity providers
- JWT-based session tokens
- State parameter validation for CSRF protection
- Modular provider system for easy extensibility
- CORS support for web and mobile clients

## Table of Contents

- [Setup](#setup)
- [Development](#development)
- [Testing](#testing)
- [Production](#production)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [OAuth Flow](#oauth-flow)
- [Client In

3. Configure OAuth credentials:
   - Create OAuth apps in Google Cloud Console and GitHub
   - Add the client IDs and secrets to your `.env` file
   - Set your allowed redirect URLs

## Development

Run the development server:
```bash
npm run dev
```

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Production

Build the project:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Environment Variables

See `.env.example` for all required environment variables.

### Required Variables

The following environment variables are required and the application will fail to start if any are missing:

- `BASE_URL` - Base URL of the OAuth backend server
- `ALLOWED_REDIRECTS` - Comma-separated list of allowed redirect URLs
- `JWT_SECRET` - Secret key for signing JWT tokens
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret

### Optional Variables

- `PORT` - Server port (default: 3000)
- `JWT_EXPIRES` - JWT expiration time (default: 7d)
- Provider URLs (defaults are provided for standard OAuth endpoints)

## API Endpoints

- `GET /auth/start?provider={google|github}&redirect_to={url}` - Initiate OAuth flow
- `GET /auth/callback?code={code}&state={state}` - OAuth callback handler
- `GET /health` - Health check endpoint

## License

MIT
