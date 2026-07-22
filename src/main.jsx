import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { router } from './router'
import './styles/index.css'

import { ModalProvider } from './context/ModalContext'
import ToastProvider from './components/feedback/ToastProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <ModalProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </ModalProvider>
    </HelmetProvider>
  </StrictMode>,
)
