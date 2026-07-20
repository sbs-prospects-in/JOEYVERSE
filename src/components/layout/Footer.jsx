import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, PawPrint, ShieldCheck, Clock, 
  Instagram, Facebook, Linkedin, Youtube, Calendar, 
  BookOpen, MessageSquare, Heart, Twitter
} from 'lucide-react';



export default function Footer() {
  return (
    <footer className="relative bg-[#eae3ea] text-slate-700 pt-20 pb-8 font-sans overflow-hidden border-t border-slate-900/5">
      {/* Torn Paper Top Border */}
      <div style={{
        position: 'absolute',
        top: -23,
        left: 0,
        right: 0,
        height: '24px',
        zIndex: 10,
        overflow: 'hidden',
        lineHeight: 0,
        filter: 'drop-shadow(0px -3px 3px rgba(0,0,0,0.04))'
      }}>
        <svg viewBox="0 0 1200 24" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0,24 L0,15 Q30,8 60,18 T120,12 T180,19 T240,10 T300,20 T360,11 T420,17 T480,9 T540,19 T600,12 T660,18 T720,10 T780,20 T840,11 T900,17 T960,9 T1020,19 T1080,12 T1140,18 T1200,10 L1200,24 Z" fill="#eae3ea" />
        </svg>
      </div>

      {/* Diagonal Fading Paw Prints */}
      <div className="absolute bottom-16 right-16 flex gap-6 pointer-events-none opacity-[0.15] text-[#0f172a] z-0 select-none">
        <PawPrint className="w-12 h-12 rotate-12 mt-8" />
        <PawPrint className="w-16 h-16 -rotate-12 mt-3" />
        <PawPrint className="w-20 h-20 rotate-45" />
      </div>

      <div className="container mx-auto px-6 lg:px-8 max-w-[1400px] relative z-10">
        
        {/* TOP SECTION: Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Col 1: Brand & Desc */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-5">
              <img src="/images/logo_icon.png" alt="Joeyverse Icon" className="h-16 md:h-20 w-auto object-contain" />
              <img src="/images/logo_text.png" alt="Joeyverse Text" className="h-7 md:h-9 w-auto object-contain -translate-y-1 ml-2" />
            </div>
            <p className="text-[0.9rem] leading-relaxed text-slate-600">
              Where pet parents find the best care, advice, and support. Trusted connections for happier, healthier pets and a well-balanced life.
            </p>
            <div className="flex flex-col gap-3 mt-1 max-w-[260px]">
              <Link 
                to="/doctors" 
                className="bg-slate-900 text-white hover:bg-slate-800 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm text-sm"
              >
                <Calendar className="w-4.5 h-4.5" /> Book Appointment
              </Link>
              <Link 
                to="/doctors" 
                className="bg-transparent border border-slate-900/20 hover:bg-slate-900/5 text-slate-800 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm"
              >
                <Phone className="w-4.5 h-4.5 text-slate-700" /> Contact Now
              </Link>
            </div>
            
            {/* Cartoon Pets Sitting Side-by-Side */}
            <div className="flex items-end gap-1 mt-4 relative h-28 w-max select-none" style={{ colorScheme: 'light only' }}>
              <div 
                className="h-28 w-[80px]" 
                style={{ 
                  backgroundImage: "url('/images/cartoon-dog-transparent.png')", 
                  backgroundSize: "contain", 
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "bottom"
                }} 
              />
              <div 
                className="h-20 w-20 ml-[-20px] pb-1 shrink-0" 
                style={{ 
                  backgroundImage: "url('/images/sitting-cat.png')", 
                  backgroundSize: "contain", 
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "bottom"
                }} 
              />
              {/* Heart bubble */}
              <div className="absolute top-4 left-14 bg-rose-500 text-white rounded-full p-1.5 shadow-md animate-bounce">
                <Heart className="w-3 h-3 fill-current text-white" />
              </div>
            </div>
          </div>

          {/* Col 2: Pages */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-rose-600" />
              <h4 className="text-lg font-bold text-slate-900 tracking-wide">Pages</h4>
            </div>
            <ul className="flex flex-col gap-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'About Us', path: '/why-choose-us' },
                { name: 'Services', path: '/services' },
                { name: 'Our Team', path: '/doctors' },
                { name: 'Blog', path: '/blogs' },
                { name: 'FAQs', path: '/faqs' },
              ].map((link, i) => (
                <li key={i} className="border-b border-dashed border-slate-900/10 pb-2.5 last:border-0 last:pb-0">
                  <Link to={link.path} className="flex items-center gap-2 text-sm text-slate-600 hover:text-rose-600 transition-colors group">
                    <span className="text-slate-400 group-hover:text-rose-600 transition-colors">›</span> {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Phone className="w-5 h-5 text-rose-600" />
              <h4 className="text-lg font-bold text-slate-900 tracking-wide">Contact</h4>
            </div>
            <ul className="flex flex-col gap-5">
              <li className="flex items-start gap-3.5 text-sm text-slate-600">
                <MapPin className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <a 
                  href="https://maps.google.com/?q=1003,+Span+Trade+Center,+Paldi,+Ahmedabad" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-rose-600 transition-colors"
                >
                  1003, Span Trade Center,<br/>Paldi, Ahmedabad
                </a>
              </li>
              <li className="flex items-center gap-3.5 text-sm text-slate-600">
                <Mail className="w-5 h-5 text-rose-600 shrink-0" />
                <span>joeyverse2025@gmail.com</span>
              </li>
              <li className="flex items-center gap-3.5 text-sm text-slate-600">
                <Phone className="w-5 h-5 text-rose-600 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3.5 text-sm text-slate-600">
                <Clock className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Mon - Sat: 9:00 AM - 7:00 PM</span>
              </li>
              <li className="flex items-center gap-3.5 text-sm text-slate-600">
                <MessageSquare className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Chat with us: +91 98765 43210</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Mail className="w-5 h-5 text-rose-600" />
              <h4 className="text-lg font-bold text-slate-900 tracking-wide">Newsletter</h4>
            </div>
            <p className="text-sm mb-6 text-slate-600 leading-relaxed">
              Get pet tips, care guides & updates straight to your inbox.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required 
                className="bg-white/60 border border-slate-900/10 focus:border-slate-900/30 outline-none rounded-xl px-4 py-3.5 text-sm text-slate-950 w-full transition-colors placeholder:text-slate-500"
              />
              <button 
                type="submit" 
                className="bg-slate-900 text-white hover:bg-slate-800 font-bold rounded-xl px-4 py-3.5 text-sm w-full transition-colors shadow-sm"
              >
                Subscribe Now
              </button>
            </form>
            <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>We respect your privacy. No spam.</span>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-slate-900/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-xs text-slate-500">
              © 2026 Joeyverse. All rights reserved.
            </p>
            <p className="text-xs text-slate-500">
              Managed by <a href="https://www.sbsquantum.com/" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline font-medium">SBS Quantum</a>
            </p>
          </div>
          
          <div className="flex gap-2">
            <a href="#" className="w-9 h-9 rounded-full bg-slate-900/5 flex items-center justify-center text-slate-700 hover:bg-slate-900/10 transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-full bg-slate-900/5 flex items-center justify-center text-slate-700 hover:bg-slate-900/10 transition-colors"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-full bg-slate-900/5 flex items-center justify-center text-slate-700 hover:bg-slate-900/10 transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-full bg-slate-900/5 flex items-center justify-center text-slate-700 hover:bg-slate-900/10 transition-colors"><Linkedin className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-full bg-slate-900/5 flex items-center justify-center text-slate-700 hover:bg-slate-900/10 transition-colors"><Youtube className="w-4 h-4" /></a>
          </div>

          <div className="flex gap-4 text-xs text-slate-500">
            <Link to="/terms-of-use" className="hover:text-slate-700 transition-colors">Terms & Conditions</Link>
            <span>|</span>
            <Link to="/privacy-policy" className="hover:text-slate-700 transition-colors">Privacy Policy</Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
