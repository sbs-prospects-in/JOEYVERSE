import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Clock,
  Calendar,
  PhoneCall,
  MessageCircle,
  PawPrint,
} from "lucide-react";

export default function ConsultationHistory({ consultations }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 lg:col-span-2">
      <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
        <Activity size={20} className="text-slate-700" /> Recent Consultations
      </h2>

      <div className="space-y-4">
        {consultations.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              No Consultations Yet
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
              You haven't chatted with any doctors yet. Connect with a verified
              professional instantly.
            </p>
            <button
              onClick={() => navigate("/doctors")}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 transition-colors"
            >
              Browse Doctors
            </button>
          </div>
        ) : (
          consultations.map((cons) => (
            <div
              key={cons.id}
              className="group bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between shadow-sm hover:border-blue-200 hover:shadow-lg transition-all duration-300 gap-4"
            >
              {/* Left: Avatar & Details */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="relative shrink-0">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner ${
                      cons.status === "RINGING"
                        ? "bg-gradient-to-br from-amber-400 to-amber-600"
                        : cons.status === "ACTIVE"
                          ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                          : "bg-gradient-to-br from-slate-600 to-slate-800"
                    }`}
                  >
                    {cons.doctor?.name?.[0] || "D"}
                  </div>
                  {cons.status === "RINGING" && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-amber-400 animate-ping opacity-75" />
                  )}
                  {cons.status === "ACTIVE" && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 animate-pulse opacity-75" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate group-hover:text-blue-700 transition-colors">
                    Dr. {cons.doctor?.name?.replace("Dr. ", "") || "Doctor"}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-slate-500 text-xs sm:text-sm font-medium">
                      {cons.doctor?.specialization || "General Vet"}
                    </span>
                    {cons.pet?.name && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                        <PawPrint size={10} /> {cons.pet.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Meta, Status & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0 shrink-0">
                {/* Price & Time */}
                <div className="hidden lg:flex flex-col items-end">
                  {cons.status === "COMPLETED" &&
                  cons.started_at &&
                  cons.ended_at ? (
                    (() => {
                      const start = new Date(cons.started_at).getTime();
                      const end = new Date(cons.ended_at).getTime();
                      let seconds = Math.floor((end - start) / 1000);
                      if (seconds < 0) seconds = 0;
                      const m = Math.floor(seconds / 60)
                        .toString()
                        .padStart(2, "0");
                      const s = (seconds % 60).toString().padStart(2, "0");
                      const intervals = Math.ceil(Math.max(seconds, 1) / 60);
                      const cost = intervals * (cons.per_minute_rate || 0);

                      return (
                        <>
                          <div className="text-sm font-black text-emerald-600">
                            Paid: ₹{cost}
                          </div>
                          <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1 justify-end">
                            <Clock size={12} /> {m}:{s} mins
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <>
                      <div className="text-sm font-bold text-slate-700">
                        ₹{cons.per_minute_rate || 0}/min
                      </div>
                      <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1 justify-end">
                        <Calendar size={12} />{" "}
                        {cons.created_at
                          ? new Date(cons.created_at).toLocaleDateString()
                          : ""}
                      </div>
                    </>
                  )}
                </div>

                {/* Status Pill & Action Button */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wide border shadow-sm ${
                      cons.status === "COMPLETED"
                        ? "bg-white text-slate-600 border-slate-200"
                        : cons.status === "RINGING"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : cons.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {cons.status}
                  </span>

                  {cons.status === "ACTIVE" && (
                    <button
                      onClick={() => navigate(`/pet-owner/chat/${cons.id}`)}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 shrink-0 whitespace-nowrap"
                    >
                      <PhoneCall size={14} className="animate-pulse" /> Join
                    </button>
                  )}

                  {cons.status === "COMPLETED" && (
                    <button
                      onClick={() => navigate(`/pet-owner/chat/${cons.id}`)}
                      className="bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-600 hover:text-white hover:shadow-md hover:-translate-y-0.5 px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shrink-0 whitespace-nowrap"
                    >
                      <MessageCircle size={14} /> View Chat
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
