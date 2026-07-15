import React, { useState } from 'react';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminSetup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleAdminSetup = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Fill all fields");

    // We pass 'admin' as the role
    const { success, error } = await signup(email, password, 'admin', { name: 'Super Admin' });
    if (success) {
      toast.success("Admin account created successfully! Redirecting...");
      navigate('/admin/dashboard');
    } else {
      toast.error(error?.message || "Failed to create admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Setup</h2>
          <p className="mt-2 text-sm text-slate-500">Create the first master admin account.</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleAdminSetup}>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="admin@joeyverse.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Secure Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Creating Admin...' : 'Create Admin Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-rose-500 font-bold bg-rose-50 py-2 px-3 rounded-lg border border-rose-100">
            Warning: Please delete this route from router.jsx after you create your account to prevent unauthorized access!
          </p>
        </div>
      </div>
    </div>
  );
}
