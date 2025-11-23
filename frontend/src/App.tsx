import { useState } from 'react'
import './App.css'

interface User {
  id: string
  email: string
  name: string
}

const OAUTH_MODAL_URL = 'http://localhost:5173'
const AUTH_SERVER_URL = 'http://localhost:3001'
const CLIENT_ID = 'a40f69c28a6688d2afa41f7477f51db9' // Replace with actual client ID
const REDIRECT_URI = 'http://localhost:5174/callback'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const generatePKCE = () => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const codeVerifier = btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    
    return { codeVerifier }
  }

  const openOAuthModal = async () => {
    setLoading(true)
    
    const { codeVerifier } = generatePKCE()
    const state = Math.random().toString(36).substring(7)
    
    // Store for later use
    sessionStorage.setItem('oauth_verifier', codeVerifier)
    sessionStorage.setItem('oauth_state', state)
    
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      state
    })

    const modalUrl = `${OAUTH_MODAL_URL}?${params}`
    const popup = window.open(modalUrl, 'oauth', 'width=400,height=600,scrollbars=yes,resizable=yes')
    
    const messageHandler = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_RESULT') {
        window.removeEventListener('message', messageHandler)
        
        if (event.data.code) {
          exchangeCodeForToken(event.data.code, codeVerifier)
        } else {
          setLoading(false)
          console.error('OAuth error:', event.data.error)
        }
      }
    }
    
    window.addEventListener('message', messageHandler)
    
    // Handle popup closed manually
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        window.removeEventListener('message', messageHandler)
        setLoading(false)
      }
    }, 1000)
  }

  const exchangeCodeForToken = async (code: string, codeVerifier: string) => {
    try {
      const response = await fetch(`${AUTH_SERVER_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          client_id: CLIENT_ID,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier
        })
      })

      const tokens = await response.json()
      
      if (tokens.access_token) {
        await fetchUserInfo(tokens.access_token)
      }
    } catch (error) {
      console.error('Token exchange failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserInfo = async (accessToken: string) => {
    try {
      const response = await fetch(`${AUTH_SERVER_URL}/userinfo`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      
      const userData = await response.json()
      setUser(userData)
      
      // Store token for future use
      localStorage.setItem('access_token', accessToken)
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('access_token')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>QSO Wallet Example App</h1>
        
        {user ? (
          <div className="user-info">
            <div className="user-card">
              <h3>Welcome, {user.name}!</h3>
              <p>Email: {user.email}</p>
              <p>ID: {user.id}</p>
            </div>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <div className="login-section">
            <p>Connect your wallet to get started</p>
            <button 
              onClick={openOAuthModal} 
              disabled={loading}
              className="connect-btn"
            >
              {loading ? 'Connecting...' : 'Connect QSO Wallet'}
            </button>
          </div>
        )}
      </header>
    </div>
  )
}

export default App