import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')!

try {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e) {
  root.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;flex-direction:column;gap:16px;padding:24px;text-align:center;">
    <div style="font-size:48px;">⚠️</div>
    <h2 style="color:#1e1e2e;margin:0">Error al iniciar la aplicación</h2>
    <p style="color:#6b7280;margin:0;max-width:400px">${e instanceof Error ? e.message : 'Error desconocido'}</p>
  </div>`
}
