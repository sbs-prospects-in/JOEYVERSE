import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, PhoneCall, ShieldAlert, PawPrint, Heart } from 'lucide-react';

// Hand-Drawn Sketch Doodle Components matching Success Stories theme
function BoneDoodle({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24,15 C20,15 16,19 16,23 C16,27 20,31 24,31 C25,31 26,30.8 27,30.5 L73,30.5 C74,30.8 75,31 76,31 C80,31 84,27 84,23 C84,19 80,15 76,15 C75,15 74,15.2 73,15.5 L27,15.5 C26,15.2 25,15 24,15 Z" />
      <path d="M24,45 C20,45 16,41 16,37 C16,33 20,29 24,29 C25,29 26,29.2 27,29.5 L73,29.5 C74,29.2 75,29 76,29 C80,29 84,33 84,37 C84,41 80,45 76,45 C75,45 74,44.8 73,44.5 L27,44.5 C26,44.8 25,45 24,45 Z" />
    </svg>
  );
}

function FishDoodle({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10,30 C30,10 70,10 90,30 C70,50 30,50 10,30 Z" />
      <path d="M80,30 L95,15 L90,30 L95,45 Z" />
      <circle cx="28" cy="25" r="2" fill="currentColor" />
      <path d="M45,20 L45,40" />
      <path d="M58,20 L58,40" />
    </svg>
  );
}

function CatFaceDoodle({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20,45 C20,70 80,70 80,45 C80,25 65,30 50,30 C35,30 20,25 20,45 Z" />
      <path d="M23,32 L15,10 L35,28" />
      <path d="M77,32 L85,10 L65,28" />
      <path d="M35,45 Q40,40 45,45" />
      <path d="M55,45 Q60,40 65,45" />
      <path d="M50,52 L47,55 H53 Z" />
      <path d="M44,60 Q50,65 50,60 Q50,65 56,60" />
      <path d="M12,50 L28,52" />
      <path d="M10,58 L28,56" />
      <path d="M88,50 L72,52" />
      <path d="M90,58 L72,56" />
    </svg>
  );
}

function DogFaceDoodle({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30,30 C20,30 20,60 30,60 C40,60 50,55 50,55 C50,55 60,60 70,60 C80,60 80,30 70,30 C60,30 50,35 50,35 C50,35 40,30 30,30 Z" />
      <path d="M23,32 C10,32 10,65 20,75 C25,80 32,70 32,60" />
      <path d="M77,32 C90,32 90,65 80,75 C75,80 68,70 68,60" />
      <circle cx="40" cy="45" r="3.5" fill="currentColor" />
      <circle cx="60" cy="45" r="3.5" fill="currentColor" />
      <path d="M46,55 Q50,51 54,55 Z" fill="currentColor" />
      <path d="M48,64 Q50,75 52,64 Z" fill="currentColor" />
    </svg>
  );
}

function PawDoodle({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M32,62 C32,50 68,50 68,62 C68,75 32,75 32,62 Z" />
      <circle cx="26" cy="40" r="8" fill="none" />
      <circle cx="42" cy="28" r="9" fill="none" />
      <circle cx="58" cy="28" r="9" fill="none" />
      <circle cx="74" cy="40" r="8" fill="none" />
    </svg>
  );
}

function FlowerDoodle({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="50" cy="50" r="10" />
      <circle cx="50" cy="25" r="12" />
      <circle cx="50" cy="75" r="12" />
      <circle cx="25" cy="50" r="12" />
      <circle cx="75" cy="50" r="12" />
    </svg>
  );
}

function YarnBallDoodle({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="50" cy="50" r="28" />
      <path d="M28,38 Q50,68 72,38" />
      <path d="M28,62 Q50,32 72,62" />
      <path d="M38,28 Q68,50 38,72" />
      <path d="M62,28 Q32,50 62,72" />
    </svg>
  );
}

