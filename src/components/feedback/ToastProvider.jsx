import React from 'react';
import { Toaster, ToastBar } from 'react-hot-toast';

export default function ToastProvider({ children }) {
  return (
    <>
      {children}
      <style>{`
        @keyframes customSlideIn {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes customSlideOut {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-100%); opacity: 0; }
        }
      `}</style>
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
      >
        {(t) => (
          <div
            style={{
              animation: t.visible
                ? 'customSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                : 'customSlideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            <ToastBar toast={t} />
          </div>
        )}
      </Toaster>
    </>
  );
}
