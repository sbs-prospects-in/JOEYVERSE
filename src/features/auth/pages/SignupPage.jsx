import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast, { Toaster } from 'react-hot-toast';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['petOwner', 'doctor']),
  licenseNumber: z.string().optional(),
});

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();
  const [role, setRole] = useState('petOwner');
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'petOwner' }
  });

  const onSubmit = async (data) => {
    if (data.role === 'doctor' && !data.licenseNumber) {
      toast.error("License number is required for doctors");
      return;
    }

    const { success, error, session } = await signup(data.email, data.password, data.role, {
      name: data.name,
      license_number: data.licenseNumber,
    });

    if (success) {
      if (session === null) {
        toast.success('Signup successful! Please check your email to confirm your account.');
      } else {
        toast.success('Account created successfully!');
        if (data.role === 'doctor') {
          navigate('/doctor/dashboard');
        } else {
          navigate('/pet-owner/dashboard');
        }
      }
    } else {
      console.error("SIGNUP ERROR:", error);
      let errMsg = error?.message;
      if (!errMsg || errMsg === '{}') {
        errMsg = "Network error or invalid Supabase API Key. Please ensure your anon key starts with 'eyJ'.";
      }
      toast.error(errMsg);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#050505] overflow-hidden font-sans">
      <Toaster position="top-center" toastOptions={{ style: { background: '#222', color: '#fff', borderRadius: '12px', border: '1px solid #333' } }} />
      
      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 xl:p-24 relative z-10">
        
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#bd905b]/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md relative">
          <div className="mb-10 text-center lg:text-left">
            <Link to="/" className="inline-block mb-6">
              <span className="text-xs tracking-[0.3em] text-[#bd905b] uppercase font-bold">PetConnect</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-light text-white mb-3 tracking-tight">Create <span className="font-semibold">Account</span></h1>
            <p className="text-[#888] text-sm md:text-base">Join the community. Save lives. Connect with experts.</p>
          </div>
          
          {/* Custom Segmented Control for Role */}
          <div className="relative flex p-1 bg-[#111] rounded-xl mb-8 border border-[#222]">
            <div 
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-[#222] rounded-lg transition-transform duration-300 ease-out border border-[#333] shadow-lg ${role === 'doctor' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
            ></div>
            
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-medium transition-colors z-10 ${role === 'petOwner' ? 'text-white' : 'text-[#888] hover:text-[#bbb]'}`}
              onClick={() => { setRole('petOwner'); setValue('role', 'petOwner'); }}
            >
              Pet Owner
            </button>
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-medium transition-colors z-10 ${role === 'doctor' ? 'text-white' : 'text-[#888] hover:text-[#bbb]'}`}
              onClick={() => { setRole('doctor'); setValue('role', 'doctor'); }}
            >
              Doctor
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="group relative">
              <input
                type="text"
                {...register('name')}
                placeholder=" "
                className="peer w-full px-5 py-4 bg-[#111]/50 border border-[#222] rounded-xl text-white placeholder-transparent focus:outline-none focus:border-[#bd905b] focus:bg-[#111] transition-all backdrop-blur-sm"
              />
              <label className="absolute left-5 -top-2.5 text-xs text-[#666] bg-[#050505] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#bd905b] peer-focus:bg-[#050505] px-1 pointer-events-none rounded">
                Full Name
              </label>
              {errors.name && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.name.message}</p>}
            </div>

            <div className="group relative pt-2">
              <input
                type="email"
                {...register('email')}
                placeholder=" "
                className="peer w-full px-5 py-4 bg-[#111]/50 border border-[#222] rounded-xl text-white placeholder-transparent focus:outline-none focus:border-[#bd905b] focus:bg-[#111] transition-all backdrop-blur-sm"
              />
              <label className="absolute left-5 -top-2.5 text-xs text-[#666] bg-[#050505] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#bd905b] peer-focus:bg-[#050505] px-1 pointer-events-none rounded">
                Email Address
              </label>
              {errors.email && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.email.message}</p>}
            </div>

            <div className="group relative pt-2">
              <input
                type="password"
                {...register('password')}
                placeholder=" "
                className="peer w-full px-5 py-4 bg-[#111]/50 border border-[#222] rounded-xl text-white placeholder-transparent focus:outline-none focus:border-[#bd905b] focus:bg-[#111] transition-all backdrop-blur-sm"
              />
              <label className="absolute left-5 -top-2.5 text-xs text-[#666] bg-[#050505] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#bd905b] peer-focus:bg-[#050505] px-1 pointer-events-none rounded">
                Password
              </label>
              {errors.password && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.password.message}</p>}
            </div>

            {role === 'doctor' && (
              <div className="group relative pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                <input
                  type="text"
                  {...register('licenseNumber')}
                  placeholder=" "
                  className="peer w-full px-5 py-4 bg-[#111]/50 border border-[#222] rounded-xl text-white placeholder-transparent focus:outline-none focus:border-[#bd905b] focus:bg-[#111] transition-all backdrop-blur-sm"
                />
                <label className="absolute left-5 -top-2.5 text-xs text-[#666] bg-[#050505] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#bd905b] peer-focus:bg-[#050505] px-1 pointer-events-none rounded">
                  License Number
                </label>
                {errors.licenseNumber && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-1">{errors.licenseNumber.message}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#bd905b] text-black font-bold py-4 rounded-xl hover:bg-[#c99e69] hover:shadow-[0_0_20px_rgba(189,144,91,0.4)] transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none mt-8 flex justify-center items-center gap-2 group relative overflow-hidden"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  <span className="relative z-10">Sign Up</span>
                  <div className="absolute inset-0 h-full w-0 bg-white/20 transition-[width] duration-300 ease-out group-hover:w-full"></div>
                </>
              )}
            </button>
          </form>

          <p className="text-[#666] text-center mt-8 text-sm">
            Already have an account? <Link to="/login" className="text-[#bd905b] font-medium hover:text-white transition-colors hover:underline">Log in</Link>
          </p>
        </div>
      </div>

      {/* Right Column: Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2969&auto=format&fit=crop" 
          alt="Dogs running" 
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-75 contrast-125"
        />
        <div className="absolute bottom-16 right-16 z-20 max-w-md text-right">
          <p className="text-3xl text-white font-light leading-snug mb-4">"Because every pet deserves a second chance at happiness."</p>
          <div className="w-12 h-[1px] bg-[#bd905b] ml-auto mb-3"></div>
          <p className="text-sm tracking-widest uppercase text-white/70">PetConnect Initiative</p>
        </div>
      </div>

    </div>
  );
}
