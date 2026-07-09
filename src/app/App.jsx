import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Lenis from 'lenis';
import Navbar from '../components/layout/Navbar';
import DonateModal from '../components/ui/DonateModal';
import ContactModal from '../components/ui/ContactModal';
import AdoptionModal from '../components/ui/AdoptionModal';
import { ModalProvider } from '../context/ModalContext';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../features/auth/store/authStore';

export default function App() {
  const initAuth = useAuthStore(state => state.initAuth);

  useEffect(() => {
    initAuth();
    
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <ModalProvider>
      <div className="bg-[#0a0a0a] min-h-screen text-[#e5e5e5] selection:bg-[#bd905b] selection:text-black">
        {/* Film grain overlay for cinematic texture */}
        <div className="film-grain"></div>

        {/* Main classic Navbar */}
        <Navbar />

        {/* Full-screen Donate Modal */}
        <DonateModal />

        {/* Full-screen Contact Modal */}
        <ContactModal />

        {/* Full-screen Adoption Modal */}
        <AdoptionModal />

        {/* Toast Notifications */}
        <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />

        {/* Page content */}
        <main>
          <Outlet />
        </main>
      </div>
    </ModalProvider>
  );
}
