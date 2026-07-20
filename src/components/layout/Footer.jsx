import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, PawPrint, ShieldCheck, Clock, 
  Instagram, Facebook, Linkedin, Youtube, Calendar, 
  BookOpen, MessageSquare, Heart, Twitter
} from 'lucide-react';

function TransparentImage({ src, alt, className }) {
  const [transparentSrc, setTransparentSrc] = React.useState(src);

  React.useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      try {
        const threshold = 240;
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        const getIndex = (x, y) => (y * width + x) * 4;
        const queue = [];
        const visited = new Uint8Array(width * height);
        
        const corners = [
          [0, 0],
          [width - 1, 0],
          [0, height - 1],
          [width - 1, height - 1]
        ];
        
        for (const [cx, cy] of corners) {
          const idx = getIndex(cx, cy);
          if (data[idx] > threshold && data[idx + 1] > threshold && data[idx + 2] > threshold) {
            queue.push([cx, cy]);
            visited[cy * width + cx] = 1;
          }
        }
        
        while (queue.length > 0) {
          const [x, y] = queue.shift();
          const idx = getIndex(x, y);
          data[idx + 3] = 0; // Set Alpha = 0 (Transparent)
          
          const neighbors = [
            [x + 1, y],
            [x - 1, y],
            [x, y + 1],
            [x, y - 1]
          ];
          
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (!visited[nIdx]) {
                const pixelIdx = getIndex(nx, ny);
                if (data[pixelIdx] > threshold && data[pixelIdx + 1] > threshold && data[pixelIdx + 2] > threshold) {
                  queue.push([nx, ny]);
                  visited[nIdx] = 1;
                }
              }
            }
          }
        }
        
        ctx.putImageData(imgData, 0, 0);
        setTransparentSrc(canvas.toDataURL());
      } catch (err) {
        console.error("Transparency error:", err);
      }
    };
  }, [src]);

  return <img src={transparentSrc} alt={alt} className={className} />;
}

function SittingCatSVG({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tail */}
      <path d="M78 95 C85 95 90 90 90 80 C90 70 85 62 76 62 C73 62 71 65 71 68 C71 72 74 74 76 74 C80 74 82 78 82 82 C82 86 78 89 74 89 C70 89 67 87 66 84" stroke="#e07e32" strokeWidth="6" strokeLinecap="round" />
      <path d="M78 95 C85 95 90 90 90 80 C90 70 85 62 76 62 C73 62 71 65 71 68 C71 72 74 74 76 74 C80 74 82 78 82 82 C82 86 78 89 74 89 C70 89 67 87 66 84" stroke="#f19e58" strokeWidth="4" strokeLinecap="round" />

      {/* Back feet/body base */}
      <ellipse cx="44" cy="98" rx="14" ry="8" fill="#e07e32" />
      <ellipse cx="76" cy="98" rx="14" ry="8" fill="#e07e32" />
      <ellipse cx="44" cy="98" rx="13" ry="7" fill="#f19e58" />
      <ellipse cx="76" cy="98" rx="13" ry="7" fill="#f19e58" />

      {/* Main Body */}
      <path d="M42 96 C38 80 44 55 60 55 C76 55 82 80 78 96 Z" fill="#f19e58" />
      {/* Chest/Tummy white patch */}
      <path d="M50 72 C45 82 52 96 60 96 C68 96 75 82 70 72 C66 66 54 66 50 72 Z" fill="#fff8f2" />

      {/* Front Paws */}
      <rect x="49" y="88" width="8" height="14" rx="4" fill="#fff8f2" stroke="#d58343" strokeWidth="1" />
      <rect x="63" y="88" width="8" height="14" rx="4" fill="#fff8f2" stroke="#d58343" strokeWidth="1" />

      {/* Collar */}
      <path d="M43 56 C50 62 70 62 77 56" stroke="#4a90e2" strokeWidth="4" strokeLinecap="round" />
      {/* Bell / Fish charm */}
      <circle cx="60" cy="60" r="4.5" fill="#f5a623" />
      <path d="M60 60 L64 57 L64 63 Z" fill="#f5a623" />

      {/* Ears */}
      {/* Left Ear */}
      <path d="M36 42 L25 18 C25 18 36 24 45 28 Z" fill="#d58343" />
      <path d="M37 41 L28 21 C28 21 37 26 44 30 Z" fill="#f19e58" />
      <path d="M37 39 L31 25 C31 25 37 29 42 32 Z" fill="#fbc7cd" /> {/* Inner Pink */}

      {/* Right Ear */}
      <path d="M84 42 L95 18 C95 18 84 24 75 28 Z" fill="#d58343" />
      <path d="M83 41 L92 21 C92 21 83 26 76 30 Z" fill="#f19e58" />
      <path d="M83 39 L89 25 C89 25 83 29 78 32 Z" fill="#fbc7cd" /> {/* Inner Pink */}

      {/* Head */}
      <ellipse cx="60" cy="42" rx="26" ry="21" fill="#f19e58" stroke="#d58343" strokeWidth="1.5" />
      
      {/* White face patches */}
      <path d="M37 46 C37 57 47 62 60 62 C73 62 83 57 83 46 C83 42 73 38 60 38 C47 38 37 42 37 46 Z" fill="#fff8f2" />

      {/* Stripes on Head */}
      <path d="M60 21 L60 27" stroke="#e07e32" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M53 22 L55 27" stroke="#e07e32" strokeWidth="3" strokeLinecap="round" />
      <path d="M67 22 L65 27" stroke="#e07e32" strokeWidth="3" strokeLinecap="round" />
      
      {/* Side whiskers stripes */}
      <path d="M36 43 L42 44" stroke="#e07e32" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M35 48 L40 48" stroke="#e07e32" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M84 43 L78 44" stroke="#e07e32" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M85 48 L80 48" stroke="#e07e32" strokeWidth="2.5" strokeLinecap="round" />

      {/* Eyes */}
      {/* Left Eye: Normal circle */}
      <circle cx="48" cy="46" r="3.5" fill="#2d1c13" />
      <circle cx="47" cy="45" r="1" fill="#ffffff" /> {/* Eye highlight */}
      
      {/* Right Eye: Winking curve */}
      <path d="M69 46 Q73 42 77 46" stroke="#2d1c13" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Cheeks (pink blush) */}
      <ellipse cx="42" cy="51" rx="3.5" ry="2" fill="#ff8b94" opacity="0.6" />
      <ellipse cx="78" cy="51" rx="3.5" ry="2" fill="#ff8b94" opacity="0.6" />

      {/* Nose & Mouth */}
      <polygon points="59,50 61,50 60,51.5" fill="#2d1c13" />
      <path d="M57 53 Q60 55 60 53 Q60 55 63 53" stroke="#2d1c13" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

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
            <div className="flex items-end gap-1 mt-4 relative h-32 w-max select-none bg-white/70 px-4 pt-4 pb-2 rounded-[2rem] shadow-sm border border-white/80 backdrop-blur-md">
              <TransparentImage src="/images/cartoon-dog.png" alt="Cartoon Dog" className="h-28 object-contain drop-shadow-sm" />
              <SittingCatSVG className="h-20 w-20 object-contain ml-[-20px] pb-1 shrink-0 drop-shadow-sm" />
              {/* Heart bubble */}
              <div className="absolute top-2 left-28 bg-rose-500 text-white rounded-full p-1.5 shadow-md animate-bounce">
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
