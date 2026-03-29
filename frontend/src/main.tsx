import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Frontend bootstrap: mount the routed React app into the Vite root element.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 
