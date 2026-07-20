import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../auth/store/authStore";
import { supabase } from "../../auth/api/supabase";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  LogOut,
  Activity,
  Users,
  Star,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
  Bell,
  MessageCircle,
  TrendingUp,
  Calendar,
  Zap,
  ShieldCheck,
  X,
  PhoneCall,
  PawPrint,
  User,
} from "lucide-react";

export default function DoctorDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeConsultations, setActiveConsultations] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [todaysSessions, setTodaysSessions] = useState(0);
  const [earningsFilter, setEarningsFilter] = useState("Weekly");
  const [earningsSummary, setEarningsSummary] = useState({
    Today: 0,
    Weekly: 0,
    Monthly: 0,
    Total: 0,
  });
  const [averageRating, setAverageRating] = useState("0.0");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    if (isOnline && user?.id) {
      await supabase
        .from("doctor_profiles")
        .update({ status: "OFFLINE" })
        .eq("id", user.id);
    }
    await logout();
    navigate("/");
  };

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    // 1. Fetch Doctor Status from doctor_profiles
    const { data: profile } = await supabase
      .from("doctor_profiles")
      .select("status, name")
      .eq("id", user.id)
      .single();

    if (profile) {
      setIsOnline(profile.status === "ONLINE");
      setProfileData(profile);
    }

    // Helper to enrich consultations with owner names
    const enrichWithOwnerNames = async (consultationsData) => {
      if (!consultationsData || consultationsData.length === 0) return [];
      
      const ownerIds = [...new Set(consultationsData.map((c) => c.owner_id).filter(Boolean))];
      const petIds = [...new Set(consultationsData.map((c) => c.pet_id).filter(Boolean))];
      
      const { data: owners } = await supabase
        .from("owner_profiles")
        .select("id, name")
        .in("id", ownerIds);

      let pets = null;
      if (petIds.length > 0) {
        const { data } = await supabase
          .from("pets")
          .select("id, name")
          .in("id", petIds);
        pets = data;
      }

      const ownerMap = {};
      if (owners) {
        owners.forEach((o) => (ownerMap[o.id] = o.name));
      }
      
      const petMap = {};
      if (pets) {
        pets.forEach((p) => (petMap[p.id] = p.name));
      }

      return consultationsData.map((c) => ({
        ...c,
        owner: { name: ownerMap[c.owner_id] || "Pet Owner" },
        pet: c.pet_id && petMap[c.pet_id] ? { name: petMap[c.pet_id] } : null,
      }));
    };

    // 2. Fetch Incoming Consultations (RINGING)
    const { data: reqData } = await supabase
      .from("consultations")
      .select(`id, status, created_at, owner_id, primary_concern, pet_id`)
      .eq("doctor_id", user.id)
      .eq("status", "RINGING")
      .order("created_at", { ascending: false });

    if (reqData) setRequests(await enrichWithOwnerNames(reqData));

    // 3. Fetch Active Consultations
    const { data: activeData } = await supabase
      .from("consultations")
      .select(`id, status, created_at, owner_id, primary_concern, pet_id`)
      .eq("doctor_id", user.id)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false });

    if (activeData)
      setActiveConsultations(await enrichWithOwnerNames(activeData));

    // 4. Fetch Waitlist
    const { data: waitlistData } = await supabase
      .from("consultations")
      .select("id, status, created_at, owner_id, primary_concern, pet_id")
      .eq("doctor_id", user.id)
      .eq("status", "WAITLIST")
      .order("created_at", { ascending: true });
    if (waitlistData) setWaitlist(await enrichWithOwnerNames(waitlistData));

    // 4b. Fetch Appointments
    const { data: apptData } = await supabase
      .from("appointments")
      .select(
        "id, status, scheduled_time, owner_id, pets(name), profiles(full_name)",
      )
      .eq("doctor_id", user.id)
      .eq("status", "pending")
      .order("scheduled_time", { ascending: true });

    if (apptData) {
      setAppointments(
        apptData.map((a) => ({
          ...a,
          owner: { name: a.profiles?.full_name || "Pet Owner" },
          pet: { name: a.pets?.name || "Pet" },
        })),
      );
    }

    // 5. Fetch History
    const { data: historyData } = await supabase
      .from("consultations")
      .select(
        "id, status, created_at, owner_id, started_at, ended_at, per_minute_rate, rating, feedback, primary_concern, pet_id",
      )
      .eq("doctor_id", user.id)
      .in("status", ["COMPLETED", "REJECTED", "CANCELLED"])
      .order("created_at", { ascending: false });

    if (historyData) {
      let finalHistory = await enrichWithOwnerNames(historyData.slice(0, 5));

      // MOCK DATA: if there is no real history, show mock history so the user can see the UI
      if (finalHistory.length === 0) {
        const mockNow = new Date();
        finalHistory = [
          {
            id: "mock-1",
            status: "COMPLETED",
            created_at: new Date(
              mockNow.getTime() - 2 * 60 * 60 * 1000,
            ).toISOString(),
            started_at: new Date(
              mockNow.getTime() - 2 * 60 * 60 * 1000,
            ).toISOString(),
            ended_at: new Date(
              mockNow.getTime() - 1.5 * 60 * 60 * 1000,
            ).toISOString(),
            per_minute_rate: 15,
            rating: 5,
            feedback: "Great consultation! Very helpful.",
            owner: { name: "Rahul Kumar" },
          },
          {
            id: "mock-2",
            status: "COMPLETED",
            created_at: new Date(
              mockNow.getTime() - 24 * 60 * 60 * 1000,
            ).toISOString(),
            started_at: new Date(
              mockNow.getTime() - 24 * 60 * 60 * 1000,
            ).toISOString(),
            ended_at: new Date(
              mockNow.getTime() - 23.8 * 60 * 60 * 1000,
            ).toISOString(),
            per_minute_rate: 15,
            rating: 4,
            feedback: "Good advice.",
            owner: { name: "Priya Sharma" },
          },
          {
            id: "mock-3",
            status: "COMPLETED",
            created_at: new Date(
              mockNow.getTime() - 48 * 60 * 60 * 1000,
            ).toISOString(),
            started_at: new Date(
              mockNow.getTime() - 48 * 60 * 60 * 1000,
            ).toISOString(),
            ended_at: new Date(
              mockNow.getTime() - 47.5 * 60 * 60 * 1000,
            ).toISOString(),
            per_minute_rate: 15,
            rating: 5,
            feedback: "Amazing vet, solved my issue quickly.",
            owner: { name: "Amit Patel" },
          },
        ];

        // Populate dummy active/waitlist for UI demonstration if empty
        if (activeConsultations.length === 0) {
          setActiveConsultations([
            {
              id: "mock-active",
              status: "ACTIVE",
              owner: { name: "Ravi Verma" },
            },
          ]);
        }
      }

      setHistory(finalHistory);

      const dataToProcess = historyData.length > 0 ? historyData : finalHistory;
      // Calculate stats
      const now = new Date();
      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).getTime();
      const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      const oneMonthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

      let sessionsToday = 0;
      let eToday = 0,
        eWeek = 0,
        eMonth = 0,
        eTotal = 0;
      let totalRating = 0;
      let ratingCount = 0;

      dataToProcess.forEach((c) => {
        if (c.status === "COMPLETED" && c.started_at && c.ended_at) {
          const endedTime = new Date(c.ended_at).getTime();
          const startedTime = new Date(c.started_at).getTime();

          const seconds = Math.floor((endedTime - startedTime) / 1000);
          const intervals = Math.ceil(Math.max(seconds, 0) / 60);
          const cost = intervals * c.per_minute_rate;

          eTotal += cost;
          if (endedTime >= today) {
            sessionsToday++;
            eToday += cost;
          }
          if (endedTime >= oneWeekAgo) {
            eWeek += cost;
          }
          if (endedTime >= oneMonthAgo) {
            eMonth += cost;
          }
        }

        if (c.rating) {
          totalRating += c.rating;
          ratingCount++;
        }
      });

      setTodaysSessions(sessionsToday);
      setEarningsSummary({
        Today: eToday,
        Weekly: eWeek,
        Monthly: eMonth,
        Total: eTotal,
      });
      setAverageRating(
        ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "0.0",
      );
    }

    setLoading(false);
  };

  const prevRequestsRef = useRef();
  useEffect(() => {
    prevRequestsRef.current = requests;
  }, [requests]);

  useEffect(() => {
    if (!user?.id) return;

    // Request Browser Notification Permission
    if (
      "Notification" in window &&
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }

    fetchDashboardData();

    // Listen to consultations (Realtime)
    const queueChannel = supabase
      .channel("public:consultations_doctor")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "consultations",
          filter: `doctor_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new?.status === "RINGING") {
            toast("Incoming Consultation Request!", {
              icon: "🔔",
              duration: 4000,
            });

            // Trigger Native Browser Notification
            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("Incoming Patient!", {
                body: "You have a new consultation request waiting.",
                icon: "/favicon.ico",
              });
            }
          }
          fetchDashboardData();
        },
      )
      .subscribe();

    // Fallback polling every 5 seconds just in case Realtime isn't fully configured on the table
    const pollInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => {
      supabase.removeChannel(queueChannel);
      clearInterval(pollInterval);
    };
  }, [user]);

  const toggleAvailability = async () => {
    const newStatus = isOnline ? "OFFLINE" : "ONLINE";
    setIsOnline(!isOnline);
    await supabase
      .from("doctor_profiles")
      .update({ status: newStatus })
      .eq("id", user.id);
    toast.success(`You are now ${newStatus}`);
  };

  const handleAction = async (consultationId, action) => {
    if (action === "ACCEPT") {
      const { error } = await supabase
        .from("consultations")
        .update({ status: "ACTIVE", started_at: new Date().toISOString() })
        .eq("id", consultationId);

      if (!error) {
        toast.success("Consultation started! redirecting...");
        setTimeout(() => navigate(`/doctor/chat/${consultationId}`), 1000);
      } else {
        toast.error("Failed to accept: " + error.message);
      }
    } else if (action === "REJECT") {
      const { error } = await supabase
        .from("consultations")
        .update({ status: "REJECTED" })
        .eq("id", consultationId);
      if (!error) {
        toast.success("Consultation rejected.");
        fetchDashboardData();
      }
    } else if (action === "CANCEL") {
      const confirmEnd = window.confirm(
        "Are you sure you want to end this consultation?",
      );
      if (!confirmEnd) return;
      const { error } = await supabase
        .from("consultations")
        .update({ status: "COMPLETED", ended_at: new Date().toISOString() })
        .eq("id", consultationId);
      if (!error) {
        toast.success("Consultation ended.");
        fetchDashboardData();
      }
    } else if (action === "CANCEL_WAITLIST") {
      const { error } = await supabase
        .from("consultations")
        .update({ status: "CANCELLED" })
        .eq("id", consultationId);
      if (!error) {
        toast.success("Removed from waitlist.");
        fetchDashboardData();
      }
    } else if (action === "ACCEPT_WAITLIST") {
      const { error } = await supabase
        .from("consultations")
        .update({ status: "ACTIVE", started_at: new Date().toISOString() })
        .eq("id", consultationId);
      if (!error) {
        toast.success("Waitlist accepted! redirecting...");
        setTimeout(() => navigate(`/doctor/chat/${consultationId}`), 1000);
      }
    }
  };

  const handleAppointmentAction = async (apptId, action) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status: action.toLowerCase() })
        .eq("id", apptId);

      if (!error) {
        toast.success(`Appointment ${action.toLowerCase()}!`);
        fetchDashboardData();
      } else {
        toast.error("Failed to update appointment.");
      }
    };

    const earningsData = React.useMemo(() => {
      if (!history || history.length === 0) return [];
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      let dataMap = {}; // key -> { earnings, patients }

      history.forEach(c => {
        if (c.status === "COMPLETED" && c.started_at && c.ended_at) {
          const endedTime = new Date(c.ended_at).getTime();
          const startedTime = new Date(c.started_at).getTime();
          const seconds = Math.floor((endedTime - startedTime) / 1000);
          const intervals = Math.ceil(Math.max(seconds, 0) / 60);
          const cost = intervals * c.per_minute_rate;
          const dateObj = new Date(c.ended_at);

          if (earningsFilter === 'Today') {
            if (endedTime >= today) {
              const hour = dateObj.getHours() + ':00';
              if (!dataMap[hour]) dataMap[hour] = { earnings: 0, patients: 0 };
              dataMap[hour].earnings += cost;
              dataMap[hour].patients += 1;
            }
          } else if (earningsFilter === 'Weekly') {
            const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
            if (endedTime >= oneWeekAgo) {
              const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              if (!dataMap[day]) dataMap[day] = { earnings: 0, patients: 0 };
              dataMap[day].earnings += cost;
              dataMap[day].patients += 1;
            }
          } else if (earningsFilter === 'Monthly') {
            const oneMonthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
            if (endedTime >= oneMonthAgo) {
              const week = 'W' + Math.ceil(dateObj.getDate() / 7);
              if (!dataMap[week]) dataMap[week] = { earnings: 0, patients: 0 };
              dataMap[week].earnings += cost;
              dataMap[week].patients += 1;
            }
          } else { // Total
            const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
            if (!dataMap[month]) dataMap[month] = { earnings: 0, patients: 0 };
            dataMap[month].earnings += cost;
            dataMap[month].patients += 1;
          }
        }
      });

      return Object.keys(dataMap).map(key => ({
        name: key,
        earnings: dataMap[key].earnings,
        patients: dataMap[key].patients
      }));
    }, [history, earningsFilter]);

    const fullDisplayName =
      profileData?.name ||
      (user?.email?.includes("anjali")
        ? "Dr. Anjali Mehta"
        : user?.email?.includes("marcus")
          ? "Dr. Marcus Owens"
          : user?.email?.includes("priya")
            ? "Dr. Priya Nair"
            : "Doctor Portal");
    const firstName =
      fullDisplayName.replace(/^Dr\.\s*/, "").split(" ")[0] || "Doctor";

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/20 pb-20 overflow-x-hidden">
        <Toaster position="top-center" />

        {/* Top Navigation / Header */}
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
                      (profileData?.email || user?.email || "").includes(
                        "anjali",
                      )
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
              {/* Elegant Simple Status Toggle */}
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

              <div className="relative group">
                <button className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors focus:outline-none">
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <img
                      src={
                        (profileData?.email || user?.email || "").includes(
                          "anjali",
                        )
                          ? "/images/dr-anjali.png"
                          : "/images/dr-marcus.png"
                      }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                    {firstName}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right">
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">
                      {fullDisplayName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Star
                        size={12}
                        className="text-amber-500 fill-amber-500"
                      />
                      <span className="text-xs font-medium text-slate-600">
                        {averageRating} Rating
                      </span>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => navigate("/doctor/profile")}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-left"
                    >
                      <User size={16} /> Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Metric Cards Row */}
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
                    onBlur={() =>
                      setTimeout(() => setIsDropdownOpen(false), 200)
                    }
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
                            <CheckCircle
                              size={14}
                              className="text-emerald-500"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <h3 className="text-3xl font-black text-slate-900">
                  ₹{earningsSummary[earningsFilter].toLocaleString()}
                </h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <IndianRupee size={24} />
              </div>
            </div>
          </div>

          {/* Main Grid: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (Incoming & Waitlist) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Incoming Calls Panel */}
              <div
                className={`rounded-2xl border transition-all duration-300 overflow-hidden opacity-0-init animate-fade-in-up delay-400 ${
                  isOnline && requests.length > 0
                    ? "bg-blue-600 border-blue-700 shadow-xl shadow-blue-500/20 text-white hover-float"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div
                  className={`px-6 py-5 border-b flex justify-between items-center ${
                    isOnline && requests.length > 0
                      ? "border-blue-400/30"
                      : "border-slate-100"
                  }`}
                >
                  <h3
                    className={`font-bold flex items-center gap-2 ${isOnline && requests.length > 0 ? "text-white" : "text-slate-800"}`}
                  >
                    <PhoneCall
                      size={18}
                      className={
                        isOnline && requests.length > 0 ? "animate-bounce" : ""
                      }
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
                      <p className="font-semibold text-slate-600">
                        You're Offline
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Go online to receive calls.
                      </p>
                    </div>
                  ) : requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full border border-dashed border-slate-200 flex items-center justify-center mb-3">
                        <CheckCircle size={24} className="text-slate-300" />
                      </div>
                      <p className="font-semibold text-slate-600">All clear</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Waiting for consultations.
                      </p>
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
                              <p className="text-sm text-white/80">
                                Owner: {req.owner?.name}
                              </p>
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

              {/* Waitlist Panel */}
              {isOnline && (
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
                                onClick={() =>
                                  handleAction(w.id, "ACCEPT_WAITLIST")
                                }
                                className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleAction(w.id, "CANCEL_WAITLIST")
                                }
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
              )}
            </div>

            {/* Right Column (Active & Charts) */}
            <div className="lg:col-span-7 space-y-6 opacity-0-init animate-fade-in-up delay-600">
              {/* Active Consultations */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <MessageCircle size={18} className="text-emerald-500" />{" "}
                    Active Consultations
                  </h3>
                </div>

                <div className="p-6">
                  {activeConsultations.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <MessageCircle size={24} className="text-slate-300" />
                      </div>
                      <p className="font-semibold text-slate-600">
                        No active chats
                      </p>
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

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 text-sm">
                      Revenue Forecast
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <TrendingUp size={10} /> +12%
                    </span>
                  </div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={earningsData}
                        margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="name"
                          stroke="#cbd5e1"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis
                          stroke="#cbd5e1"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `₹${val / 1000}k`}
                        />
                        <Tooltip
                          cursor={{ fill: "#f8fafc" }}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Bar dataKey="earnings" radius={[4, 4, 4, 4]}>
                          {earningsData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                index === earningsData.length - 1
                                  ? "#3b82f6"
                                  : "#e2e8f0"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 text-sm">
                      Patient Flow
                    </h3>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Last 7 Days
                    </span>
                  </div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={earningsData}
                        margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorPatients"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#8b5cf6"
                              stopOpacity={0.2}
                            />
                            <stop
                              offset="95%"
                              stopColor="#8b5cf6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="name"
                          stroke="#cbd5e1"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis
                          stroke="#cbd5e1"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="patients"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorPatients)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              {/* Appointments Queue */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Calendar size={18} className="text-indigo-500" />{" "}
                        Pending Appointments
                      </h3>
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {appointments.length}
                      </span>
                    </div>
                    <div className="p-0">
                      {appointments.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                          <Calendar
                            size={24}
                            className="mx-auto text-slate-300 mb-2"
                          />
                          <p className="text-sm font-medium">
                            No pending appointment requests.
                          </p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-slate-100">
                          {appointments.map((appt) => (
                            <li
                              key={appt.id}
                              className="p-5 hover:bg-slate-50 transition-colors"
                            >
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
                                      <PawPrint size={10} /> {appt.pet.name}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                                  {new Date(appt.scheduled_time).toLocaleString(
                                    undefined,
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleAppointmentAction(appt.id, "APPROVED")
                                  }
                                  className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-lg text-xs hover:bg-indigo-700 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleAppointmentAction(appt.id, "REJECTED")
                                  }
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
                  <Clock size={18} className="text-blue-500" /> Recent
                  Consultation History
                </h3>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View All
                </button>
              </div>

              <div className="p-0">
                {history.length === 0 ? (
                  <div className="p-10 text-center">
                    <CheckCircle
                      size={32}
                      className="mx-auto text-slate-300 mb-3"
                    />
                    <p className="font-semibold text-slate-600">
                      No past consultations yet
                    </p>
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
                        const start = new Date(
                          session.started_at,
                        ).getTime();
                        const end = new Date(session.ended_at).getTime();
                        let seconds = Math.floor((end - start) / 1000);
                        if (seconds < 0) seconds = 0;
                        m = Math.floor(seconds / 60)
                          .toString()
                          .padStart(2, "0");
                        s = (seconds % 60).toString().padStart(2, "0");
                        
                        const intervals = Math.ceil(
                          Math.max(seconds, 0) / 60,
                        );
                        earnings = intervals * session.per_minute_rate;
                      }

                      const dateToUse =
                        session.ended_at || session.created_at;

                      return (
                        <div
                          key={session.id}
                          className="group bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between shadow-sm hover:border-blue-200 hover:shadow-lg transition-all duration-300 gap-4"
                        >
                          {/* Left: Avatar & Patient Details */}
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

                          {/* Middle: Rating & Feedback (If completed) */}
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

                          {/* Right: Meta, Status & Actions */}
                          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0 shrink-0">
                            {/* Earnings & Time */}
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

                            {/* Status Pill & Action Button */}
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
                                onClick={() =>
                                  navigate(`/doctor/chat/${session.id}`)
                                }
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
          </div>
        </div>
      </div>
    </div>
  );
}
