import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Heart } from 'lucide-react';
import { PRIMARY_NAV } from '../../data/nav';
import SocialIconLink from '../ui/SocialIconLink';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-24 bg-footer-bg border-t border-gray-200 footer-watermark pt-16 pb-8 text-gray-600">
      
      {/* 1. Illustration Strip (Animals Peeking Over) */}
      <div className="absolute top-0 left-0 right-0 -translate-y-[99%] flex justify-center items-end gap-6 sm:gap-12 md:gap-16 px-4 overflow-hidden h-[90px] pointer-events-none select-none">
        
        {/* Floppy Eared Dog */}
        <svg viewBox="0 0 100 80" className="w-16 sm:w-20 md:w-24 h-auto text-gray-300 fill-current translate-y-[2px] transition-transform duration-300 hover:-translate-y-2">
          {/* Head */}
          <path d="M20 80 C20 40, 80 40, 80 80 Z" fill="#e5e7eb" />
          {/* Left Ear */}
          <path d="M15 35 C5 35, 10 65, 22 55 Z" fill="#d1d5db" />
          {/* Right Ear */}
          <path d="M85 35 C95 35, 90 65, 78 55 Z" fill="#d1d5db" />
          {/* Eyes */}
          <circle cx="40" cy="55" r="4" fill="#374151" />
          <circle cx="60" cy="55" r="4" fill="#374151" />
          {/* Snout */}
          <ellipse cx="50" cy="65" rx="8" ry="6" fill="#f3f4f6" />
          <polygon points="46,63 54,63 50,68" fill="#374151" />
          {/* Heart collar tag */}
          <path d="M50 78 C48 76, 45 76, 45 78 C45 80, 50 82, 50 82 C50 82, 55 80, 55 78 C55 76, 52 76, 50 78 Z" fill="#e05b3d" />
        </svg>

        {/* Perky Cat */}
        <svg viewBox="0 0 100 80" className="w-14 sm:w-16 md:w-20 h-auto text-gray-300 fill-current translate-y-[2px] transition-transform duration-300 hover:-translate-y-2">
          {/* Head */}
          <path d="M25 80 C25 45, 75 45, 75 80 Z" fill="#d1d5db" />
          {/* Left Ear */}
          <polygon points="25,50 15,20 40,42" fill="#9ca3af" />
          {/* Right Ear */}
          <polygon points="75,50 85,20 60,42" fill="#9ca3af" />
          {/* Eyes */}
          <ellipse cx="40" cy="58" rx="4" ry="3" fill="#374151" />
          <ellipse cx="60" cy="58" rx="4" ry="3" fill="#374151" />
          {/* Nose & Whiskers */}
          <polygon points="48,65 52,65 50,67" fill="#e05b3d" />
          <line x1="32" y1="67" x2="42" y2="66" stroke="#4b5563" strokeWidth="1" />
          <line x1="32" y1="71" x2="42" y2="68" stroke="#4b5563" strokeWidth="1" />
          <line x1="68" y1="67" x2="58" y2="66" stroke="#4b5563" strokeWidth="1" />
          <line x1="68" y1="71" x2="58" y2="68" stroke="#4b5563" strokeWidth="1" />
        </svg>

        {/* Happy Golden Dog */}
        <svg viewBox="0 0 100 80" className="w-18 sm:w-22 md:w-26 h-auto text-gray-300 fill-current translate-y-[2px] transition-transform duration-300 hover:-translate-y-2">
          {/* Head */}
          <path d="M15 80 C15 35, 85 35, 85 80 Z" fill="#fed7aa" />
          {/* Left Droopy Ear */}
          <path d="M12 40 C2 42, 6 70, 18 68 Z" fill="#fdba74" />
          {/* Right Droopy Ear */}
          <path d="M88 40 C98 42, 94 70, 82 68 Z" fill="#fdba74" />
          {/* Eyes */}
          <circle cx="38" cy="52" r="4.5" fill="#374151" />
          <circle cx="62" cy="52" r="4.5" fill="#374151" />
          {/* Snout */}
          <path d="M38 62 C38 58, 62 58, 62 62 C62 70, 38 70, 38 62 Z" fill="#ffedd5" />
          <polygon points="46,60 54,60 50,65" fill="#374151" />
          {/* Tongue peeking out */}
          <path d="M47 67 C47 67, 47 75, 50 75 C53 75, 53 67, 53 67 Z" fill="#fca5a5" />
        </svg>

        {/* Curious Puppy */}
        <svg viewBox="0 0 100 80" className="w-14 sm:w-16 md:w-18 h-auto text-gray-300 fill-current translate-y-[2px] transition-transform duration-300 hover:-translate-y-2">
          {/* Head (tilted slightly) */}
          <g transform="rotate(-5, 50, 60)">
            <path d="M22 80 C22 45, 78 45, 78 80 Z" fill="#f3f4f6" />
            {/* Dark patch on left eye */}
            <path d="M28 50 C28 42, 45 42, 45 55 C45 62, 28 62, 28 50 Z" fill="#e5e7eb" opacity="0.9" />
            {/* Left Ear */}
            <path d="M24 45 C15 35, 12 55, 20 60 Z" fill="#d1d5db" />
            {/* Right Ear */}
            <path d="M76 45 C85 35, 88 55, 80 60 Z" fill="#d1d5db" />
            {/* Eyes */}
            <circle cx="37" cy="54" r="4" fill="#374151" />
            <circle cx="63" cy="54" r="4" fill="#374151" />
            {/* Nose */}
            <ellipse cx="50" cy="62" rx="6" ry="4.5" fill="#374151" />
          </g>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 2. Three Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 text-sm">
          
          {/* Col 1: Brand block */}
          <div className="md:col-span-5 flex flex-col items-start gap-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-900 cursor-pointer">
              <span className="p-1.5 rounded-lg bg-primary text-white flex items-center justify-center">
                <Heart size={16} fill="currentColor" />
              </span>
              <span>Being Kind</span>
            </Link>
            <p className="text-gray-500 leading-relaxed max-w-sm mt-2">
              Because every life matters. We are dedicated to the daily feeding, medical rescue, legal advocacy, and safety of community animals in Ahmedabad, India.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="md:col-span-3 flex flex-col items-start gap-4">
            <h3 className="font-semibold text-gray-900 tracking-wider uppercase text-xs">Quick Links</h3>
            <ul className="space-y-2.5">
              {PRIMARY_NAV.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="hover:text-primary transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Find Us */}
          <div className="md:col-span-4 flex flex-col items-start gap-4">
            <h3 className="font-semibold text-gray-900 tracking-wider uppercase text-xs">Find Us</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                <span>Makarba, Ahmedabad, Gujarat, India - 380051</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-primary shrink-0" />
                <a href="tel:+919876543210" className="hover:text-primary transition-colors">+91 98765 43210</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-primary shrink-0" />
                <a href="mailto:info@beingkind.org" className="hover:text-primary transition-colors">info@beingkind.org</a>
              </div>
            </div>

            <div className="mt-4 w-full">
              <h4 className="font-semibold text-gray-800 text-xs mb-3">Social Media</h4>
              <div className="flex items-center gap-3">
                <SocialIconLink icon={Facebook} href="https://facebook.com" label="Facebook" />
                <SocialIconLink icon={Twitter} href="https://twitter.com" label="Twitter / X" />
                <SocialIconLink icon={Instagram} href="https://www.instagram.com/beingkind_india/" label="Instagram" />
                <SocialIconLink icon={Youtube} href="https://youtube.com" label="YouTube" />
              </div>
            </div>
          </div>

        </div>

        {/* 3. Bottom Legal Bar */}
        <div className="mt-16 pt-8 border-t border-gray-200/60 text-center text-xs text-gray-400">
          <p>
            © {currentYear} Being Kind. All Rights Reserved.{' '}
            <Link to="/terms" className="hover:text-primary transition-colors underline">Terms & Conditions</Link>
            {' '}and{' '}
            <Link to="/privacy" className="hover:text-primary transition-colors underline">Privacy Policy</Link>.
          </p>
        </div>

      </div>
    </footer>
  );
}
