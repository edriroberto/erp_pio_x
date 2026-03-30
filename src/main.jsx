import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Verifique se o caminho está correto aqui
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

import { registerSW } from 'virtual:pwa-register'

// Isso registra o Service Worker para funcionar offline
registerSW({ immediate: true })

