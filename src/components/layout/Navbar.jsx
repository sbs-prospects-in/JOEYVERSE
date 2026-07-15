import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/authStore';

const NAV_LINKS = [
  { label: 'Home', href: '/', bgActive: 'bg-rose-100 text-rose-700 border-rose-200/50 shadow-sm rotate-[-1.5deg]', hoverStyle: 'hover:bg-rose-50 hover:text-rose-600' },
  { label: 'Doctors', href: '/doctors', bgActive: 'bg-sky-100 text-sky-700 border-sky-200/50 shadow-sm rotate-[1deg]', hoverStyle: 'hover:bg-sky-50 hover:text-sky-600' },
  { label: 'Services', href: '/services', bgActive: 'bg-yellow-100 text-yellow-800 border-yellow-250/50 shadow-sm rotate-[-1.2deg]', hoverStyle: 'hover:bg-yellow-50 hover:text-yellow-700' },
  { label: 'Success Stories', href: '/success-stories', bgActive: 'bg-purple-100 text-purple-700 border-purple-200/50 shadow-sm rotate-[1.5deg]', hoverStyle: 'hover:bg-purple-50 hover:text-purple-600' },
  { label: 'Why Choose Us?', href: '/why-choose-us', bgActive: 'bg-emerald-100 text-emerald-700 border-emerald-250/50 shadow-sm rotate-[-1deg]', hoverStyle: 'hover:bg-emerald-50 hover:text-emerald-600' }
];

function PawSVG({ size, color, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
      <ellipse cx="12" cy="15" rx="7" ry="6"/>
      <ellipse cx="4.5" cy="8" rx="2.6" ry="3.2"/>
      <ellipse cx="9.5" cy="4.5" rx="2.6" ry="3.3"/>
      <ellipse cx="14.5" cy="4.5" rx="2.6" ry="3.3"/>
      <ellipse cx="19.5" cy="8" rx="2.6" ry="3.2"/>
    </svg>
  );
}

