import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;
if (typeof window.global === 'undefined') {
  window.global = window;
}
window.process = window.process || { env: {} };
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>
)
