import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { updatePassword, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const { success, error } = await updatePassword(password);
    if (success) {
      toast.success('Password updated successfully!');
      // Short delay so they see the success toast
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      toast.error(error || 'Failed to update password');
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-[1280px] mx-auto min-h-screen flex items-center justify-center relative overflow-hidden">
      <Toaster position="top-center" toastOptions={{ style: { background: '#fff', color: '#333', borderRadius: '12px', border: '1px solid #e5e7eb' } }} />
      
      {/* Mesh Background Blobs for Visual Glow */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-rose-200/20 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-[#A9DFBF]/20 blur-3xl pointer-events-none z-0" />

      <div className="bg-[#A9DFBF]/10 backdrop-blur-md rounded-[36px] p-8 md:p-10 shadow-2xl border border-[#A9DFBF]/30 max-w-md w-full z-10 relative">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block mb-4">
            <span className="text-xs tracking-[0.3em] text-[#bd905b] uppercase font-bold">PetConnect</span>
          </Link>
          <h1 className="text-3xl font-light text-slate-900 mb-2 tracking-tight">Set New <span className="font-semibold">Password</span></h1>
          <p className="text-slate-500 text-sm">Please enter a new, secure password below.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="group relative">
            <input
              type="password"
              id="newPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full px-5 py-4 bg-white/40 border border-slate-200/80 rounded-xl text-slate-700 placeholder-transparent focus:outline-none focus:border-[#f2687c] transition-all shadow-sm"
              placeholder="New Password"
              required
              minLength={6}
            />
            <label className="absolute left-5 -top-2.5 text-[0.65rem] font-black text-slate-600 uppercase tracking-widest bg-transparent transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-4 peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-[0.65rem] peer-focus:font-black peer-focus:text-rose-500 px-1 pointer-events-none rounded">
              New Password
            </label>
          </div>

          <div className="group relative pt-2">
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="peer w-full px-5 py-4 bg-white/40 border border-slate-200/80 rounded-xl text-slate-700 placeholder-transparent focus:outline-none focus:border-[#f2687c] transition-all shadow-sm"
              placeholder="Confirm Password"
              required
              minLength={6}
            />
            <label className="absolute left-5 -top-2.5 text-[0.65rem] font-black text-slate-600 uppercase tracking-widest bg-transparent transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-4 peer-placeholder-shown:font-normal peer-focus:-top-2.5 peer-focus:text-[0.65rem] peer-focus:font-black peer-focus:text-rose-500 px-1 pointer-events-none rounded">
              Confirm Password
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-[#f2687c] text-white font-extrabold text-xs py-4 px-6 rounded-xl transition-all duration-300 shadow-md uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
