import React from 'react';
import { ShieldCheck, ChevronDown, User, IndianRupee, LogOut } from 'lucide-react';
import NotificationBell from "../../../components/ui/NotificationBell";

export default function DashboardHeader({
  firstName,
  fullDisplayName,
  profileData,
  user,
  isOnline,
  toggleAvailability,
  isProfileOpen,
  setIsProfileOpen,
  setIsRateModalOpen,
  handleLogout,
  navigate
}) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-3 mr-4 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/images/logo_icon.png"
              alt="Joeyverse Icon"
              className="h-8 md:h-10 w-auto object-contain"
            />
            <img
              src="/images/logo_text.png"
              alt="Joeyverse Text"
              className="h-4 md:h-5 w-auto object-contain -translate-y-0.5 ml-1 hidden sm:block"
            />
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200">
              <img
                src={
                  (profileData?.email || user?.email || "").includes("anjali")
                    ? "/images/dr-anjali.png"
                    : "/images/dr-marcus.png"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Welcome back, {firstName}
              </h1>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-0.5">
                <ShieldCheck size={14} className="text-blue-500" />
                Verified Veterinary Specialist
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />

          <button
            onClick={toggleAvailability}
            className={`group relative flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 border shadow-sm ${
              isOnline
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div
              className={`relative w-9 h-5 rounded-full transition-colors duration-300 shrink-0 ${isOnline ? "bg-emerald-500 shadow-inner shadow-emerald-700/20" : "bg-slate-300 shadow-inner shadow-slate-400/20"}`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ease-out ${isOnline ? "translate-x-4" : "translate-x-0"}`}
              />
            </div>
            <span className="hidden sm:inline">
              {isOnline ? "Accepting Patients" : "Offline"}
            </span>
          </button>

          <div className="w-px h-6 bg-slate-200 hidden sm:block" />
          
          <div className="relative z-50">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors focus:outline-none"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <img
                  src={
                    (profileData?.email || user?.email || "").includes("anjali")
                      ? "/images/dr-anjali.png"
                      : "/images/dr-marcus.png"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-bold text-slate-700 hidden sm:block">
                {fullDisplayName}
              </span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
            )}

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="p-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900">
                    {fullDisplayName}
                  </p>
                  <p className="text-xs font-medium text-slate-500 truncate">
                    {profileData?.email || user?.email}
                  </p>
                </div>
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/doctor/profile");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <User size={16} /> Edit Profile
                  </button>
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsRateModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <IndianRupee size={16} className="text-slate-400" /> 
                      <span>Set Rate</span>
                    </div>
                    {profileData?.rate_status === 'Pending Approval' && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded font-bold">Pending</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
