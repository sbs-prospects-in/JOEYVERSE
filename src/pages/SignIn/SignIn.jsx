import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import toast, { Toaster } from 'react-hot-toast';
import { Mail, Lock, PawPrint, Heart, Sparkles, HeartPulse } from 'lucide-react';

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

export default function SignIn() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
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
          <img src="/images/collie-yellow.png" alt="Oscar" className="w-full h-full object-cover" />
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-100 text-slate-800 text-[0.65rem] font-bold px-3 py-1 rounded-full shadow-md">
          Hi, I'm Oscar! 🐾
        </div>
      </div>

      <div className="absolute right-[8%] top-[16%] hidden xl:flex flex-col items-center gap-2 sway-right z-10 pointer-events-none select-none">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
          <img src="/images/orange-tabby.png" alt="Milo" className="w-full h-full object-cover" />
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-slate-100 text-slate-800 text-[0.65rem] font-bold px-3 py-1 rounded-full shadow-md">
          Hi, I'm Milo! 🐱
        </div>
      </div>

      {/* ==========================================
         GLASS SIGN IN CARD
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
            Welcome <span className="text-[#f2687c] italic font-serif">Back ♥</span>
          </h1>
          <p className="text-slate-500 text-xs max-w-[280px]">
            Access your pet records and consult board-certified specialists.
          </p>
        </div>

        {/* Form */}
        <form 
          onSubmit={async (e) => { 
            e.preventDefault(); 
            const email = e.target.loginEmail.value;
            const password = e.target.loginPassword.value;
            const result = await login(email, password);
            if (result.success) {
              if (result.role === 'admin') {
                navigate("/admin/dashboard");
              } else if (result.role === 'doctor') {
                navigate("/doctor/dashboard");
              } else {
                navigate("/pet-owner/dashboard");
              }
            } else {
              toast.error(result.error?.message || "Login failed");
            }
          }}
          className="flex flex-col gap-5"
        >

          {/* Email input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="loginEmail" className="text-[0.65rem] font-black text-slate-600 uppercase tracking-widest pl-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input 
                type="email" 
                id="loginEmail" 
                placeholder="doctor.mark@joeyverse.com" 
                className="w-full bg-white/40 border border-slate-200/80 focus:border-[#f2687c] focus:bg-white pl-11 pr-4 py-3.5 rounded-xl outline-none transition-all text-sm text-slate-700 shadow-sm"
                required 
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <label htmlFor="loginPassword" className="text-[0.65rem] font-black text-slate-600 uppercase tracking-widest">
                Password
              </label>
              <a 
                href="#forgot" 
                onClick={(e) => { e.preventDefault(); alert("Password reset code sent to your email!"); }} 
                className="text-[0.68rem] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider"
              >
                Forgot?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input 
                type="password" 
                id="loginPassword" 
                placeholder="••••••••••••" 
                className="w-full bg-white/40 border border-slate-200/80 focus:border-[#f2687c] focus:bg-white pl-11 pr-4 py-3.5 rounded-xl outline-none transition-all text-sm text-slate-700 shadow-sm"
                required 
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-slate-900 hover:bg-[#f2687c] text-white font-extrabold text-xs py-4 px-6 rounded-xl transition-all duration-300 shadow-md uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] mt-2"
          >
            Sign In
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-2 text-slate-400 text-2xs uppercase tracking-widest justify-center">
            <div className="h-[1px] bg-slate-200/60 flex-grow" />
            <span>Or Sign In With</span>
            <div className="h-[1px] bg-slate-200/60 flex-grow" />
          </div>

          {/* Social login stubs */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => alert("Google sign in stub clicked")}
              className="bg-white/60 hover:bg-white border border-slate-200/80 px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-700 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.437-2.883-6.437-6.438a6.43 6.43 0 0 1 6.437-6.437c1.57 0 2.997.574 4.103 1.516l3.072-3.07C18.997 2.05 15.82 1 12.24 1 6.032 1 1 6.033 1 12.24s5.032 11.24 11.24 11.24c5.807 0 10.662-4.183 10.662-10.286a10.15 10.15 0 0 0-.2-.909H12.24z"/>
              </svg>
              Google
            </button>
            <button 
              type="button"
              onClick={() => alert("Apple sign in stub clicked")}
              className="bg-white/60 hover:bg-white border border-slate-200/80 px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-700 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.94-1.39z"/>
              </svg>
              Apple
            </button>
          </div>

          {/* Navigation link */}
          <p className="text-slate-500 text-xs text-center mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-rose-500 hover:text-rose-600 font-extrabold transition-colors">
              Register Account
            </Link>
          </p>

        </form>

      </div>

    </div>
  );
}
