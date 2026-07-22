import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#1f2937',
            fontFamily: '-apple-system, BlinkMacSystemFont, "San Francisco", sans-serif',
            fontSize: '14px',
            borderRadius: '999px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
            border: '1px solid #f3f4f6',
            padding: '12px 24px',
            marginTop: '16px',
            maxWidth: '90vw'
          },
          success: {
            iconTheme: {
              primary: '#e05b3d',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </>
  );
}
