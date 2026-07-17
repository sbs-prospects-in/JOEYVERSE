import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { useAuthStore } from './features/auth/store/authStore';

// Modals
import ContactModal from './components/ui/ContactModal';
import AdoptionModal from './components/ui/AdoptionModal';
import DonateModal from './components/ui/DonateModal';

export default function App() {
  const location = useLocation();
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Navbar Shared Component — style later */}
      {!location.pathname.startsWith('/doctor') && !location.pathname.startsWith('/pet-owner') && <Navbar />}

      {/* Main Content Slot — style later */}
      <main style={{ flexGrow: 1 }}>
        <Outlet />
      </main>

      {/* Footer Shared Component — style later */}
      {!location.pathname.startsWith('/doctor') && !location.pathname.startsWith('/pet-owner') && <Footer />}

      {/* Global Modals */}
      <ContactModal />
      <AdoptionModal />
      <DonateModal />
    </div>
  );
}
