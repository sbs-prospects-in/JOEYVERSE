import React from 'react';
import { Users, Clock, X } from 'lucide-react';

export default function Waitlist({ isOnline, waitlist, handleAction }) {
  if (!isOnline) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden opacity-0-init animate-fade-in-up delay-400 hover-float">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Users size={18} className="text-amber-500" /> Waitlist
        </h3>
        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
          {waitlist.length} Waiting
        </span>
      </div>
      <div className="p-0">
        {waitlist.length === 0 ? (
          <div className="p-8 text-center text-sm font-medium text-slate-400">
            Waitlist is currently empty.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {waitlist.map((w) => (
              <div
                key={w.id}
                className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {w.owner?.name}
                  </h4>
                  {w.primary_concern && (
                    <p className="text-xs text-slate-500 mb-1 italic line-clamp-1">
                      "{w.primary_concern}"
                    </p>
                  )}
                  <p className="text-xs font-medium text-amber-500 flex items-center gap-1 mt-0.5">
                    <Clock size={12} /> Waiting in queue
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(w.id, "ACCEPT_WAITLIST")}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleAction(w.id, "CANCEL_WAITLIST")}
                    className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
