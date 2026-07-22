import React from 'react';
import { Calendar, ChevronDown, CheckCircle, IndianRupee } from 'lucide-react';

export default function DashboardStats({ 
  todaysSessions, 
  earningsFilter, 
  isDropdownOpen, 
  setIsDropdownOpen, 
  setEarningsFilter, 
  earningsStats 
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
      {/* Sessions Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between group hover:border-blue-200 hover-float opacity-0-init animate-fade-in-up delay-100">
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-1">
            Today's Sessions
          </p>
          <h3 className="text-3xl font-black text-slate-900">
            {todaysSessions}
          </h3>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <Calendar size={24} />
        </div>
      </div>

      {/* Earnings Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between group hover:border-emerald-200 hover-float opacity-0-init animate-fade-in-up delay-300">
        <div>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
              className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors focus:outline-none bg-slate-50/50 hover:bg-emerald-50 px-3 py-1.5 rounded-lg"
            >
              {earningsFilter}'s Earnings
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-emerald-500" : ""}`}
              />
            </button>

            {/* Custom Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up origin-top-left">
                {["Today", "Weekly", "Monthly", "Total"].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setEarningsFilter(option);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-between ${
                      earningsFilter === option
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {option}'s Earnings
                    {earningsFilter === option && (
                      <CheckCircle size={14} className="text-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <h3 className="text-3xl font-black text-slate-900">
            ₹{earningsStats[earningsFilter]?.toLocaleString() || 0}
          </h3>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
          <IndianRupee size={24} />
        </div>
      </div>
    </div>
  );
}
