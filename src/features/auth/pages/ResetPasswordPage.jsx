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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden font-sans p-4">
      <Toaster position="top-center" toastOptions={{ style: { background: '#222', color: '#fff', borderRadius: '12px', border: '1px solid #333' } }} />
      
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#bd905b]/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 bg-[#111]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block mb-4">
            <span className="text-xs tracking-[0.3em] text-[#bd905b] uppercase font-bold">PetConnect</span>
          </Link>
          <h1 className="text-3xl font-light text-white mb-2 tracking-tight">Set New <span className="font-semibold">Password</span></h1>
          <p className="text-[#888] text-sm">Please enter a new, secure password below.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="group relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className="peer w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-[#bd905b] transition-all"
              required
            />
            <label className="absolute left-5 -top-2.5 text-xs text-[#666] bg-[#111] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#bd905b] peer-focus:bg-[#111] px-1 pointer-events-none rounded">
              New Password
            </label>
          </div>

          <div className="group relative pt-2">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder=" "
              className="peer w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-[#bd905b] transition-all"
              required
            />
            <label className="absolute left-5 -top-2.5 text-xs text-[#666] bg-[#111] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-6 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#bd905b] peer-focus:bg-[#111] px-1 pointer-events-none rounded">
              Confirm Password
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#bd905b] text-black font-bold py-4 rounded-xl hover:bg-[#c99e69] hover:shadow-[0_0_20px_rgba(189,144,91,0.4)] transition-all duration-300 disabled:opacity-50 mt-4 flex justify-center items-center gap-2"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
