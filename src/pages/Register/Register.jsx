import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import toast, { Toaster } from 'react-hot-toast';
import { User, Mail, Lock, PawPrint, Heart, Sparkles } from 'lucide-react';

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

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState('petOwner');
  const { signup, isLoading } = useAuthStore();
  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-[1280px] mx-auto min-h-screen flex items-center justify-center relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Mesh Background Blobs for Visual Glow */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-rose-200/20 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-[#A9DFBF]/20 blur-3xl pointer-events-none z-0" />

      {/* Floating Doodles */}
      <div className="absolute top-44 left-4 text-purple-400/25 z-0 pointer-events-none animate-float hidden lg:block select-none">
        <PawPrint className="w-12 h-12 rotate-12" />
      </div>
      <div className="absolute top-[480px] -right-8 text-amber-400/25 z-0 pointer-events-none animate-float-delayed rotate-45 hidden lg:block select-none">
        <BoneSVG className="w-20 h-12" />
      </div>
      <div className="absolute bottom-[320px] -left-10 text-teal-400/25 z-0 pointer-events-none animate-float-slow -rotate-12 hidden lg:block select-none">
        <FishSVG className="w-16 h-10" />
      </div>
      <div className="absolute bottom-20 right-6 text-rose-400/25 z-0 pointer-events-none animate-float hidden lg:block select-none">
        <Heart className="w-10 h-10 fill-rose-400/10" />
      </div>

      {/* Custom Pet Animations */}
      <style>{`
        @keyframes swayLeft {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-16px) rotate(-3deg); }
        }
        @keyframes swayRight {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-16px) rotate(3deg); }
        }
        .sway-left {
          animation: swayLeft 4.5s ease-in-out infinite;
        }
        .sway-right {
          animation: swayRight 5s ease-in-out infinite;
          animation-delay: 0.8s;
        }
      `}</style>

      {/* Floating Pet Characters */}
      <div className="absolute left-[8%] bottom-[12%] hidden xl:flex flex-col items-center gap-2 sway-left z-10 pointer-events-none select-none">
        <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-xl">
          <img src="/images/hamster.png" alt="Coco" className="w-full h-full object-cover" />
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-100 text-slate-800 text-[0.65rem] font-bold px-3 py-1 rounded-full shadow-md">
          Hi, I'm Coco! 🐹
        </div>
      </div>

      <div className="absolute right-[8%] top-[16%] hidden xl:flex flex-col items-center gap-2 sway-right z-10 pointer-events-none select-none">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
          <img src="/images/parrot.png" alt="Kiwi" className="w-full h-full object-cover" />
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-100 text-slate-800 text-[0.65rem] font-bold px-3 py-1 rounded-full shadow-md">
          Hi, I'm Kiwi! 🦜
        </div>
      </div>

      {/* ==========================================
         GLASS REGISTER CARD
         ========================================== */}
      <div className="bg-[#A9DFBF]/10 backdrop-blur-md rounded-[36px] p-8 md:p-10 shadow-2xl border border-[#A9DFBF]/30 max-w-md w-full z-10 relative">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2.5 mb-8">
          <div className="flex -space-x-2">
            <div className="w-10 h-10 rounded-full bg-[#A9DFBF]/30 border border-[#A9DFBF]/50 flex items-center justify-center text-emerald-800 shrink-0">
              <PawPrint className="w-5 h-5 fill-current" />
            </div>
            <div className="w-10 h-10 rounded-full bg-[#fce7f3] border border-pink-200 flex items-center justify-center text-[#f2687c] shrink-0 relative z-10">
              <Heart className="w-5 h-5 fill-current" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
            Create <span className="text-[#f2687c] italic font-serif">Account ♥</span>
          </h1>
          <p className="text-slate-500 text-xs max-w-[280px]">
            Join us to log symptom history and connect with clinical panels.
          </p>
        </div>

        {/* Form */}
        <form 
          onSubmit={async (e) => { 
            e.preventDefault(); 
            const name = e.target.registerName.value;
            const email = e.target.registerEmail.value;
            const password = e.target.registerPassword.value;
            
            const result = await signup(email, password, role, { name });
            
            if (result.success) {
              if (role === 'doctor') {
                navigate("/doctor/dashboard");
              } else {
                navigate("/pet-owner/dashboard");
              }
            } else {
              toast.error(result.error?.message || "Registration failed");
            }
          }}
          className="flex flex-col gap-4"
        >
          {/* Role Selector */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl mb-2">
            <button
              type="button"
              onClick={() => setRole('petOwner')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'petOwner'
                  ? 'bg-white text-[#f2687c] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Pet Owner
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'doctor'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Veterinarian
            </button>
          </div>
          {/* Full Name input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="registerName" className="text-[0.65rem] font-black text-slate-600 uppercase tracking-widest pl-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input 
                type="text" 
                id="registerName" 
                placeholder="Dr. Mark Olsen" 
                className="w-full bg-white/40 border border-slate-200/80 focus:border-[#f2687c] focus:bg-white pl-11 pr-4 py-3 rounded-xl outline-none transition-all text-sm text-slate-700 shadow-sm"
                required 
              />
            </div>
          </div>

          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="registerEmail" className="text-[0.65rem] font-black text-slate-600 uppercase tracking-widest pl-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input 
                type="email" 
                id="registerEmail" 
                placeholder="mark@joeyverse.com" 
                className="w-full bg-white/40 border border-slate-200/80 focus:border-[#f2687c] focus:bg-white pl-11 pr-4 py-3 rounded-xl outline-none transition-all text-sm text-slate-700 shadow-sm"
                required 
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="registerPassword" className="text-[0.65rem] font-black text-slate-600 uppercase tracking-widest pl-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input 
                type="password" 
                id="registerPassword" 
                placeholder="Min. 8 characters" 
                className="w-full bg-white/40 border border-slate-200/80 focus:border-[#f2687c] focus:bg-white pl-11 pr-4 py-3 rounded-xl outline-none transition-all text-sm text-slate-700 shadow-sm"
                minLength="8"
                required 
              />
            </div>
          </div>

          {/* Confirm Password input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-[0.65rem] font-black text-slate-600 uppercase tracking-widest pl-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input 
                type="password" 
                id="confirmPassword" 
                placeholder="Re-enter password" 
                className="w-full bg-white/40 border border-slate-200/80 focus:border-[#f2687c] focus:bg-white pl-11 pr-4 py-3 rounded-xl outline-none transition-all text-sm text-slate-700 shadow-sm"
                minLength="8"
                required 
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-slate-900 hover:bg-[#f2687c] text-white font-extrabold text-xs py-4 px-6 rounded-xl transition-all duration-300 shadow-md uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] mt-3"
          >
            Register Account
          </button>

          {/* Navigation link */}
          <p className="text-slate-500 text-xs text-center mt-3">
            Already have an account?{' '}
            <Link to="/sign-in" className="text-rose-500 hover:text-rose-600 font-extrabold transition-colors">
              Sign In
            </Link>
          </p>

        </form>

      </div>

    </div>
  );
}
