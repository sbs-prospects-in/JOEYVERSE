import React from 'react';
import { PhoneCall, Activity, CheckCircle, MessageCircle, X } from 'lucide-react';

export default function IncomingCalls({ isOnline, requests, handleAction }) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden opacity-0-init animate-fade-in-up delay-400 ${
        isOnline && requests.length > 0
          ? "bg-blue-600 border-blue-700 shadow-xl shadow-blue-500/20 text-white hover-float"
          : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      <div
        className={`px-6 py-5 border-b flex justify-between items-center ${
          isOnline && requests.length > 0 ? "border-blue-400/30" : "border-slate-100"
        }`}
      >
        <h3
          className={`font-bold flex items-center gap-2 ${
            isOnline && requests.length > 0 ? "text-white" : "text-slate-800"
          }`}
        >
          <PhoneCall
            size={18}
            className={isOnline && requests.length > 0 ? "animate-bounce" : ""}
          />
          Incoming Calls
        </h3>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isOnline && requests.length > 0
              ? "bg-white text-blue-600"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {requests.length} Ringing
        </span>
      </div>

      <div className="p-6">
        {!isOnline ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <Activity size={24} className="text-slate-400" />
            </div>
            <p className="font-semibold text-slate-600">You're Offline</p>
            <p className="text-sm text-slate-400 mt-1">Go online to receive calls.</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full border border-dashed border-slate-200 flex items-center justify-center mb-3">
              <CheckCircle size={24} className="text-slate-300" />
            </div>
            <p className="font-semibold text-slate-600">All clear</p>
            <p className="text-sm text-slate-400 mt-1">Waiting for consultations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white/10 border border-white/20 rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-lg leading-tight">
                      {req.pet?.name || "New Patient"}
                    </h4>
                    <p className="text-sm text-white/80">Owner: {req.owner?.name}</p>
                    {req.primary_concern && (
                      <p className="text-xs text-white/90 mt-1 italic opacity-90 line-clamp-2">
                        "{req.primary_concern}"
                      </p>
                    )}
                  </div>
                  <div className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">
                    Live Call
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleAction(req.id, "ACCEPT")}
                    className="flex-1 bg-white text-blue-600 font-bold py-2.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} /> Accept
                  </button>
                  <button
                    onClick={() => handleAction(req.id, "REJECT")}
                    className="w-12 flex items-center justify-center bg-white/20 text-white rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <X size={18} />
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
