import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast, { Toaster } from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, sendPasswordResetEmail, isLoading } = useAuthStore();
  const [isForgotPassword, setIsForgotPassword] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    const { success, error, role } = await login(data.email, data.password);
    
    if (success) {
      toast.success('Logged in successfully!');
      if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/pet-owner/dashboard');
      }
    } else {
      toast.error(error?.message || 'Failed to log in');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }
    const { success, error } = await sendPasswordResetEmail(resetEmail);
    if (success) {
      toast.success('Password reset link sent to your email!');
      setIsForgotPassword(false);
    } else {
      toast.error(error || 'Failed to send reset link');
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
            <h1 className="text-4xl md:text-5xl font-light text-white mb-3 tracking-tight">
              {isForgotPassword ? 'Reset Password' : <>Welcome <span className="font-semibold">Back</span></>}
            </h1>
            <p className="text-[#888] text-sm md:text-base">
              {isForgotPassword ? 'Enter your email to receive a secure reset link.' : 'Sign in to access your dashboard and appointments.'}
            </p>
          </div>

          {isForgotPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="group relative">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder=" "
                  className="peer w-full px-5 py-4 bg-[#111]/50 border border-[#222] rounded-xl text-white placeholder-transparent focus:outline-none focus:border-[#bd905b] focus:bg-[#111] transition-all backdrop-blur-sm"
                  required
                />
                <label className="absolute left-5 -top-2.5 text-xs text-[#666] bg-[#050505] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#bd905b] peer-focus:bg-[#050505] px-1 pointer-events-none rounded">
                  Email Address
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#bd905b] text-black font-bold py-4 rounded-xl hover:bg-[#c99e69] hover:shadow-[0_0_20px_rgba(189,144,91,0.4)] transition-all duration-300 disabled:opacity-50 mt-4 flex justify-center items-center gap-2 group relative overflow-hidden"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <>
                    <span className="relative z-10">Send Reset Link</span>
                    <div className="absolute inset-0 h-full w-0 bg-white/20 transition-[width] duration-300 ease-out group-hover:w-full"></div>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="w-full text-[#888] hover:text-white transition-colors text-sm font-medium mt-4"
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="group relative">
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
                
                <div className="flex justify-end pt-1">
                  <button 
                    type="button" 
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-[#888] hover:text-white transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#bd905b] text-black font-bold py-4 rounded-xl hover:bg-[#c99e69] hover:shadow-[0_0_20px_rgba(189,144,91,0.4)] transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none mt-4 flex justify-center items-center gap-2 group relative overflow-hidden"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    <>
                      <span className="relative z-10">Sign In</span>
                      <div className="absolute inset-0 h-full w-0 bg-white/20 transition-[width] duration-300 ease-out group-hover:w-full"></div>
                    </>
                  )}
                </button>
              </form>

              <p className="text-[#666] text-center mt-8 text-sm">
                Don't have an account? <Link to="/signup" className="text-[#bd905b] font-medium hover:text-white transition-colors hover:underline">Sign up</Link>
              </p>
            </>
          )}
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
          <p className="text-3xl text-white font-light leading-snug mb-4">"Connecting compassionate vets with caring pet owners."</p>
          <div className="w-12 h-[1px] bg-[#bd905b] ml-auto mb-3"></div>
          <p className="text-sm tracking-widest uppercase text-white/70">PetConnect Initiative</p>
        </div>
      </div>

    </div>
  );
}
