import React from 'react';
import { Users, Activity, DollarSign, ShieldAlert, ChevronRight } from 'lucide-react';

export default function PlatformRevenue({ wallets, doctors, consultations, totalRevenue, revenue = [] }) {
  const doctorEarnings = doctors.map(doc => {
    const docRevenue = revenue.filter(r => r.doctor_id === doc.id);
    const totalEarned = docRevenue.reduce((acc, curr) => acc + (curr.doctor_share ? Number(curr.doctor_share) : 0), 0);
    const totalGenerated = docRevenue.reduce((acc, curr) => acc + (curr.total_amount ? Number(curr.total_amount) : 0), 0);
    const platformCut = docRevenue.reduce((acc, curr) => acc + (curr.platform_share ? Number(curr.platform_share) : 0), 0);
    return { ...doc, totalEarned, totalGenerated, platformCut, consultationCount: docRevenue.length };
  }).filter(d => d.consultationCount > 0).sort((a, b) => b.totalGenerated - a.totalGenerated);
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

      {/* Doctor Earnings Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <DollarSign size={18} className="text-amber-500" /> Doctor Earnings Breakdown
          </h3>
        </div>
        <div className="p-0 overflow-x-auto">
          {doctorEarnings.length === 0 ? (
            <div className="p-10 text-center text-slate-500">No earnings data available yet.</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider font-bold text-slate-500">
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Consultations</th>
                  <th className="px-6 py-4">Total Generated</th>
                  <th className="px-6 py-4">Doctor Earned (70%)</th>
                  <th className="px-6 py-4 text-amber-600">Platform Cut (30%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctorEarnings.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {doc.name?.[0] || 'D'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{doc.name}</div>
                          <div className="text-xs text-slate-500">{doc.specialization}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {doc.consultationCount}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ₹{doc.totalGenerated.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      ₹{doc.totalEarned.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-600">
                      ₹{doc.platformCut.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
