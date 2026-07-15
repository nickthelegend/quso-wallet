# Quso Wallet

> An OAuth 2.0 authentication backend with PKCE for Google and GitHub, paired with a React example client.

## Overview

Quso Wallet is a small monorepo for adding social sign-in to web and mobile apps without rolling your own credential storage. The `backend/` service implements the OAuth 2.0 Authorization Code flow with PKCE against Google and GitHub, exchanges the authorization code server-side, and issues a signed JWT session token to the client. The `frontend/` directory holds a minimal React example app that demonstrates the "Connect Wallet" integration flow.

It is designed for developers who want a self-hosted, provider-agnostic auth layer: the provider system is modular, so adding a new identity provider is a matter of implementing a single interface.

## Features

- OAuth 2.0 Authorization Code flow with **PKCE** (SHA-256 code challenge, RFC 7636 base64url encoding)
- Built-in **Google** and **GitHub** identity providers behind a shared `OAuthProvider` interface
- **State-parameter validation** for CSRF protection, with per-flow state stored server-side
- **JWT session tokens** (HS256) carrying a normalized user profile (`provider:id`, email, name, avatar)
- **Redirect URL whitelisting** — only pre-approved `redirect_to` targets are allowed
- Environment-driven config with fail-fast validation of required variables on startup
- CORS + cookie support for web and mobile clients
- Unit tests (Jest) plus property-based tests (fast-check) for the PKCE and JWT modules
- React example client showing PKCE generation and a popup-based connect flow

## Tech Stack

**Backend:** TypeScript, Node.js, Express, Axios, jsonwebtoken, cookie-parser, CORS, dotenv · tested with Jest, ts-jest, and fast-check

**Frontend:** React 19, Vite, TypeScript

## Getting Started

### Backend (OAuth server)

```bash
cd backend
npm install

# Configure OAuth credentials
cp .env.example .env
# Edit .env: set JWT_SECRET, ALLOWED_REDIRECTS, and the Google/GitHub
# client IDs & secrets from their respective developer consoles

npm run dev     # start the dev server (ts-node)
npm test        # run the test suite
npm run build   # compile TypeScript to dist/
npm start       # run the compiled server
```

Key endpoints:

- `GET /auth/start?provider={google|github}&redirect_to={url}` — begin the OAuth flow
- `GET /auth/callback?code={code}&state={state}` — provider callback; redirects back with `#token=<jwt>`
- `GET /health` — health check

### Frontend (example app)

```bash
cd frontend
npm install
npm run dev     # start the Vite dev server
```

## Project Structure

```
quso-wallet/
├── backend/                 # OAuth 2.0 + PKCE authentication server
│   ├── src/
│   │   ├── server.ts        # Express app & routes
│   │   ├── auth.ts          # OAuth flow orchestration & state store
│   │   ├── config.ts        # env loading + validation
│   │   ├── pkce.ts          # code verifier / challenge (SHA-256)
│   │   ├── jwt.ts           # session token signing
│   │   └── providers/       # google.ts, github.ts (OAuthProvider impls)
│   └── tests/               # unit & property-based tests
├── frontend/                # React + Vite example client
│   └── src/
└── .kiro/specs/             # requirements / design / tasks docs
```

## License

MIT (see `backend/package.json`).

---

Built by [nickthelegend](https://github.com/nickthelegend) · [nickthelegend.tech](https://nickthelegend.tech)
