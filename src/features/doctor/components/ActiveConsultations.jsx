import React from 'react';
import { MessageCircle, ChevronRight, X } from 'lucide-react';

export default function ActiveConsultations({ activeConsultations, handleAction, navigate }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <MessageCircle size={18} className="text-emerald-500" /> Active Consultations
        </h3>
      </div>

      <div className="p-6">
        {activeConsultations.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <MessageCircle size={24} className="text-slate-300" />
            </div>
            <p className="font-semibold text-slate-600">No active chats</p>
            <p className="text-sm text-slate-400 mt-1">
              Accepted consultations will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeConsultations.map((req) => (
              <div
                key={req.id}
                className="border border-slate-200 p-4 rounded-xl hover:border-emerald-200 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-0.5">
                      {req.owner?.name}
                    </h4>
                    {req.primary_concern && (
                      <p className="text-xs text-slate-500 mb-2 italic line-clamp-1">
                        "{req.primary_concern}"
                      </p>
                    )}
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />{" "}
                      In Progress
                    </span>
                  </div>
                  <button
                    onClick={() => handleAction(req.id, "CANCEL")}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="End Consultation"
                  >
                    <X size={16} />
                  </button>
                </div>
                <button
                  onClick={() => navigate(`/doctor/chat/${req.id}`)}
                  className="w-full bg-slate-900 text-white hover:bg-slate-800 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Open Chat <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