export default function Consult() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 max-w-[1280px] mx-auto flex items-center justify-center relative overflow-hidden">
      
      {/* Mesh Background Blobs for Visual Glow */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-rose-200/20 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-sky-200/20 blur-3xl pointer-events-none z-0" />

      {/* Wobbly & Sway Animation Styles */}
      <style>{`
        @keyframes wobble {
          0%, 100% { border-radius: 55% 45% 65% 35%; }
          50% { border-radius: 45% 55% 35% 65%; }
        }
        .wobble-border {
          animation: wobble 8s ease-in-out infinite;
        }
        @keyframes swayDoodle1 {
          0%, 100% { transform: translateY(0px) rotate(4deg); }
          50% { transform: translateY(-12px) rotate(-4deg); }
        }
        @keyframes swayDoodle2 {
          0%, 100% { transform: translateY(0px) rotate(-4deg); }
          50% { transform: translateY(-12px) rotate(4deg); }
        }
        .sway-doodle-1 {
          animation: swayDoodle1 6s ease-in-out infinite;
        }
        .sway-doodle-2 {
          animation: swayDoodle2 7s ease-in-out infinite;
          animation-delay: 1.2s;
        }
      `}</style>

      {/* Floating Hand-Drawn Sketch Doodles Background */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <CatFaceDoodle className="absolute top-24 left-8 w-16 h-16 text-purple-300/25 sway-doodle-1 hidden lg:block" />
        <DogFaceDoodle className="absolute top-[420px] right-12 w-16 h-16 text-pink-300/25 sway-doodle-2 hidden lg:block" />
        <BoneDoodle className="absolute bottom-[160px] left-10 w-20 h-12 text-amber-300/25 sway-doodle-1 hidden lg:block" />
        <PawDoodle className="absolute top-28 right-1/4 w-14 h-14 text-emerald-300/25 sway-doodle-2 hidden lg:block" />
        <FishDoodle className="absolute bottom-28 right-8 w-16 h-12 text-sky-300/25 sway-doodle-1 hidden lg:block" />
        <YarnBallDoodle className="absolute top-[480px] left-[15%] w-16 h-16 text-purple-300/25 sway-doodle-2 hidden lg:block" />
      </div>

      {/* ==========================================
         GLASS CONSOLE CONTAINER (MINIMALIST TINTED BLUE)
         ========================================== */}
      <div className="relative w-full max-w-5xl rounded-[36px] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-sky-300/30 bg-sky-50/15 backdrop-blur-md z-10">
        
        {/* Left Column: Form & Callouts */}
        <div className="flex-[1.2] p-8 md:p-12 lg:p-14 flex flex-col justify-center">
          
          {/* Header Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-100 text-[0.65rem] font-bold text-rose-600 uppercase tracking-widest w-max mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Support Hotline
          </div>

          {/* Heading */}
          <h1 className="text-slate-800 text-4xl md:text-5xl font-black tracking-tight leading-tight mb-2">
            Request A <span className="text-[#f2687c] italic font-serif">Callback</span>
          </h1>
          
          {/* Subtitle Description */}
          <p className="text-slate-500 text-xs md:text-sm max-w-md mb-8 leading-relaxed font-medium">
            Leave your contact details below. A clinician panel coordinator will reach out to you within 15 minutes.
          </p>

          {/* Form */}
          <form 
            className="flex flex-col gap-4 max-w-[460px] w-full"
            onSubmit={(e) => { 
              e.preventDefault(); 
              alert('Callback requested successfully! A triage coordinator will call you back within 15 minutes.'); 
            }}
          >
            {/* Name Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-[0.65rem] font-black text-slate-600 uppercase tracking-widest pl-1">
                Full Name
              </label>
              <input 
                type="text" 
                id="name" 
                required 
                placeholder="Dr. Mark Olsen" 
                className="w-full bg-white/50 border border-sky-200/50 focus:border-sky-500 focus:bg-white px-4 py-3 rounded-xl outline-none text-slate-700 text-sm transition-all shadow-sm"
              />
            </div>

            {/* Mobile Number & OTP */}
            <div className="flex flex-col gap-2">
              <label htmlFor="mobile" className="text-[0.65rem] font-black text-slate-600 uppercase tracking-widest pl-1">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <input 
                  type="tel" 
                  id="mobile" 
                  required 
                  placeholder="Enter your mobile number" 
                  className="w-full bg-white/50 border border-sky-200/50 focus:border-sky-500 focus:bg-white pl-4 pr-28 py-3 rounded-xl outline-none text-slate-700 text-sm transition-all shadow-sm"
                />
                <button 
                  type="button" 
                  onClick={() => alert('OTP verification code sent!')}
                  className="absolute right-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[0.65rem] font-black uppercase tracking-wider rounded-lg shadow-sm transition-all active:scale-95"
                >
                  Send OTP
                </button>
              </div>
            </div>

            {/* Submit & Indicators Row */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-6">
              <button 
                type="submit" 
                className="bg-slate-900 hover:bg-[#f2687c] text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md w-max"
              >
                Submit 
                <ArrowUpRight className="w-4 h-4 text-[#A9DFBF]" strokeWidth={3} />
              </button>
              
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <PhoneCall className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Available 24/7 Triage</span>
              </div>
            </div>

          </form>

        </div>

        {/* Right Column: Clean Tilted Doctor Circle */}
        <div className="hidden md:flex flex-1 items-center justify-center relative min-h-[380px] p-6 z-10 bg-slate-50/50 border-l border-sky-200/20">
          
          {/* Background soft pastel blue blob */}
          <div className="absolute inset-0 bg-sky-200/20 rounded-[50%_60%_40%_70%] filter blur-xl opacity-80 pointer-events-none" />
          
          {/* Wobbly dashed circle frame */}
          <div className="absolute w-[80%] h-[80%] rounded-[55%_45%_65%_35%] border-2 border-dashed border-sky-300/40 pointer-events-none wobble-border" />

          {/* Doctor circle photo */}
          <div className="w-56 h-56 rounded-full overflow-hidden border-4 border-white shadow-xl hover:scale-105 transition-all duration-300 relative z-10 shrink-0">
            <img 
              src="/images/dr-marcus.png" 
              alt="Dr. Marcus" 
              className="w-full h-full object-cover object-[75%_5%]"
            />
          </div>

          {/* Floating emergency triage sticker */}
          <div className="absolute top-8 right-8 bg-rose-500 text-white font-extrabold text-[0.65rem] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md z-20 flex items-center gap-1.5 hover:scale-110 transition-transform duration-300">
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> Emergency Desk
          </div>

        </div>

      </div>

    </div>
  );
}
