import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './longest-drive-app.jsx'
import { inject } from '@vercel/analytics'

inject()

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
