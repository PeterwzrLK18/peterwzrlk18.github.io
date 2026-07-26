import './styles/tailwind.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

// SPA fallback for GitHub Pages:
// consume the path stashed by public/404.html and restore it via history API
// so react-router picks up the correct route.
(function restoreRoute() {
  try {
    const stashed = sessionStorage.getItem('spa-redirect');
    if (stashed) {
      sessionStorage.removeItem('spa-redirect');
      // only restore if we actually landed on "/" after redirect
      if (window.location.pathname === '/' && !window.location.hash) {
        window.history.replaceState(null, '', stashed);
      }
    }
  } catch {
    // sessionStorage 可能被隐私模式禁用,忽略即可
  }
})();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
