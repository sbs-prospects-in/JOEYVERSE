import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';

const NAV_LINKS = [
  { label: 'Advocacy', href: '#advocacy' },
  { label: 'Campaign', href: '#campaign' },
  { label: 'Stories', href: '#stories' },
  { label: 'Get Involved', href: '#get-involved' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { openDonate, openContact } = useModal();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'py-4 nav-backdrop' : 'py-8 bg-transparent'
      }`}
    >
      <div className="max-w-[1800px] mx-auto px-8 md:px-16 flex items-center justify-between">
        {/* Logo */}
        <a 
          href="#hero" 
          onClick={(e) => scrollTo(e, '#hero')}
          className="text-white font-bold text-xl tracking-widest uppercase flex items-center gap-3"
          aria-label="Being Kind India"
        >
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18.5" stroke="#F7F7F7" strokeWidth="1.2" />
            <circle cx="20" cy="20" r="12" stroke="#F7F7F7" strokeWidth="1" />
          </svg>
          <span className="hidden sm:block">Being Kind</span>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => scrollTo(e, link.href)}
              className="nav-link text-white/80 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="flex items-center gap-6">
          <button
            onClick={openContact}
            className="hidden sm:block text-xs uppercase tracking-[0.2em] text-[#bd905b] hover:text-white transition-colors duration-300"
          >
            Contact Us
          </button>
          <Link
            to="/login"
            className="text-xs uppercase tracking-[0.2em] text-[#bd905b] hover:text-white transition-colors duration-300"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-6 py-3 border border-white/20 rounded-full text-xs uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all duration-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
