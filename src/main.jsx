import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Verifique se o caminho está correto aqui
import './index.css'
import { AuthProvider } from "./contexts/AuthProvider"; // Importação do contexto

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)

import { registerSW } from 'virtual:pwa-register'

// Isso registra o Service Worker para funcionar offline
registerSW({ immediate: true })

