import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AlertProvider } from './context/AlertContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AlertProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AlertProvider>
  </StrictMode>,
)
