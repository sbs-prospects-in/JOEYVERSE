import React from 'react';
import { Users, Activity, DollarSign, ShieldAlert } from 'lucide-react';

export default function PlatformRevenue({ wallets, doctors, consultations, totalRevenue }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Platform Overview</h1>
        <p className="text-slate-500 font-medium mt-1">Here is what is happening on Joeyverse today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-5 shadow-inner">
            <Users className="text-white" size={24} />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Registered Users</p>
          <p className="text-4xl font-black text-slate-900 tracking-tight">{wallets.length + doctors.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100/50 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5 shadow-inner">
            <ShieldAlert className="text-white" size={24} />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Doctors</p>
          <p className="text-4xl font-black text-slate-900 tracking-tight">{doctors.length}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-5 shadow-inner">
            <Activity className="text-white" size={24} />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Live Consultations</p>
          <p className="text-4xl font-black text-slate-900 tracking-tight">{consultations.filter(c => c.status === 'ACTIVE').length}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-5 shadow-inner">
            <DollarSign className="text-white" size={24} />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Platform Cut</p>
          <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-600 tracking-tight">₹{totalRevenue.toFixed(0)}</p>
        </div>
        
      </div>
    </div>
  );
}
