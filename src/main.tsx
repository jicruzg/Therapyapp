import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function showError(title: string, detail: string) {
  const el = document.getElementById('root')
  if (el) {
    el.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;flex-direction:column;gap:16px;padding:24px;text-align:center;background:#f8f9ff;">
      <div style="font-size:48px;">⚠️</div>
      <h2 style="color:#1e1e2e;margin:0">${title}</h2>
      <pre style="background:#fee2e2;color:#dc2626;padding:16px;border-radius:12px;font-size:12px;max-width:700px;overflow:auto;text-align:left;white-space:pre-wrap;word-break:break-word;">${detail}</pre>
    </div>`
  }
}

window.onerror = (msg, src, line, col, err) => {
  showError('Error de JavaScript', `${msg}\n\nEn: ${src}:${line}:${col}\n\n${err?.stack ?? ''}`)
  return true
}

window.onunhandledrejection = (e) => {
  const reason = e.reason instanceof Error
    ? `${e.reason.message}\n\n${e.reason.stack}`
    : String(e.reason)
  showError('Error de promesa no manejada', reason)
}

const root = document.getElementById('root')!

try {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e) {
  showError('Error al iniciar la aplicación', e instanceof Error ? `${e.message}\n\n${e.stack}` : String(e))
}
