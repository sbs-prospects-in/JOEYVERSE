import React from 'react';
import { Eye, XOctagon } from 'lucide-react';

export default function ConsultationsHistory({
  consultations,
  setSelectedConsultation,
  handleForceEndConsultation
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Consultations History</h1>
        <p className="text-slate-500 font-medium mt-1">Global view of all platform sessions.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-5">Session ID</th>
              <th className="px-6 py-5">Doctor Profile</th>
              <th className="px-6 py-5">Session Rate</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5">Created At</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {consultations.map(cons => (
              <tr key={cons.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{cons.id.substring(0,8)}...</td>
                <td className="px-6 py-4 font-bold text-slate-700">{cons.doctor_id.substring(0,8)}</td>
                <td className="px-6 py-4 font-bold text-slate-900">₹{cons.per_minute_rate}/min</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    cons.status === 'COMPLETED' ? 'bg-slate-100 text-slate-600' :
                    cons.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {cons.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {new Date(cons.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedConsultation(cons)}
                      className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
                      title="Inspect Chat"
                    >
                      <Eye size={16} />
                      <span className="text-xs font-bold">Inspect</span>
                    </button>
                    {cons.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleForceEndConsultation(cons.id)}
                        className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5"
                        title="Force End Consultation"
                      >
                        <XOctagon size={16} />
                        <span className="text-xs font-bold">End</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
