import React from 'react';
import { Calendar, PawPrint, Clock, MessageCircle, Star, CheckCircle } from 'lucide-react';

export default function ConsultationRequests({
  appointments,
  handleAppointmentAction,
  history,
  navigate
}) {
  return (
    <>
      {/* Appointments Queue */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={18} className="text-indigo-500" /> Pending Appointments
          </h3>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {appointments.length}
          </span>
        </div>
        <div className="p-0">
          {appointments.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Calendar size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No pending appointment requests.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {appointments.map((appt) => (
                <li key={appt.id} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {appt.owner.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">
                          {appt.owner.name}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <PawPrint size={10} /> {appt.pet?.name || 'Pet'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                      {new Date(appt.scheduled_time).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAppointmentAction(appt.id, "APPROVED")}
                      className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-lg text-xs hover:bg-indigo-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAppointmentAction(appt.id, "REJECTED")}
                      className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-lg text-xs hover:bg-slate-200 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Consultations History */}
      <div className="mt-8 mb-12 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Clock size={18} className="text-blue-500" /> Recent Consultation History
          </h3>
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            View All
          </button>
        </div>
        <div className="p-0">
          {history.length === 0 ? (
            <div className="p-10 text-center">
              <CheckCircle size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="font-semibold text-slate-600">No past consultations yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Completed sessions will appear here for your records.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-4 sm:p-6">
              {history.map((session) => {
                let earnings = 0;
                let m = "--", s = "--";

                if (session.status === "CANCELLED" || session.status === "REJECTED") {
                  m = "00";
                  s = "00";
                  earnings = 0;
                } else if (
                  session.status === "COMPLETED" &&
                  session.started_at &&
                  session.ended_at
                ) {
                  const start = new Date(session.started_at).getTime();
                  const end = new Date(session.ended_at).getTime();
                  let seconds = Math.floor((end - start) / 1000);
                  if (seconds < 0) seconds = 0;
                  m = Math.floor(seconds / 60).toString().padStart(2, "0");
                  s = (seconds % 60).toString().padStart(2, "0");

                  const intervals = Math.ceil(Math.max(seconds, 0) / 60);
                  earnings = intervals * session.per_minute_rate;
                }

                const dateToUse = session.ended_at || session.created_at;

                return (
                  <div
                    key={session.id}
                    className="group bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between shadow-sm hover:border-blue-200 hover:shadow-lg transition-all duration-300 gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative shrink-0">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner ${
                            session.status === "COMPLETED"
                              ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                              : session.status === "REJECTED"
                                ? "bg-gradient-to-br from-rose-400 to-rose-600"
                                : "bg-gradient-to-br from-slate-400 to-slate-600"
                          }`}
                        >
                          {session.owner?.name?.[0] || "P"}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate group-hover:text-blue-700 transition-colors">
                          {session.owner?.name || "Patient"}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="text-slate-500 text-xs sm:text-sm font-medium font-mono">
                            ID: {session.id.split("-")[0]}
                          </span>
                          <span className="inline-flex items-center gap-1 text-slate-400 text-xs sm:text-sm">
                            <Calendar size={12} />
                            {new Date(dateToUse).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {session.rating && (
                      <div className="hidden xl:flex flex-col flex-1 px-4 min-w-[200px]">
                        <div className="flex items-center gap-1 text-amber-500 mb-1">
                          <Star size={14} fill="currentColor" />
                          <span className="text-sm font-bold text-slate-700">
                            {session.rating}.0
                          </span>
                        </div>
                        {session.feedback && (
                          <div className="text-xs text-slate-500 line-clamp-2 italic">
                            "{session.feedback}"
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0 shrink-0">
                      <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                        {session.status === "COMPLETED" && session.started_at && session.ended_at ? (
                          <>
                            <div className="text-sm font-black text-emerald-600">
                              Earned: ₹{earnings}
                            </div>
                            <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1">
                              <Clock size={12} /> {m}:{s} mins
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm font-bold text-slate-700">
                              ₹{session.per_minute_rate}/min
                            </div>
                            <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1">
                              <Calendar size={12} /> {new Date(dateToUse).toLocaleDateString()}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wide border shadow-sm ${
                            session.status === "COMPLETED"
                              ? "bg-white text-emerald-700 border-emerald-200"
                              : session.status === "REJECTED"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {session.status}
                        </span>
                        <button
                          onClick={() => navigate(`/doctor/chat/${session.id}`)}
                          className="bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-600 hover:text-white hover:shadow-md hover:-translate-y-0.5 px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shrink-0 whitespace-nowrap"
                        >
                          <MessageCircle size={14} /> View Chat
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
