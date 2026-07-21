import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import { supabase } from '../../features/auth/api/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { Lock, ArrowRight } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword, isLoading } = useAuthStore();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if the user has a valid session (they arrived here from the email link)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      } else {
        toast.error("Invalid or expired password reset link.");
        setTimeout(() => navigate('/sign-in'), 3000);
      }
    };
    checkSession();

    // Supabase auth state listener in case the session is established after mount
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    const result = await updatePassword(newPassword);
    if (result.success) {
      toast.success("Password updated successfully!");
      // Sign out to force re-login with new password, or redirect directly if preferred
      await supabase.auth.signOut();
      setTimeout(() => navigate('/sign-in'), 2000);
    } else {
      toast.error(result.error || "Failed to update password");
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
      <Toaster position="top-right" />
      
      {/* Background decor */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-rose-200/20 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-emerald-200/20 blur-3xl pointer-events-none z-0" />

      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#f2687c]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#f2687c]/20">
            <Lock className="text-[#f2687c]" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Reset Password</h1>
          <p className="text-sm text-slate-500 font-medium">
            Enter your new secure password below.
          </p>
        </div>

        {!isValidSession ? (
          <div className="text-center text-slate-600 bg-slate-100 p-4 rounded-xl border border-slate-200 font-medium">
            Checking secure link...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[0.65rem] font-black text-slate-600 uppercase tracking-widest px-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters" 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#f2687c] focus:bg-white pl-11 pr-4 py-3.5 rounded-xl outline-none transition-all text-sm text-slate-700 shadow-sm"
                  required 
                  minLength={6}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[0.65rem] font-black text-slate-600 uppercase tracking-widest px-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retype password" 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#f2687c] focus:bg-white pl-11 pr-4 py-3.5 rounded-xl outline-none transition-all text-sm text-slate-700 shadow-sm"
                  required 
                  minLength={6}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-[#f2687c] disabled:bg-slate-400 text-white font-extrabold text-xs py-4 px-6 rounded-xl transition-all duration-300 shadow-md uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] mt-2 flex justify-center items-center gap-2"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
              {!isLoading && <ArrowRight size={16} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