export default function Navbar() {
  const location = useLocation();
  const { user, role, isLoading, logout } = useAuthStore();
  const [driftItems, setDriftItems] = useState([]);
  const [trailRuns, setTrailRuns] = useState([]);

  useEffect(() => {
    const colors = ['#FFC857', '#6EC9A0', '#FF9D80', '#A9DFBF', '#93C5FD'];
    const pick = () => colors[Math.floor(Math.random() * colors.length)];

    // Build drift items
    const drifts = [];
    for (let i = 0; i < 8; i++) {
      drifts.push({
        id: i,
        size: 10 + Math.random() * 12,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 6,
        dx: `${(Math.random() * 60 - 30).toFixed(0)}px`,
        r0: `${(Math.random() * 40 - 20).toFixed(0)}deg`,
        r1: `${(Math.random() * 90 - 45).toFixed(0)}deg`,
        color: pick()
      });
    }
    setDriftItems(drifts);

    // Build trail runs
    const trails = [];
    for (let t = 0; t < 2; t++) {
      const duration = 12 + Math.random() * 6;
      const steps = [];
      const color = pick();
      const numSteps = 12;
      for (let s = 0; s < numSteps; s++) {
        steps.push({
          id: s,
          size: 8 + (s % 2) * 3,
          left: `${(s * (100 / numSteps))}%`,
          top: s % 2 === 0 ? '2px' : '14px',
          delay: `${(s * (duration / numSteps / 1.6)).toFixed(2)}s`
        });
      }
      trails.push({
        id: t,
        top: `${15 + Math.random() * 40}%`,
        duration: `${duration}s`,
        delay: `${t * 6}s`,
        color,
        steps
      });
    }
    setTrailRuns(trails);
  }, []);

  return (
    <div className="w-full fixed top-6 left-0 right-0 z-50 px-4 md:px-6 pointer-events-none flex justify-center">
      <header 
        className="w-full max-w-[1200px] bg-white/95 border border-slate-200/60 rounded-full px-6 py-2.5 shadow-md flex items-center justify-between pointer-events-auto backdrop-blur-md relative overflow-hidden"
      >
        {/* Style sheet override for keyframes */}
        <style>{`
          @keyframes navbar-drift {
            0% { transform: translateY(15px) translateX(0) rotate(var(--r0)); opacity: 0; }
            15% { opacity: 0.75; }
            80% { opacity: 0.7; }
            100% { transform: translateY(-50px) translateX(var(--dx)) rotate(var(--r1)); opacity: 0; }
          }
          .navbar-drift {
            position: absolute;
            bottom: -15px;
            opacity: 0;
            animation: navbar-drift linear infinite;
          }
          @keyframes trail-run-anim {
            0% { transform: translateX(-10%); }
            100% { transform: translateX(110vw); }
          }
          .navbar-trail-run {
            position: absolute;
            left: 0;
            width: 100%;
            height: 36px;
            animation: trail-run-anim linear infinite;
            pointer-events: none;
          }
          @keyframes step-pop {
            0% { opacity: 0; transform: scale(.4); }
            18% { opacity: 0.8; transform: scale(1); }
            75% { opacity: 0.75; }
            100% { opacity: 0; transform: scale(.9); }
          }
          .navbar-step {
            position: absolute;
            opacity: 0;
            animation: step-pop 1.4s ease-out forwards;
          }
        `}</style>

        {/* Layer 1: Ambient drifting paws */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {driftItems.map((item) => (
            <div
              key={item.id}
              className="navbar-drift"
              style={{
                left: `${item.left}%`,
                '--dx': item.dx,
                '--r0': item.r0,
                '--r1': item.r1,
                animationDelay: `${item.delay}s`,
                animationDuration: `${item.duration}s`,
              }}
            >
              <PawSVG size={item.size} color={item.color} />
            </div>
          ))}
        </div>

        {/* Layer 2: Walking trail run paws */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {trailRuns.map((trail) => (
            <div
              key={trail.id}
              className="navbar-trail-run"
              style={{
                top: trail.top,
                animationDuration: trail.duration,
                animationDelay: trail.delay
              }}
            >
              {trail.steps.map((step) => (
                <div
                  key={step.id}
                  className="navbar-step"
                  style={{
                    left: step.left,
                    top: step.top,
                    animationDelay: step.delay
                  }}
                >
                  <PawSVG size={step.size} color={trail.color} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Brand Logo with Paw circle */}
        <Link 
          to="/" 
          className="text-slate-900 font-extrabold text-lg md:text-xl tracking-tight flex items-center gap-2 cursor-pointer relative z-10"
          aria-label="Joeyverse"
        >
          <div className="w-8 h-8 rounded-full bg-[#f472b6] flex items-center justify-center text-black shrink-0">
            <PawPrint className="h-6 w-6 text-rose-500 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <span>Joeyverse</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-3 relative z-10">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.label}
                to={link.href}
                className={`px-3 py-1.5 rounded-full border border-transparent text-xs font-black tracking-tight transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? `${link.bgActive} border-slate-200` 
                    : `text-slate-650 ${link.hoverStyle} hover:scale-105 active:scale-95`
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-4 relative z-10">
          {!isLoading && (
            user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 text-xs uppercase tracking-wider font-bold text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                >
                  Sign Out
                </button>
                <Link
                  to={role === 'admin' ? '/admin/dashboard' : role === 'doctor' ? '/doctor/dashboard' : '/pet-owner/dashboard'}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#f2687c] to-amber-500 hover:from-amber-500 hover:to-[#f2687c] text-white text-xs uppercase tracking-wider rounded-full font-black shadow-md hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 cursor-pointer border border-white/50"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <Link
                to="/sign-in"
                className="px-5 py-2.5 bg-gradient-to-r from-[#f2687c] to-amber-500 hover:from-amber-500 hover:to-[#f2687c] text-white text-xs uppercase tracking-wider rounded-full font-black shadow-md hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 cursor-pointer border border-white/50"
              >
                Sign In
              </Link>
            )
          )}
        </div>

      </header>
    </div>
  );
}
