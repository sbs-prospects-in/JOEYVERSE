import React from 'react';
import { XCircle } from 'lucide-react';

export default function DoctorProfileModal({
  selectedDoctor,
  setSelectedDoctor,
  handleDeleteDoctor,
  handleUpdateDoctorStatus
}) {
  if (!selectedDoctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10 rounded-t-3xl">
          <h2 className="text-xl font-black text-slate-900">Doctor Profile Info</h2>
          <button 
            onClick={() => setSelectedDoctor(null)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-2xl">
              {selectedDoctor.name?.[0] || 'D'}
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">{selectedDoctor.name || 'Unknown'}</h3>
              <p className="text-slate-500 font-medium">{selectedDoctor.email || 'No email provided'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">License Number</p>
              <p className="font-semibold text-slate-900">{selectedDoctor.license_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
              <p className="font-semibold text-slate-900">{selectedDoctor.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Specialization</p>
              <p className="font-semibold text-slate-900">{selectedDoctor.specialization || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Experience</p>
              <p className="font-semibold text-slate-900">{selectedDoctor.experience || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Consultation Rate</p>
              <p className="font-semibold text-slate-900">₹{selectedDoctor.per_minute_rate || 0} / min</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
              <p className="font-semibold text-slate-900">
                {[selectedDoctor.city, selectedDoctor.state].filter(Boolean).join(', ') || 'N/A'}
              </p>
            </div>
          </div>
          
          {selectedDoctor.qualification && (
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Qualifications</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedDoctor.qualification}</p>
            </div>
          )}
          
          {selectedDoctor.bio && (
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bio / About</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">{selectedDoctor.bio}</p>
            </div>
          )}
        </div>
        
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-100 p-6 flex justify-end gap-3 rounded-b-3xl">
          <button 
            onClick={() => setSelectedDoctor(null)}
            className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Close
          </button>
          {!selectedDoctor.verified ? (
            <>
              <button 
                onClick={() => {
                  handleDeleteDoctor(selectedDoctor.id);
                  setSelectedDoctor(null);
                }}
                className="px-4 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold rounded-xl transition-colors"
              >
                Decline Request
              </button>
              <button 
                onClick={() => {
                  handleUpdateDoctorStatus(selectedDoctor.id, { verified: true });
                  setSelectedDoctor(null);
                }}
                className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-xl shadow-sm hover:shadow transition-all"
              >
                Approve Doctor
              </button>
            </>
          ) : (
            <button 
              onClick={() => {
                handleUpdateDoctorStatus(selectedDoctor.id, { verified: false });
                setSelectedDoctor(null);
              }}
              className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold rounded-xl transition-colors"
            >
              Revoke Verification
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
