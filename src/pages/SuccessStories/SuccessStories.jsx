import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Quote, HeartPulse, Sparkles, MessageCircle, FileText } from 'lucide-react';

// Hand-Drawn Sketch Doodle Components matching the user's mockup
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

function CollarDoodle({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <ellipse cx="50" cy="40" rx="30" ry="12" />
      <circle cx="50" cy="58" r="6" />
      <path d="M50,48 L50,52" />
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

export default function SuccessStories() {
  const additionalStories = [
    { 
      id: 'luna-cat',
      name: 'Luna (Persian Cat)', 
      owner: 'Sarah Jenkins', 
      excerpt: 'Luna had suffered from chronic skin scale dermatitis for over 8 months. Our custom allergy food plans cured the constant itching entirely.',
      img: '/images/siamese-cat.png',
      bg: 'bg-[#faf5ff]',
      border: 'border-purple-100',
      badgeText: 'Dermatology'
    },
    { 
      id: 'budgie-parrot',
      name: 'Budgie (Parrot)', 
      owner: 'Elena Rossi', 
      excerpt: 'Budgie exhibited high travel panic stress. An online triage consult provided guidance tips on cage layouts and hydration schedules.',
      img: '/images/parrot.png',
      bg: 'bg-[#f0f9ff]',
      border: 'border-sky-100',
      badgeText: 'Behavioral'
    },
    { 
      id: 'bella-dog',
      name: 'Bella (Golden Retriever)', 
      owner: 'David Chen', 
      excerpt: 'Bella had joint blocks and post-operative recovery stress. We mapped custom physical schedules that helped her stand again.',
      img: '/images/collie-yellow.png',
      bg: 'bg-[#fefce8]',
      border: 'border-amber-100',
      badgeText: 'Physiotherapy'
    }
  ];

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-[1280px] mx-auto flex flex-col gap-20 relative overflow-hidden">
      
      {/* Custom Sketch Sway Animations */}
      <style>{`
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
        @keyframes swayLeft {
          0%, 100% { transform: translateY(0px) rotate(4deg); }
          50% { transform: translateY(-14px) rotate(-4deg); }
        }
        @keyframes swayRight {
          0%, 100% { transform: translateY(0px) rotate(-4deg); }
          50% { transform: translateY(-14px) rotate(4deg); }
        }
        .sway-left {
          animation: swayLeft 4.5s ease-in-out infinite;
        }
        .sway-right {
          animation: swayRight 5s ease-in-out infinite;
          animation-delay: 0.8s;
        }
      `}</style>

      {/* Floating Hand-Drawn Sketch Doodles Background (Toned to matching pastels) */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <CatFaceDoodle className="absolute top-36 left-4 w-16 h-16 text-purple-300/30 sway-doodle-1 hidden lg:block" />
        <DogFaceDoodle className="absolute top-[340px] right-8 w-16 h-16 text-pink-300/30 sway-doodle-2 hidden lg:block" />
        <BoneDoodle className="absolute top-[680px] left-12 w-20 h-12 text-amber-300/30 sway-doodle-1 hidden lg:block" />
        <PawDoodle className="absolute top-28 right-1/4 w-14 h-14 text-emerald-300/30 sway-doodle-2 hidden lg:block" />
        <FishDoodle className="absolute bottom-[360px] left-[6%] w-16 h-12 text-sky-300/30 sway-doodle-1 hidden lg:block" />
        <YarnBallDoodle className="absolute bottom-24 right-[8%] w-16 h-16 text-purple-300/30 sway-doodle-2 hidden lg:block" />
        <FlowerDoodle className="absolute top-[480px] left-[15%] w-14 h-14 text-pink-300/30 sway-doodle-1 hidden lg:block" />
        <CollarDoodle className="absolute top-[560px] right-[12%] w-16 h-16 text-amber-300/30 sway-doodle-2 hidden lg:block" />
      </div>
      
      {/* ==========================================
         PAGE HEADER (REDESIGNED PLAYFUL STICKY NOTE LAYOUT)
         ========================================== */}
      <header className="flex flex-col items-center text-center gap-3 py-6 max-w-3xl mx-auto relative z-10">
        
        {/* Floating Taped Pastel Sticky Notes */}
        <div className="absolute -left-28 top-2 w-36 bg-pink-100/90 border border-pink-200 p-4 rounded-lg shadow-md rotate-[6deg] hidden xl:flex flex-col gap-1 items-start text-left pointer-events-none select-none animate-float">
          {/* Masking tape strip */}
          <div className="w-10 h-3 bg-white/60 absolute -top-1.5 left-12 rotate-[-8deg] shadow-2xs" />
          <span className="text-[0.62rem] font-bold text-pink-700 leading-tight">
            🐾 120+ happy pet recoveries tracked this month!
          </span>
        </div>

        {/* Floating Animated Pet Stickers */}
        <div className="absolute -left-48 top-16 hidden xl:flex flex-col items-center gap-1.5 sway-left z-10 pointer-events-none select-none">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img src="/images/hero-dog.png" alt="Buddy" className="w-full h-full object-cover" />
          </div>
          <span className="bg-white border border-slate-100 text-[0.55rem] font-bold text-slate-600 px-2.5 py-0.5 rounded-full shadow-sm">
            Buddy 🐾
          </span>
        </div>

        <div className="absolute -right-48 top-20 hidden xl:flex flex-col items-center gap-1.5 sway-right z-10 pointer-events-none select-none">
          <div className="w-18 h-18 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img src="/images/bunny.png" alt="Bella" className="w-full h-full object-cover" />
          </div>
          <span className="bg-white border border-slate-100 text-[0.55rem] font-bold text-slate-600 px-2.5 py-0.5 rounded-full shadow-sm">
            Bella 🐰
          </span>
        </div>

        <div className="absolute -right-28 top-0 w-36 bg-amber-100/90 border border-amber-200 p-4 rounded-lg shadow-md rotate-[-6deg] hidden xl:flex flex-col gap-1.5 items-start text-left pointer-events-none select-none animate-float-delayed">
          {/* Masking tape strip */}
          <div className="w-10 h-3 bg-white/60 absolute -top-1.5 left-12 rotate-[8deg] shadow-2xs" />
          <span className="text-[0.62rem] font-bold text-amber-800 leading-tight">
            ❤️ Luna & Max send their love from home!
          </span>
        </div>

        {/* Cozy Tilted Capsule Badge */}
        <div className="inline-block bg-sky-100 border border-sky-200 text-sky-850 px-4.5 py-1.5 rounded-full text-[0.65rem] font-black uppercase tracking-widest rotate-[-1.5deg] shadow-sm mb-1.5">
          Real Diaries ♥
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
          Patient Success <br />
          <span className="relative inline-block text-rose-500 italic mt-1 font-serif">
            Stories
            <svg
              viewBox="0 0 120 10"
              preserveAspectRatio="none"
              className="absolute left-0 bottom-[-4px] w-full h-[8px] text-amber-400"
              aria-hidden="true"
            >
              <path d="M0,6 C40,10 80,2 120,6" stroke="currentColor" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        {/* Description */}
        <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-xl mt-3 font-medium">
          Read real recovery chronicles, symptom diaries, and notes from pet parents who connected with our clinical panels.
        </p>
      </header>

      {/* ==========================================
         FEATURED STORY BLOCK (Layered Testimonial Design)
         ========================================== */}
      <section className="flex flex-col gap-8">
        <div className="text-center md:text-left flex flex-col gap-2">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Featured Recovery</h2>
          <p className="text-slate-500 text-sm">Our most inspiring success story of emergency guidance this month.</p>
        </div>

        {/* Split Background Container */}
        <div className="relative w-full rounded-[32px] overflow-hidden shadow-xl border border-slate-200 bg-white min-h-[480px] flex items-center">
          
          {/* Pastel Sidebar Left */}
          <div className="absolute inset-y-0 left-0 w-full md:w-[28%] bg-[#f5f3ff] z-0" />
          
          {/* Vertical Heading */}
          <div className="absolute top-8 left-6 md:top-12 md:left-8 w-[22%] z-10 text-purple-950 hidden md:block select-none">
            <h3 className="text-3xl font-black tracking-tight leading-tight uppercase">
              Featured<br/>Recovery
            </h3>
            <div className="w-12 h-1 bg-purple-300 mt-4 rounded-full" />
          </div>

          {/* Overlapping Card */}
          <div className="relative z-10 w-full md:ml-[22%] mr-4 md:mr-8 my-8 md:my-12 bg-white rounded-[28px] border-[10px] border-[#fbcfe8] shadow-lg p-6 md:p-8 flex flex-col gap-6 lg:pr-56 min-h-[300px]">
            
            {/* Protruding/Overlapping Vet Image on the Right (Desktop) */}
            <div className="absolute -top-16 right-8 w-44 h-60 rounded-2xl overflow-hidden shadow-lg border-[6px] border-white z-20 hidden lg:block hover:scale-[1.02] transition-transform duration-300">
              <img 
                src="/images/dr-anjali.png" 
                alt="Dr. Anjali" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-[#fce7f3] border border-pink-200/60 text-pink-900 font-bold text-[0.6rem] px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                Clinician Panel
              </div>
            </div>

            {/* Mobile Vet Image (Inline inside card) */}
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative shrink-0 shadow-sm border border-slate-100 lg:hidden">
              <img 
                src="/images/dr-anjali.png" 
                alt="Dr. Anjali" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-[#fce7f3] border border-pink-200/60 text-pink-900 font-bold text-[0.65rem] px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
                Clinician Panel
              </div>
            </div>

            {/* Testimonial Details */}
            <div className="flex flex-col gap-5 w-full">
              {/* Tag Block (Pastel pink badge with dark text) */}
              <div className="bg-[#fce7f3] border border-pink-200/60 text-pink-950 px-6 py-3 rounded-[20px] w-max shadow-sm">
                <div className="font-extrabold text-base leading-tight">Mark Olsen</div>
                <div className="text-pink-850 text-[0.7rem] font-bold mt-0.5">Owner of Max (Labrador)</div>
              </div>

              {/* Quote */}
              <div className="relative pt-2">
                <Quote className="absolute -top-3 -left-3 w-8 h-8 text-slate-100 shrink-0" />
                <blockquote className="text-base md:text-lg font-medium leading-relaxed text-slate-700 italic relative z-10">
                  "Max ate a large plastic bottle cap at midnight. A clinician responded on the chat panel within 45 seconds, guided us through emergency monitoring steps, and saved us from unnecessary surgery."
                </blockquote>
              </div>

              {/* Rating & Date */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                  October 2024
                </div>
                <div className="flex gap-2">
                  <Link 
                    to="/success-stories/max-labrador" 
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5 border border-slate-200/50"
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-500" /> Case Study
                  </Link>
                  <Link 
                    to="/consult" 
                    className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 px-5 rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Connect
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================
         PATIENT CHRONICLES (BUBBLE CLUSTER DESIGN)
         ========================================== */}
      <section className="flex flex-col gap-12">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">More Patient Chronicles</h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">Click on a bubble to read how our online clinics helped pets overcome critical wellness issues.</p>
        </div>

        {/* ─── Desktop Bubble Cluster Cloud ─── */}
        <div className="relative w-full max-w-5xl h-[580px] mx-auto hidden lg:block select-none mt-4">

          {/* Max (Labrador) - Left top */}
          <Link 
            to="/success-stories/max-labrador"
            className="absolute left-[12%] top-[8%] w-48 h-48 rounded-full bg-[#f3e8ff] border-4 border-white shadow-xl hover:scale-108 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(168,85,247,0.25)] transition-all duration-300 flex flex-col justify-center items-center text-center p-4 z-10 cursor-pointer text-purple-950"
          >
            <span className="text-purple-700 font-extrabold text-[0.65rem] tracking-widest uppercase">Emergency</span>
            <span className="text-xl font-black mt-1 leading-none">Max</span>
            <span className="text-purple-800/80 text-[0.7rem] font-bold mt-1">Labrador</span>
            <span className="text-[0.6rem] bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full mt-3 uppercase tracking-wider">Read File</span>
          </Link>
          
          <Link
            to="/success-stories/max-labrador"
            className="absolute left-[5%] top-[34%] w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg hover:scale-110 hover:-rotate-6 hover:shadow-2xl transition-all duration-300 z-10"
          >
            <img src="/images/golden-retriever.png" alt="Max" className="w-full h-full object-cover" />
          </Link>

          {/* Luna (Persian Cat) - Center */}
          <Link 
            to="/success-stories/luna-cat"
            className="absolute left-[36%] top-[24%] w-52 h-52 rounded-full bg-[#e0f2fe] border-4 border-white shadow-2xl hover:scale-108 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(14,165,233,0.25)] transition-all duration-300 flex flex-col justify-center items-center text-center p-6 z-25 cursor-pointer text-sky-950"
          >
            <span className="text-sky-700 font-extrabold text-[0.65rem] tracking-widest uppercase">Dermatology</span>
            <span className="text-2xl font-black mt-1 leading-none">Luna</span>
            <span className="text-sky-800/80 text-[0.7rem] font-bold mt-1">Persian Cat</span>
            <span className="text-[0.6rem] bg-[#0284c7] text-white font-extrabold px-2 py-0.5 rounded-full mt-3 uppercase tracking-wider">Read File</span>
          </Link>

          <Link
            to="/success-stories/luna-cat"
            className="absolute left-[26%] top-[12%] w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg hover:scale-110 hover:rotate-6 hover:shadow-2xl transition-all duration-300 z-10"
          >
            <img src="/images/siamese-cat.png" alt="Luna" className="w-full h-full object-cover" />
          </Link>

          {/* Budgie (Parrot) - Right top */}
          <Link 
            to="/success-stories/budgie-parrot"
            className="absolute left-[64%] top-[10%] w-44 h-44 rounded-full bg-[#fce7f3] border-4 border-white shadow-xl hover:scale-108 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(236,72,153,0.25)] transition-all duration-300 flex flex-col justify-center items-center text-center p-4 z-10 cursor-pointer text-pink-950"
          >
            <span className="text-pink-700 font-extrabold text-[0.65rem] tracking-widest uppercase">Behavioral</span>
            <span className="text-xl font-black mt-1 leading-none">Budgie</span>
            <span className="text-pink-800/80 text-[0.7rem] font-bold mt-1">Parrot</span>
            <span className="text-[0.6rem] bg-pink-600 text-white font-extrabold px-2 py-0.5 rounded-full mt-3 uppercase tracking-wider">Read File</span>
          </Link>

          <Link
            to="/success-stories/budgie-parrot"
            className="absolute left-[76%] top-[28%] w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg hover:scale-110 hover:-rotate-12 hover:shadow-2xl transition-all duration-300 z-10"
          >
            <img src="/images/parrot.png" alt="Budgie" className="w-full h-full object-cover" />
          </Link>

          {/* Bella (Golden Retriever) - Right bottom */}
          <Link 
            to="/success-stories/bella-dog"
            className="absolute left-[54%] top-[46%] w-48 h-48 rounded-full bg-[#ccfbf1] border-4 border-white shadow-xl hover:scale-108 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(20,184,166,0.25)] transition-all duration-300 flex flex-col justify-center items-center text-center p-4 z-10 cursor-pointer text-teal-950"
          >
            <span className="text-teal-700 font-extrabold text-[0.65rem] tracking-widest uppercase">Physiology</span>
            <span className="text-xl font-black mt-1 leading-none">Bella</span>
            <span className="text-teal-800/80 text-[0.7rem] font-bold mt-1">Golden Ret.</span>
            <span className="text-[0.6rem] bg-teal-600 text-white font-extrabold px-2 py-0.5 rounded-full mt-3 uppercase tracking-wider">Read File</span>
          </Link>

          <Link
            to="/success-stories/bella-dog"
            className="absolute left-[72%] top-[44%] w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg hover:scale-110 hover:rotate-12 hover:shadow-2xl transition-all duration-300 z-10"
          >
            <img src="/images/collie-yellow.png" alt="Bella" className="w-full h-full object-cover" />
          </Link>

          {/* Decorative smaller colored bubbles matching screenshot detail */}
          <div className="absolute left-[20%] top-[48%] w-8 h-8 rounded-full bg-sky-300/60 blur-[0.5px] pointer-events-none animate-float-delayed" />
          <div className="absolute left-[48%] top-[12%] w-10 h-10 rounded-full bg-[#f2687c]/70 blur-[0.5px] pointer-events-none animate-float" />
          <div className="absolute left-[60%] top-[30%] w-12 h-12 rounded-full bg-[#0284c7]/50 blur-[0.5px] pointer-events-none animate-float-slow" />
          <div className="absolute left-[45%] top-[56%] w-6 h-6 rounded-full bg-rose-400/80 blur-[0.5px] pointer-events-none animate-float-delayed" />
          <div className="absolute left-[38%] top-[8%] w-8 h-8 rounded-full bg-teal-400/60 blur-[0.5px] pointer-events-none animate-float" />
          <div className="absolute left-[88%] top-[18%] w-8 h-8 rounded-full bg-slate-800/80 blur-[0.5px] pointer-events-none animate-float-slow" />
          <div className="absolute left-[8%] top-[15%] w-10 h-10 rounded-full bg-amber-400/70 blur-[0.5px] pointer-events-none animate-float" />

        </div>

        {/* ─── Mobile Fallback List ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:hidden">
          {[
            { id: 'max-labrador', name: 'Max (Labrador)', category: 'Emergency Triage', img: '/images/golden-retriever.png', excerpt: 'Ingested a plastic bottle cap at midnight. Guided safe triage monitoring steps.' },
            { id: 'luna-cat', name: 'Luna (Persian Cat)', category: 'Dermatology', img: '/images/siamese-cat.png', excerpt: 'Chronic skin scale dermatitis for over 8 months. Reverted with single protein venison plans.' },
            { id: 'budgie-parrot', name: 'Budgie (Parrot)', category: 'Behavioral Guidance', img: '/images/parrot.png', excerpt: 'Travel panic stress blocks. Tamed with electrolyte spray and covering layouts.' },
            { id: 'bella-dog', name: 'Bella (Golden Retriever)', category: 'Physiotherapy', img: '/images/collie-yellow.png', excerpt: 'Post-op hind atrophy and stiffness. Mapped out passive mobilizations.' }
          ].map((story, idx) => (
            <Link 
              key={idx}
              to={`/success-stories/${story.id}`}
              className="bg-white rounded-[32px] p-6 border border-slate-100 flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-100 shrink-0">
                    <img src={story.img} alt={story.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-bold text-rose-500 uppercase tracking-wider">{story.category}</span>
                    <h3 className="text-slate-800 font-extrabold text-sm leading-tight mt-0.5 group-hover:text-rose-500 transition-colors">{story.name}</h3>
                  </div>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                  "{story.excerpt}"
                </p>
              </div>
              <span className="text-rose-500 text-2xs font-extrabold uppercase tracking-wider mt-4 block">
                Read Full Case Report →
              </span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
