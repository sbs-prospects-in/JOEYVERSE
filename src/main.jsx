import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { useAuthStore } from './features/auth/store/authStore'
import './styles/index.css'

// Initialize auth state immediately on boot
useAuthStore.getState().initAuth()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
