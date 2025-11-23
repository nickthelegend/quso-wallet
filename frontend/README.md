# QSO Wallet Example App

Example application demonstrating how to integrate the QSO Wallet OAuth modal.

## Setup

1. **Start the OAuth Server:**
   ```bash
   cd ../kyuso-auth-server
   npm install
   npm run dev  # Port 3001
   ```

2. **Start the OAuth Modal:**
   ```bash
   cd ../kyuso-modal-ui
   npm install
   npm run dev  # Port 5173
   ```

3. **Register OAuth Client:**
   ```bash
   curl -X POST http://localhost:3001/clients \
     -H "Content-Type: application/json" \
     -d '{"name": "Example App", "redirect_uri": "http://localhost:5174/callback"}'
   ```

4. **Update Client ID:**
   - Copy the `client_id` from step 3
   - Update `CLIENT_ID` in `src/App.tsx`

5. **Start Example App:**
   ```bash
   npm install
   npm run dev  # Port 5174
   ```

## How It Works

1. **Click "Connect QSO Wallet"** → Opens OAuth modal popup
2. **Choose Google/GitHub** → Authenticates via Supabase
3. **Modal posts auth code** → Back to parent window
4. **Exchange code for tokens** → Get access token
5. **Fetch user info** → Display user profile

## Integration Code

```javascript
// Open OAuth modal
const popup = window.open(modalUrl, 'oauth', 'width=400,height=600')

// Listen for auth result
window.addEventListener('message', (event) => {
  if (event.data?.type === 'OAUTH_RESULT') {
    // Exchange code for tokens
    exchangeCodeForToken(event.data.code)
  }
})
```

This demonstrates the complete Magic.link-style OAuth flow with popup authentication.