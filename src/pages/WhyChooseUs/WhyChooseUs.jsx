import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, Award, CheckCircle2, Sparkles, HeartPulse, PawPrint, Heart, Stethoscope } from 'lucide-react';

function BoneSVG({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="14" />
      <circle cx="20" cy="40" r="14" />
      <circle cx="80" cy="20" r="14" />
      <circle cx="80" cy="40" r="14" />
      <rect x="20" y="20" width="60" height="20" />
    </svg>
  );
}

function FishSVG({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M10,30 Q40,5 75,30 Q40,55 10,30" />
      <polygon points="75,30 95,15 90,30 95,45" />
      <circle cx="25" cy="25" r="3" fill="#ffffff" />
    </svg>
  );
}

// Hand-drawn sketch pet doodles for features grid
function DogFaceDoodle({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
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

function CatFaceDoodle({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
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

function BoneDoodle({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24,15 C20,15 16,19 16,23 C16,27 20,31 24,31 C25,31 26,30.8 27,30.5 L73,30.5 C74,30.8 75,31 76,31 C80,31 84,27 84,23 C84,19 80,15 76,15 C75,15 74,15.2 73,15.5 L27,15.5 C26,15.2 25,15 24,15 Z" />
      <path d="M24,45 C20,45 16,41 16,37 C16,33 20,29 24,29 C25,29 26,29.2 27,29.5 L73,29.5 C74,29.2 75,29 76,29 C80,29 84,33 84,37 C84,41 80,45 76,45 C75,45 74,44.8 73,44.5 L27,44.5 C26,44.8 25,45 24,45 Z" />
    </svg>
  );
}

function PawDoodle({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
      <path d="M32,62 C32,50 68,50 68,62 C68,75 32,75 32,62 Z" />
      <circle cx="26" cy="40" r="8" fill="none" />
      <circle cx="42" cy="28" r="9" fill="none" />
      <circle cx="58" cy="28" r="9" fill="none" />
      <circle cx="74" cy="40" r="8" fill="none" />
    </svg>
  );
}

function FishDoodle({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10,30 C30,10 70,10 90,30 C70,50 30,50 10,30 Z" />
      <path d="M80,30 L95,15 L90,30 L95,45 Z" />
      <circle cx="28" cy="25" r="2" fill="currentColor" />
      <path d="M45,20 L45,40" />
      <path d="M58,20 L58,40" />
    </svg>
  );
}

function FlowerDoodle({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
      <circle cx="50" cy="50" r="10" />
      <circle cx="50" cy="25" r="12" />
      <circle cx="50" cy="75" r="12" />
      <circle cx="25" cy="50" r="12" />
      <circle cx="75" cy="50" r="12" />
    </svg>
  );
}

export default function WhyChooseUs() {
  const pillars = [
    {
      icon: Clock,
      title: '45-Second Triage Response',
      desc: 'No more waiting rooms or late-night clinic drives. Get connected to a board-certified veterinarian over secure chat or video within seconds.',
      badge: 'Immediate Help'
    },
    {
      icon: ShieldCheck,
      title: 'Individually Vetted Panel',
      desc: 'We perform strict checks on licenses, clinical backgrounds, and state registries. Only top-tier specialists guide your pet\'s health.',
      badge: '100% Verified'
    },
    {
      icon: Award,
      title: 'Custom Care & Refills',
      desc: 'Receive digital stubs, prescription renewals, and breed-specific dietary schedules designed directly by leading animal nutritionists.',
      badge: 'Tailored Plans'
    }
  ];

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-[1280px] mx-auto flex flex-col gap-20 relative overflow-hidden">
      
      {/* Mesh Background Blobs for Glassmorphism visual impact */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-rose-200/20 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-sky-200/20 blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-amber-200/10 blur-3xl pointer-events-none z-0" />

      {/* Floating Doodles */}
      <div className="absolute top-44 left-4 text-purple-400/20 z-0 pointer-events-none animate-float hidden lg:block select-none">
        <PawPrint className="w-12 h-12 rotate-12" />
      </div>
      <div className="absolute top-[480px] -right-8 text-amber-400/20 z-0 pointer-events-none animate-float-delayed rotate-45 hidden lg:block select-none">
        <BoneSVG className="w-20 h-12" />
      </div>
      <div className="absolute bottom-[320px] -left-10 text-teal-400/20 z-0 pointer-events-none animate-float-slow -rotate-12 hidden lg:block select-none">
        <FishSVG className="w-16 h-10" />
      </div>
      <div className="absolute bottom-20 right-6 text-rose-400/20 z-0 pointer-events-none animate-float hidden lg:block select-none">
        <Heart className="w-10 h-10 fill-rose-400/10" />
      </div>

      {/* ==========================================
         HERO SECTION (PAWFECTLY INSPIRED DESIGN)
         ========================================== */}
      <style>{`
        @keyframes wobble {
          0%, 100% { border-radius: 55% 45% 65% 35%; }
          50% { border-radius: 45% 55% 35% 65%; }
        }
        .wobble-border {
          animation: wobble 8s ease-in-out infinite;
        }
      `}</style>

      <header className="w-full bg-[#fafaf6] rounded-[36px] p-8 md:p-12 border border-amber-100/40 relative overflow-hidden flex flex-col lg:flex-row gap-8 items-center min-h-[480px] shadow-sm z-10">
        
        {/* Playful pastel corner blobs */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-pink-105/50 rounded-[40%_60%_30%_70%] pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-amber-105/40 rounded-[60%_40%_70%_30%] flex items-center justify-center pointer-events-none">
          <PawPrint className="w-6 h-6 text-amber-800/10 rotate-12" />
        </div>
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-105/40 rounded-[50%_50%_30%_70%] flex items-center justify-center pointer-events-none">
          <PawPrint className="w-5 h-5 text-amber-800/10 -rotate-12" />
        </div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-105/50 rounded-[60%_40%_80%_20%] pointer-events-none" />

        {/* Left Column: Brand, Heading, Capsule, Features */}
        <div className="flex-1 flex flex-col gap-5 items-center lg:items-start text-center lg:text-left z-10 relative">
          
          {/* Logo illustration */}
          <div className="flex items-center gap-1.5 text-amber-850">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-850 shrink-0">
                <PawPrint className="w-5 h-5 fill-current" />
              </div>
              <div className="w-10 h-10 rounded-full bg-[#fce7f3] border border-pink-200 flex items-center justify-center text-[#f2687c] shrink-0 relative z-10">
                <Heart className="w-5 h-5 fill-current" />
              </div>
            </div>
            <div className="flex flex-col ml-1">
              <span className="text-xl font-black tracking-tight text-slate-800 font-serif leading-none">Pawfectly</span>
              <span className="text-[0.65rem] font-bold text-rose-500 tracking-wider uppercase mt-0.5">- HAPPY PETS, HAPPY LIFE -</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight mt-1">
            Love them. <br />
            <span className="text-[#f2687c] italic font-serif">Care for them. ♥</span>
          </h1>

          {/* Blue sub-tagline capsule */}
          <div className="inline-block bg-sky-100 border border-sky-200 text-sky-950 px-5 py-2.5 rounded-full text-xs font-extrabold w-max rotate-[-1.5deg] shadow-sm">
            Because they deserve the best, every day. ♥
          </div>

          {/* Four Features Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-200/60 pt-6 mt-4 w-full">
            <div className="flex items-center gap-2 text-slate-700 text-xs font-bold justify-center lg:justify-start">
              <span className="w-8 h-8 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 shrink-0 shadow-sm">
                🌿
              </span>
              <span>Natural Care</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 text-xs font-bold justify-center lg:justify-start">
              <span className="w-8 h-8 rounded-full bg-[#fce7f3] border border-pink-100 flex items-center justify-center text-pink-700 shrink-0 shadow-sm">
                🛡️
              </span>
              <span>Safe & Trusted</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 text-xs font-bold justify-center lg:justify-start">
              <span className="w-8 h-8 rounded-full bg-[#fefce8] border border-yellow-100 flex items-center justify-center text-yellow-750 shrink-0 shadow-sm">
                ❤️
              </span>
              <span>Made with Love</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 text-xs font-bold justify-center lg:justify-start">
              <span className="w-8 h-8 rounded-full bg-[#e0f2fe] border border-sky-100 flex items-center justify-center text-sky-700 shrink-0 shadow-sm">
                ⚡
              </span>
              <span>Fast Response</span>
            </div>
          </div>

        </div>

        {/* Right Column: Puppy & Kitten Portraits + Stickers */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative shrink-0 min-h-[300px] z-10">
          
          {/* Blue background blob */}
          <div className="absolute inset-0 bg-sky-200/20 rounded-[50%_60%_40%_70%] filter blur-xl opacity-80 pointer-events-none" />
          
          {/* Wobbly dashed circle frame around images */}
          <div className="absolute w-[90%] h-[90%] rounded-[55%_45%_65%_35%] border-2 border-dashed border-sky-300/50 pointer-events-none wobble-border" />

          {/* Overlapping Pet Cards */}
          <div className="flex items-center justify-center relative z-10 py-6 pr-4">
            
            {/* Puppy circle (Collie) */}
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl hover:scale-105 transition-all duration-300 relative -mr-8 z-10 shrink-0">
              <img 
                src="/images/collie-yellow.png" 
                alt="Puppy" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Kitten circle (Grey Cat) */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg hover:scale-105 transition-all duration-300 relative mt-12 z-0 shrink-0">
              <img 
                src="/images/grey-cat-purple.png" 
                alt="Kitten" 
                className="w-full h-full object-cover"
              />
            </div>

          </div>

          {/* Floating "Made with love & care" sticker */}
          <div className="absolute -bottom-2 -right-4 bg-white border border-dashed border-[#f2687c] rounded-full p-4 w-28 h-28 flex flex-col justify-center items-center text-center shadow-md rotate-[8deg] z-20 hover:scale-110 transition-transform duration-300">
            <span className="text-[0.55rem] font-bold text-slate-500 uppercase tracking-tight">Made with</span>
            <span className="text-xs font-black text-[#f2687c] leading-tight">Love & Care</span>
            <span className="text-[0.5rem] text-slate-450 mt-0.5">for your family ♥</span>
          </div>

          {/* Tiny hearts floating around */}
          <div className="absolute top-4 left-6 text-[#f2687c]/30 rotate-12 animate-float">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div className="absolute bottom-6 left-12 text-sky-500/20 -rotate-12 animate-float-delayed">
            <Heart className="w-4 h-4" />
          </div>

        </div>

      </header>

      {/* Bottom Horizontal Banner */}
      <div className="w-full bg-sky-200 text-sky-950 py-3.5 px-6 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-sm -mt-16 relative z-10 max-w-[1280px] mx-auto text-center">
        ♥ Thank you for choosing the best for them. ♥
      </div>

      {/* ==========================================
         GLASS PILLARS GRID (TINTED BLUE)
         ========================================== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 z-10 relative">
        {pillars.map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <div 
              key={i}
              className="bg-sky-100/30 backdrop-blur-md rounded-[32px] p-8 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.01)] border border-sky-300/30 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(14,165,233,0.15)] transition-all duration-300 group min-h-[340px]"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-850">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="bg-white/60 text-slate-700 font-extrabold text-[0.6rem] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm border border-white">
                    {pillar.badge}
                  </span>
                </div>
                <h3 className="text-slate-800 font-extrabold text-xl leading-tight mb-3 group-hover:text-sky-850 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* ==========================================
         REDESIGNED DETAIL SECTION (2-COLUMN PREMIUM INTERACTION)
         ========================================== */}
      <section className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center z-10 relative mt-8">
        
        {/* Left Column: Heading, intro, and 2x2 grid checklist */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          
          <div className="flex flex-col gap-3">
            <span className="text-[0.65rem] font-black text-[#f2687c] tracking-widest uppercase pl-1">
              Clinical Pledge
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
              Setting the standard for online <br />
              <span className="text-sky-600 italic font-serif relative">
                veterinary panels
                <svg
                  viewBox="0 0 120 10"
                  preserveAspectRatio="none"
                  className="absolute left-0 bottom-[-4px] w-full h-[6px] text-amber-400"
                  aria-hidden="true"
                >
                  <path d="M0,6 C40,10 80,2 120,6" stroke="currentColor" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h2>
          </div>
          
          <p className="text-slate-500 text-sm md:text-base leading-relaxed pl-1 max-w-xl">
            Joeyverse was created by pet parents and veterinary specialists who realized that emergency clinical guidance should be available instantly, without travel panic.
          </p>

          {/* 2x2 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {[
              {
                title: "Direct Connection",
                desc: "Real-time consultation with registered practitioners.",
                bg: "bg-sky-50/70 border border-sky-100/80 hover:shadow-[0_15px_30px_rgba(14,165,233,0.1)]",
                iconBg: "bg-sky-100 border border-sky-200 text-sky-700",
                iconWobble: "rounded-[55%_45%_65%_35%]",
                icon: DogFaceDoodle,
                doodles: [
                  { comp: PawDoodle, style: "absolute -bottom-4 -right-4 w-20 h-20 text-sky-200/30 rotate-[15deg]" },
                  { comp: FlowerDoodle, style: "absolute -top-3 -right-3 w-12 h-12 text-sky-200/20 rotate-[-12deg]" }
                ]
              },
              {
                title: "Active Refills",
                desc: "Digital prescription renewing stubs and behavior logs.",
                bg: "bg-pink-50/70 border border-pink-100/80 hover:shadow-[0_15px_30px_rgba(244,63,94,0.1)]",
                iconBg: "bg-pink-100 border border-pink-200 text-pink-700",
                iconWobble: "rounded-[65%_35%_55%_45%]",
                icon: BoneDoodle,
                doodles: [
                  { comp: BoneDoodle, style: "absolute -bottom-2 -right-4 w-24 h-14 text-pink-200/30 rotate-[-15deg]" },
                  { comp: FlowerDoodle, style: "absolute top-2 -right-4 w-12 h-12 text-pink-200/20 rotate-[24deg]" }
                ]
              },
              {
                title: "Secure Streams",
                desc: "Private chat networks with high-fidelity video streams.",
                bg: "bg-yellow-50/70 border border-yellow-100/80 hover:shadow-[0_15px_30px_rgba(234,179,8,0.1)]",
                iconBg: "bg-yellow-100 border border-yellow-250 text-yellow-750",
                iconWobble: "rounded-[45%_55%_35%_65%]",
                icon: CatFaceDoodle,
                doodles: [
                  { comp: CatFaceDoodle, style: "absolute -bottom-4 -right-4 w-20 h-20 text-yellow-300/30 rotate-[8deg]" },
                  { comp: PawDoodle, style: "absolute top-4 -right-3 w-10 h-10 text-yellow-300/20 rotate-[-18deg]" }
                ]
              },
              {
                title: "Triage Checklists",
                desc: "Breeds checklists and localized night directions.",
                bg: "bg-teal-50/70 border border-teal-100/80 hover:shadow-[0_15px_30px_rgba(20,184,166,0.1)]",
                iconBg: "bg-teal-100 border border-teal-200 text-teal-750",
                iconWobble: "rounded-[50%_60%_40%_70%]",
                icon: PawDoodle,
                doodles: [
                  { comp: FishDoodle, style: "absolute -bottom-2 -right-4 w-20 h-14 text-teal-200/30 rotate-[-20deg]" },
                  { comp: FlowerDoodle, style: "absolute -top-3 -right-3 w-12 h-12 text-teal-200/20 rotate-[12deg]" }
                ]
              }
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div 
                  key={i} 
                  className={`${card.bg} rounded-[32px] p-6 flex flex-col gap-4.5 hover:scale-[1.03] transition-all duration-300 shadow-xs group relative overflow-hidden`}
                >
                  {/* Floating Background Doodle Patterns */}
                  {card.doodles.map((dood, idx) => {
                    const DoodComp = dood.comp;
                    return <DoodComp key={idx} className={`${dood.style} pointer-events-none z-0`} />;
                  })}
                  
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className={`w-12 h-12 ${card.iconWobble} ${card.iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 leading-none mb-1.5">{card.title}</h4>
                      <p className="text-slate-500 text-2xs leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Clean picture layout */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative shrink-0">
          
          {/* Background decorative blob */}
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-rose-100/40 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-sky-100/40 blur-3xl pointer-events-none" />

          {/* Main Picture Frame */}
          <div className="w-full aspect-[4/3] rounded-[36px] overflow-hidden border-8 border-white shadow-xl relative z-10 hover:scale-[1.01] transition-transform duration-500">
            <img 
              src="/images/vaccination-camp.png" 
              alt="Clinical Triage" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Floating badge */}
          <div className="absolute top-4 right-4 bg-emerald-500 text-white font-extrabold text-[0.6rem] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md z-20 flex items-center gap-1">
            <HeartPulse className="w-3.5 h-3.5 animate-pulse" /> Certified Outreach
          </div>

        </div>

      </section>

      {/* ==========================================
         CALL TO ACTION PANEL
         ========================================== */}
      {/* ==========================================
         CALL TO ACTION PANEL (MINIMALIST DESIGN)
         ========================================== */}
      <section className="bg-sky-50/50 border border-sky-100/60 rounded-[32px] p-8 md:p-12 flex flex-col items-center text-center gap-4 z-10 relative">
        
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight max-w-xl">
          Consult with a certified specialist panel now
        </h2>
        
        <p className="text-slate-500 text-xs md:text-sm max-w-md leading-relaxed">
          Connect immediately over secure live video or chat streams to check symptoms and map out safe home-care recovery guidelines.
        </p>

        <div className="mt-3">
          <Link 
            to="/doctors" 
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Online Consult
          </Link>
        </div>
      </section>

    </div>
  );
}
