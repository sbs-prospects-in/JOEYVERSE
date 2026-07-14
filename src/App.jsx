import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

export default function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Navbar Shared Component — style later */}
      <Navbar />

      {/* Main Content Slot — style later */}
      <main style={{ flexGrow: 1 }}>
        <Outlet />
      </main>

      {/* Footer Shared Component — style later */}
      <Footer />

    </div>
  );
}
