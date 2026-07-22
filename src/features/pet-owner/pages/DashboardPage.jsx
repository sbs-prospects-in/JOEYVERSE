import React, { useRef, useState, useEffect } from "react";
import { useAuthStore } from "../../auth/store/authStore";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Plus,
  PawPrint,
  Wallet,
  ChevronRight,
  Clock,
  Activity,
  Video,
  Calendar,
  ChevronDown,
  User,
} from "lucide-react";
import { supabase } from "../../auth/api/supabase";
import toast, { Toaster } from "react-hot-toast";
import NotificationBell from "../../../components/ui/NotificationBell";
import WalletSection from "../components/WalletSection";
import ConsultationHistory from "../components/ConsultationHistory";
import PetProfiles from "../components/PetProfiles";

export default function PetOwnerDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const [consultations, setConsultations] = useState([]);
  const [myPets, setMyPets] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const fetchPets = async () => {
    if (user?.id) {
      const { data } = await supabase
        .from("pets")
        .select("*")
        .eq("owner_id", user.id);
      if (data) setMyPets(data);
    }
  };

  const fetchWallet = async () => {
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) {
          setWallet(data);
        } else {
          setWallet({ balance: 0 });
        }
        if (error) {
          console.error("Error fetching wallet:", error);
        }
      } catch (err) {
        console.error("Error fetching wallet:", err);
      }
    }
  };

  const fetchConsultations = async () => {
    if (user?.id) {
      const { data } = await supabase
        .from("consultations")
        .select(
          `
          id, created_at, status, per_minute_rate, doctor_id, started_at, ended_at,
          pet:pets(name)
        `,
        )
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        const doctorIds = [...new Set(data.map((c) => c.doctor_id))];
        const { data: doctors } = await supabase
          .from("doctor_profiles")
          .select("id, name, specialization")
          .in("id", doctorIds);

        const docMap = {};
        if (doctors) {
          doctors.forEach(
            (d) =>
              (docMap[d.id] = {
                name: d.name,
                specialization: d.specialization,
              }),
          );
        }

        const enriched = data.map((c) => ({
          ...c,
          doctor: docMap[c.doctor_id] || {
            name: "Doctor",
            specialization: "Vet",
          },
        }));
        setConsultations(enriched);
      } else {
        setConsultations([]);
      }
    }
  };

  const prevConsultationsRef = useRef();
  useEffect(() => {
    prevConsultationsRef.current = consultations;
  }, [consultations]);

  useEffect(() => {
    if (user?.id) {
      Promise.all([fetchConsultations(), fetchPets(), fetchWallet()]).finally(
        () => setLoading(false),
      );

      const channel = supabase
        .channel("public:consultations_owner")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "consultations",
            filter: `owner_id=eq.${user.id}`,
          },
          (payload) => {
            const oldCons = prevConsultationsRef.current?.find(
              (a) => a.id === payload.new?.id,
            );
            if (
              payload.new?.status === "READY_FOR_CHAT" &&
              oldCons?.status !== "READY_FOR_CHAT"
            ) {
              toast.success("The doctor accepted! Joining chat...", {
                duration: 4000,
                icon: "🩺",
              });
              navigate(`/pet-owner/chat/${payload.new.id}`);
            } else if (
              payload.new?.status === "ACTIVE" &&
              oldCons?.status !== "ACTIVE"
            ) {
              toast.success("The doctor connected! Joining chat...", {
                duration: 4000,
                icon: "🩺",
              });
              navigate(`/pet-owner/chat/${payload.new.id}`);
            } else if (
              payload.new?.status === "REJECTED" &&
              oldCons?.status !== "REJECTED"
            ) {
              toast.error("The doctor is busy and declined the call.", {
                duration: 4000,
              });
            }
            fetchConsultations();
          },
        )
        .subscribe();

      const walletChannel = supabase
        .channel("public:wallets_owner")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "wallets",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new) {
              setWallet(payload.new);
            }
          },
        )
        .subscribe();

      const fallbackInterval = setInterval(async () => {
        const oldConsList = prevConsultationsRef.current || [];
        const ringingCons = oldConsList.filter((c) => c.status === "RINGING");

        if (ringingCons.length > 0) {
          const { data: updated } = await supabase
            .from("consultations")
            .select("id, status")
            .in(
              "id",
              ringingCons.map((c) => c.id),
            );

          if (updated) {
            let changed = false;
            updated.forEach((u) => {
              const old = ringingCons.find((c) => c.id === u.id);
              if (old && old.status !== u.status) {
                changed = true;
                if (u.status === "READY_FOR_CHAT" || u.status === "ACTIVE") {
                  toast.success("The doctor accepted! Joining chat...", {
                    duration: 4000,
                    icon: "🟢",
                  });
                  navigate(`/pet-owner/chat/${u.id}`);
                } else if (u.status === "REJECTED") {
                  toast.error("The doctor is busy and declined the call.", {
                    duration: 4000,
                  });
                }
              }
            });
            if (changed) fetchConsultations();
          }
        }
      }, 2000);

      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(walletChannel);
        clearInterval(fallbackInterval);
      };
    }
  }, [user, navigate]);

  const displayName = user?.user_metadata?.name || user?.email || "Pet Owner";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center gap-3 cursor-pointer"
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
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <NotificationBell />
              {/* Profile Dropdown */}
              <div className="relative z-50">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors focus:outline-none"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {displayName[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-slate-700 hidden sm:block">
                    {displayName}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Invisible Overlay to catch outside clicks */}
                {isProfileOpen && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                )}

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900">
                        {displayName}
                      </p>
                      <p className="text-xs font-medium text-slate-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate("/pet-owner/profile");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <User size={16} /> Edit Profile
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
      </nav>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Hello, {displayName.split(" ")[0]}! 👋
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              How is your pet today?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/doctors")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <Video size={18} />
              Consult Doctor
            </button>
            <button
              onClick={() => setIsAddPetOpen(true)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Add Pet
            </button>
          </div>
        </div>

        {/* Stats & Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <WalletSection wallet={wallet} fetchWallet={fetchWallet} />

          {/* Find a Doctor Shortcut */}
          <div
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between group cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => navigate("/doctors")}
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Find a Specialist
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Browse our verified veterinarians and start a live consultation
                instantly.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm font-bold text-blue-600">
              Browse Doctors <ChevronRight size={16} />
            </div>
          </div>

          {/* Add a Pet Shortcut */}
          <div
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between group cursor-pointer hover:border-rose-300 transition-colors"
            onClick={() => setIsAddPetOpen(true)}
          >
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PawPrint size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Register a Pet
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Keep track of your furry friends to provide doctors with
                essential context.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm font-bold text-rose-600">
              Add Companion <ChevronRight size={16} />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - History & Navigation */}
          <div className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                History Menu
              </h2>
              <nav className="space-y-1">
                <button className="w-full flex items-center justify-between px-3 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Clock size={16} /> Consultations
                  </div>
                </button>
                <button className="w-full flex items-center justify-between px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} /> Appointments
                  </div>
                </button>
                <button className="w-full flex items-center justify-between px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Wallet size={16} /> Payments
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ConsultationHistory consultations={consultations} />

            <PetProfiles
              myPets={myPets}
              fetchPets={fetchPets}
              isAddPetOpen={isAddPetOpen}
              setIsAddPetOpen={setIsAddPetOpen}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
