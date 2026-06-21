import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import GamePage from './GamePage.jsx'

const currentPath = window.location.pathname.replace(/\/+$/, '') || '/'
const isGamePage = currentPath === '/game'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isGamePage ? <GamePage /> : <App />}
  </StrictMode>,
)
