import React, { useRef, useState, useEffect } from "react";
import { useAuthStore } from "../../auth/store/authStore";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Plus,
  Star,
  PawPrint,
  Wallet,
  ChevronRight,
  MessageCircle,
  Clock,
  X,
  Activity,
  Video,
  PhoneCall,
  Calendar,
  ChevronDown,
  User,
  Trash2,
  Edit3,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../../auth/api/supabase";
import toast, { Toaster } from "react-hot-toast";
import StripeCheckoutModal from "../components/StripeCheckoutModal";
import Cropper from "react-easy-crop";
import NotificationBell from "../../../components/ui/NotificationBell";

// Helper: generate short human-readable ID like PET-01, PET-02
const shortId = (shortIdNum, prefix) => `${prefix}-${String(shortIdNum || 0).padStart(2, '0')}`;
// Helper: generate user short ID from index
const userShortId = (id, prefix) => `${prefix}-${String(id || '00').slice(0, 2).toUpperCase()}`;


// Helper for cropping image
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => {
    image.onload = resolve;
  });
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, "image/jpeg");
  });
};

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
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newPet, setNewPet] = useState({
    name: "",
    species: "Dog",
    breed: "",
    age: "",
    ageUnit: "Years",
  });

  const [petImageFile, setPetImageFile] = useState(null);
  const [petImagePreview, setPetImagePreview] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPetImagePreview(reader.result);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async (e) => {
    e.preventDefault();
    try {
      const croppedImage = await getCroppedImg(
        petImagePreview,
        croppedAreaPixels,
      );
      setPetImageFile(croppedImage);
      const url = URL.createObjectURL(croppedImage);
      setPetImagePreview(url);
      setIsCropping(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop image");
    }
  };

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
          id, created_at, status, per_minute_rate, doctor_id,
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
      Promise.all([
        fetchConsultations(),
        fetchPets(),
        fetchWallet()
      ]).finally(() => setLoading(false));

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
                if (u.status === "ACTIVE") {
                  toast.success("The doctor connected! Joining chat...", {
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
  const [isSubmittingPet, setIsSubmittingPet] = useState(false);

  const handleAddPet = async (e) => {
    e.preventDefault();
    if (!user?.id || isSubmittingPet) return;

    setIsSubmittingPet(true);
    const toastId = toast.loading("Adding companion...");

    try {
      let displayAge = `${newPet.age} ${newPet.ageUnit}`;

      const { data: insertedPets, error } = await supabase
        .from("pets")
        .insert({
          owner_id: user.id,
          name: newPet.name,
          species: newPet.species,
          breed: newPet.breed,
          age: newPet.age ? parseInt(newPet.age) : null,
          age_unit: newPet.ageUnit || 'Years',
        })
        .select("id");

      toast.dismiss(toastId);

      if (!error) {
        const insertedPet =
          insertedPets && insertedPets.length > 0 ? insertedPets[0] : null;

        // Upload image if selected and we got an ID back
        if (petImageFile && insertedPet) {
          try {
            const uploadPromise = supabase.storage
              .from("pet-images")
              .upload(`pet_profile_${insertedPet.id}`, petImageFile, {
                upsert: true,
              });

            // 10 second timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Image upload timed out")),
                10000,
              ),
            );

            const uploadResult = await Promise.race([
              uploadPromise,
              timeoutPromise,
            ]);

            if (!uploadResult?.error) {
              // Get public URL and update pet record
              const { data: urlData } = supabase.storage
                .from('pet-images')
                .getPublicUrl(`pet_profile_${insertedPet.id}`);
              if (urlData?.publicUrl) {
                await supabase.from('pets').update({ avatar_url: urlData.publicUrl }).eq('id', insertedPet.id);
              }
            } else {
              console.error("Supabase upload error:", uploadResult.error);
              toast.error("Companion saved, but image upload failed.");
            }
          } catch (uploadError) {
            console.error("Failed to upload image", uploadError);
            toast.error("Companion saved, but image upload failed.");
          }
        }

        setIsAddPetOpen(false);
        setNewPet({
          name: "",
          species: "Dog",
          breed: "",
          age: "",
          ageUnit: "Years",
        });
        setPetImageFile(null);
        setPetImagePreview(null);
        fetchPets();
        toast.success("Companion added!");
      } else {
        console.error("Error inserting pet:", error);
        toast.error(error?.message || "Error adding pet");
      }
    } catch (err) {
      toast.dismiss(toastId);
      console.error("Unexpected error in handleAddPet:", err);
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmittingPet(false);
    }
  };

  const handleDeletePet = async (petId) => {
    if (!confirm("Are you sure you want to remove this companion?")) return;
    const { error } = await supabase.from("pets").delete().eq("id", petId);
    if (!error) {
      toast.success("Pet removed successfully");
      setSelectedPet(null);
      fetchPets();
    } else {
      toast.error("Failed to remove pet");
    }
  };

  const [isEditingPet, setIsEditingPet] = useState(false);
  const [editPetData, setEditPetData] = useState({});

  const handleSavePet = async () => {
    if (!selectedPet?.id || !editPetData.name?.trim()) {
      toast.error("Pet name is required");
      return;
    }
    const { error } = await supabase.from("pets").update({
      name: editPetData.name.trim(),
      species: editPetData.species || selectedPet.species,
      breed: editPetData.breed || selectedPet.breed,
      age: editPetData.age !== undefined ? parseInt(editPetData.age) || null : selectedPet.age,
      age_unit: editPetData.age_unit || selectedPet.age_unit || 'Years',
    }).eq("id", selectedPet.id);

    if (!error) {
      toast.success("Pet updated!");
      setIsEditingPet(false);
      setSelectedPet(prev => ({...prev, ...editPetData, name: editPetData.name.trim()}));
      fetchPets();
    } else {
      toast.error("Failed to update pet: " + error.message);
    }
  };



  const handlePaymentSuccess = async (amountStr) => {
    if (!user?.id) return;

    // Ensure amount is a number
    const amount = parseFloat(amountStr);

    toast.success(`Successfully added ₹${amount} to your wallet!`);
    setIsStripeModalOpen(false);

    // Fetch wallet after a short delay to allow webhook to process
    setTimeout(() => {
      fetchWallet();
    }, 2000);
  };

  const handleTopUp = () => {
    setIsStripeModalOpen(true);
  };

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
              <div className="relative group" tabIndex="0">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors focus:outline-none">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {displayName[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                    {displayName}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-all duration-200 z-50 transform origin-top-right">
                  <div className="p-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <PawPrint size={12} className="text-blue-500" />
                      <span className="text-xs font-medium text-slate-600">
                        {myPets.length} {myPets.length === 1 ? "Pet" : "Pets"}{" "}
                        Registered
                      </span>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => navigate("/pet-owner/profile")}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-left"
                    >
                      <User size={16} /> Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
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
          {/* Wallet Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-slate-500 font-semibold">
                <Wallet size={18} className="text-emerald-500" /> Wallet Balance
              </div>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                Active
              </span>
            </div>
            <div>
              <div className="text-4xl font-black text-slate-900 tracking-tight">
                <span className="text-slate-400 font-medium text-2xl">₹</span>
                {Number(wallet.balance).toFixed(2)}
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleTopUp}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Recharge Wallet
                </button>
              </div>
            </div>
          </div>

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
            {/* Consultations Column */}
            <div className="space-y-6 lg:col-span-2">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Activity size={20} className="text-slate-700" /> Recent
                Consultations
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
                      You haven't chatted with any doctors yet. Connect with a
                      verified professional instantly.
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
                            {cons.doctor?.name[0] || "D"}
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
                            Dr. {cons.doctor?.name.replace("Dr. ", "") || "Doctor"}
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
                              const intervals = Math.ceil(
                                Math.max(seconds, 1) / 60,
                              );
                              const cost = intervals * cons.per_minute_rate;

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
                                ₹{cons.per_minute_rate}/min
                              </div>
                              <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1 justify-end">
                                <Calendar size={12} />{" "}
                                {new Date(cons.created_at).toLocaleDateString()}
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
                              onClick={() =>
                                navigate(`/pet-owner/chat/${cons.id}`)
                              }
                              className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 shrink-0 whitespace-nowrap"
                            >
                              <PhoneCall size={14} className="animate-pulse" /> Join
                            </button>
                          )}

                          {cons.status === "COMPLETED" && (
                            <button
                              onClick={() =>
                                navigate(`/pet-owner/chat/${cons.id}`)
                              }
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

            {/* Sidebar Column - My Pets */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <PawPrint size={20} className="text-slate-700" /> My
                  Companions
                </h2>
                <button
                  onClick={() => setIsAddPetOpen(true)}
                  className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                  {myPets.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <PawPrint
                        size={32}
                        className="mx-auto text-slate-300 mb-2"
                      />
                      <p className="font-semibold text-sm">
                        No pets registered yet
                      </p>
                    </div>
                  ) : (
                    myPets.map((pet, i) => {
                      const petShortId = pet.short_id ? shortId(pet.short_id, 'PET') : `PET-${String(i+1).padStart(2,'0')}`;
                      return (
                        <div
                          key={pet.id}
                          onClick={() => setSelectedPet(pet)}
                          className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm overflow-hidden ${
                                i % 3 === 0
                                  ? "bg-rose-500"
                                  : i % 3 === 1
                                    ? "bg-blue-500"
                                    : "bg-teal-500"
                              }`}
                            >
                              {pet.avatar_url ? (
                                <img
                                  src={pet.avatar_url}
                                  alt={pet.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{pet.name[0]}</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900 leading-tight">
                                  {pet.name}
                                </p>
                                <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  {petShortId}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {pet.species} • {pet.age} {pet.age_unit || 'yrs'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            size={16}
                            className="text-slate-300 group-hover:text-slate-600 transition-colors"
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Pet Details Modal */}
        {selectedPet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => handleDeletePet(selectedPet.id)}
                className="absolute top-6 left-6 w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                title="Delete Pet"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => {
                  setIsEditingPet(false);
                  setSelectedPet(null);
                }}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col items-center text-center mt-4">
                <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-4xl mb-3 shadow-sm border-[6px] border-white ring-1 ring-slate-100 overflow-hidden relative">
                  {selectedPet.avatar_url ? (
                    <img
                      src={selectedPet.avatar_url}
                      alt={selectedPet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{selectedPet.name[0].toLowerCase()}</span>
                  )}
                </div>
                <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest mb-2 shadow-sm border border-slate-200">
                  {selectedPet.short_id ? shortId(selectedPet.short_id, 'PET') : `PET-${selectedPet.id.substring(0,4).toUpperCase()}`}
                </span>

                {isEditingPet ? (
                  <div className="w-full text-left mt-2 space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name</label>
                      <input
                        value={editPetData.name ?? selectedPet.name}
                        onChange={e => setEditPetData(p => ({...p, name: e.target.value}))}
                        className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Species</label>
                        <select
                          value={editPetData.species ?? selectedPet.species}
                          onChange={e => setEditPetData(p => ({...p, species: e.target.value}))}
                          className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option>Dog</option>
                          <option>Cat</option>
                          <option>Bird</option>
                          <option>Rabbit</option>
                          <option>Fish</option>
                          <option>Reptile</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Breed</label>
                        <input
                          value={editPetData.breed ?? selectedPet.breed ?? ''}
                          onChange={e => setEditPetData(p => ({...p, breed: e.target.value}))}
                          className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Mixed"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Age</label>
                        <input
                          type="number" min="0" max="40"
                          value={editPetData.age ?? selectedPet.age ?? ''}
                          onChange={e => setEditPetData(p => ({...p, age: e.target.value}))}
                          className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit</label>
                        <select
                          value={editPetData.age_unit ?? selectedPet.age_unit ?? 'Years'}
                          onChange={e => setEditPetData(p => ({...p, age_unit: e.target.value}))}
                          className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option>Years</option>
                          <option>Months</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setIsEditingPet(false)}
                        className="flex-1 border border-slate-200 text-slate-600 font-bold py-3 rounded-2xl hover:bg-slate-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSavePet}
                        className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 transition-colors text-sm shadow-md"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-3xl font-black text-slate-900">
                      {selectedPet.name.toLowerCase()}
                    </h3>
                    <p className="text-slate-500 text-sm mt-2 flex items-center justify-center gap-1.5 font-medium">
                      <PawPrint size={14} className="text-slate-400" />{" "}
                      {selectedPet.species} • {selectedPet.breed || "Mixed"}
                    </p>

                    <div className="grid grid-cols-2 gap-4 w-full mt-8">
                      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 text-center flex flex-col justify-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                          Age
                        </div>
                        <div className="text-lg font-black text-slate-800">
                          {selectedPet.age} {selectedPet.age_unit || (selectedPet.age === 1 ? 'yr' : 'yrs')}
                        </div>
                      </div>
                      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 text-center flex flex-col justify-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                          Species
                        </div>
                        <div className="text-sm font-bold text-slate-700">
                          {selectedPet.species}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full mt-4">
                      <button
                        onClick={() => {
                          setIsEditingPet(true);
                          setEditPetData({
                            name: selectedPet.name,
                            species: selectedPet.species,
                            breed: selectedPet.breed || '',
                            age: selectedPet.age || '',
                            age_unit: selectedPet.age_unit || 'Years',
                          });
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 font-bold py-3.5 rounded-2xl hover:bg-blue-100 transition-colors shadow-sm text-sm"
                      >
                        <Edit3 size={14} /> Edit Pet
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingPet(false);
                          setSelectedPet(null);
                        }}
                        className="flex-1 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 font-bold py-3.5 rounded-2xl transition-colors shadow-sm text-sm"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}


        {/* Add Pet Modal */}
        {isAddPetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-xl relative animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Register Pet
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Add a new companion to your profile
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAddPetOpen(false);
                    setPetImagePreview(null);
                    setPetImageFile(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddPet} className="space-y-4">
                {/* Pet Profile Image Upload or Cropper */}
                {isCropping ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden mb-4">
                      <Cropper
                        image={petImagePreview}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                      />
                    </div>
                    <div className="w-full flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCropping(false)}
                        className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-xl text-sm font-bold hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCropSave}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-blue-700"
                      >
                        Crop & Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center mb-6">
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden relative group"
                    >
                      {petImagePreview ? (
                        <img
                          src={petImagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-blue-500">
                          <Plus size={24} />
                          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
                            Photo
                          </span>
                        </div>
                      )}
                      {petImagePreview && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-bold">
                            Change
                          </span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Pet's Name
                  </label>
                  <input
                    required
                    type="text"
                    value={newPet.name}
                    onChange={(e) =>
                      setNewPet({ ...newPet, name: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="e.g. Bella"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Species
                    </label>
                    <div className="relative">
                      <select
                        value={newPet.species}
                        onChange={(e) =>
                          setNewPet({ ...newPet, species: e.target.value })
                        }
                        className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                      >
                        <option>Dog</option>
                        <option>Cat</option>
                        <option>Bird</option>
                        <option>Rabbit</option>
                        <option>Other</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Age
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={newPet.age}
                        onChange={(e) =>
                          setNewPet({ ...newPet, age: e.target.value })
                        }
                        className="w-1/2 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-center"
                        placeholder="e.g. 3"
                      />
                      <div className="relative w-1/2">
                        <select
                          value={newPet.ageUnit}
                          onChange={(e) =>
                            setNewPet({ ...newPet, ageUnit: e.target.value })
                          }
                          className="w-full bg-white border border-slate-300 rounded-xl pl-3 pr-8 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                        >
                          <option>Years</option>
                          <option>Months</option>
                        </select>
                        <ChevronDown
                          size={12}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Breed (Optional)
                  </label>
                  <input
                    type="text"
                    value={newPet.breed}
                    onChange={(e) =>
                      setNewPet({ ...newPet, breed: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="e.g. Golden Retriever"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmittingPet}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm mt-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isSubmittingPet ? "Saving..." : "Save Companion"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stripe Modal */}
        <StripeCheckoutModal
          isOpen={isStripeModalOpen}
          onClose={() => setIsStripeModalOpen(false)}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  );
}
