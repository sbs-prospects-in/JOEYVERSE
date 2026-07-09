import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import Navbar from './components/layout/Navbar';
import ContactModal from './components/ui/ContactModal';
import { ModalProvider } from './context/ModalContext';

export default function App() {
  const location = useLocation();

  useEffect(() => {
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

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  return (
    <ModalProvider>
      <div className="bg-[#0a0a0a] min-h-screen text-[#e5e5e5] selection:bg-[#bd905b] selection:text-black">
        {/* Film grain overlay for cinematic texture */}
        <div className="film-grain"></div>

        {/* Main classic Navbar */}
        <Navbar />

        {/* Full-screen Contact Modal */}
        <ContactModal />

        {/* Page content */}
        <main>
          <Outlet />
        </main>
      </div>
    </ModalProvider>
  );
}
