import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { router } from './router'
import './styles/index.css'

import { ModalProvider } from './context/ModalContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <ModalProvider>
        <RouterProvider router={router} />
      </ModalProvider>
    </HelmetProvider>
  </StrictMode>,
)
