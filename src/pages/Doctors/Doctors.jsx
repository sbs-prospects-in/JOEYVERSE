import React, { useState, useEffect } from 'react';
import { supabase } from '../../features/auth/api/supabase';
import { useAuthStore } from '../../features/auth/store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Star, Award, MessageCircle, X, 
  ArrowLeft, Activity, ShieldCheck, Zap, User, Clock, PhoneCall, ChevronDown, Heart
} from 'lucide-react';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Ringing Flow State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [currentConsultationId, setCurrentConsultationId] = useState(null);
  const [isRinging, setIsRinging] = useState(false);
  
  // Pet Selection State
  const [myPets, setMyPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');

  // Wishlist State
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Fetch wishlists
  useEffect(() => {
    if (user?.id) {
      supabase.from('wishlists').select('doctor_id').eq('user_id', user.id)
        .then(({ data }) => {
          if (data) {
            setWishlistIds(new Set(data.map(w => w.doctor_id)));
          }
        });
    }
  }, [user]);

  const toggleWishlist = async (doctorId) => {
    if (!user) {
      toast.error("Please login to save to wishlist");
      return;
    }
    
    const isWishlisted = wishlistIds.has(doctorId);
    if (isWishlisted) {
      const { error } = await supabase.from('wishlists').delete().match({ user_id: user.id, doctor_id: doctorId });
      if (!error) {
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.delete(doctorId);
          return next;
        });
        toast.success("Removed from wishlist");
      }
    } else {
      const { error } = await supabase.from('wishlists').insert({ user_id: user.id, doctor_id: doctorId });
      if (!error || error.code === '23505') { // 23505 is unique violation, effectively meaning it's already there
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.add(doctorId);
          return next;
        });
        if (!error) toast.success("Saved to wishlist");
      } else {
        toast.error("Failed to save to wishlist");
      }
    }
  };


  // Fetch user's pets
  useEffect(() => {
    if (user?.id) {
      supabase.from('pets').select('id, name').eq('owner_id', user.id)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setMyPets(data);
            setSelectedPetId(data[0].id);
          }
        });
    }
  }, [user]);

  const [primaryConcern, setPrimaryConcern] = useState("");

  useEffect(() => {
    fetchDoctors();
    
    const channel = supabase
      .channel('public:doctor_profiles')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'doctor_profiles' }, fetchDoctors)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchDoctors() {
    const { data, error } = await supabase.from('doctor_profiles').select('*');
    
    // Fetch active/ringing consultations to mark doctors as busy
    const { data: activeCons } = await supabase
      .from('consultations')
      .select('doctor_id')
      .in('status', ['ACTIVE', 'RINGING']);
      
    const busyDoctorIds = new Set((activeCons || []).map(c => c.doctor_id));

    if (data) {
      const formattedDoctors = data.map(doc => ({
        id: doc.id,
        name: doc.name || 'Doctor',
        specialty: doc.specialization || 'Veterinarian',
        rating: doc.rating || 4.9,
        experience: doc.experience_years || 5,
        fee: doc.per_minute_rate || 10,
        status: busyDoctorIds.has(doc.id) ? 'BUSY' : (doc.status || 'OFFLINE'),
        bio: doc.about || '',
        img: (doc.email || '').includes('anjali') ? '/images/dr-anjali.png' : '/images/dr-marcus.png'
      }));
      setDoctors(formattedDoctors);
    }
    setLoading(false);
  }

  // Listen to Consultation status changes while ringing
  useEffect(() => {
    let pollInterval;
    
    if (currentConsultationId && isRinging) {
      const ringChannel = supabase
        .channel(`ringing_${currentConsultationId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'consultations',
          filter: `id=eq.${currentConsultationId}`
        }, (payload) => {
          handleStatusChange(payload.new.status);
        })
        .subscribe();
        
      pollInterval = setInterval(async () => {
        const { data } = await supabase
          .from('consultations')
          .select('status')
          .eq('id', currentConsultationId)
          .single();
          
        if (data) {
          handleStatusChange(data.status);
        }
      }, 2000);

      const handleStatusChange = (status) => {
        if (status === 'ACTIVE') {
          toast.success("Doctor connected!");
          setIsRinging(false);
          navigate(`/pet-owner/chat/${currentConsultationId}`);
        } else if (status === 'REJECTED' || status === 'CANCELLED' || status === 'COMPLETED') {
          toast.error(status === 'REJECTED' ? "Doctor is busy or unavailable." : "Consultation ended.");
          setIsRinging(false);
          setCurrentConsultationId(null);
          setSelectedDoctor(null);
        }
      };

      return () => {
        supabase.removeChannel(ringChannel);
        clearInterval(pollInterval);
      };
    }
  }, [currentConsultationId, isRinging, navigate]);

  const handleWaitlistClick = async (doc) => {
    if (!user) {
      toast.error("Please login to join the waitlist");
      return;
    }

    try {
      const { error } = await supabase
        .from('consultations')
        .insert({
          doctor_id: doc.id,
          owner_id: user.id,
          pet_id: selectedPetId || null,
          status: 'WAITLIST',
          per_minute_rate: doc.fee
        });

      if (error) throw error;
      toast.success(`You've been added to Dr. ${doc.name}'s waitlist!`);
    } catch (err) {
      toast.error(err.message || 'Failed to join waitlist');
    }
  };

  const handleChatClick = async (doc) => {
    if (!user) {
      toast.error("Please log in as a Pet Owner to chat.");
      navigate('/sign-in');
      return;
    }
    if (doc.status !== 'ONLINE') {
      toast.error("Doctor is currently offline or busy.");
      return;
    }

    // Check if user has any pets registered
    if (myPets.length === 0) {
      toast((t) => (
        <span className="flex items-center gap-3">
          <span>Please add a pet first before consulting a doctor.</span>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              navigate('/pet-owner/dashboard');
            }}
            className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 whitespace-nowrap"
          >
            Add Pet
          </button>
        </span>
      ), { duration: 5000, icon: '🐾' });
      return;
    }
    
    try {
      const { data: walletData } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
      const currentBalance = walletData ? parseFloat(walletData.balance) : 0;
      
      if (currentBalance < doc.fee) {
        toast.error(`Insufficient wallet balance. You need at least ₹${doc.fee} for a 1-minute consultation. Please add funds from your dashboard.`);
        return;
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not verify wallet balance.");
      return;
    }

    setSelectedDoctor(doc);
    setIsIntakeOpen(true);
  };


  const startCall = async (e) => {
    e.preventDefault();
    setIsIntakeOpen(false);
    setIsRinging(true);
    
    const { data, error } = await supabase.from('consultations').insert({
      doctor_id: selectedDoctor.id,
      owner_id: user.id,
      pet_id: selectedPetId || null,
      per_minute_rate: selectedDoctor.fee,
      status: 'RINGING',
      primary_concern: primaryConcern
    }).select().single();

    if (error) {
      toast.error("Failed to call doctor. (Did you run the primary_concern migration?)");
      setIsRinging(false);
      setSelectedDoctor(null);
    } else {
      setCurrentConsultationId(data.id);
    }
  };

  const cancelCall = async () => {
    if (currentConsultationId) {
      await supabase.from('consultations').update({ status: 'CANCELLED' }).eq('id', currentConsultationId);
    }
    setIsRinging(false);
    setSelectedDoctor(null);
    setCurrentConsultationId(null);
  };

  const sortedDoctors = [...doctors].sort((a, b) => {
    if (a.status === 'ONLINE' && b.status !== 'ONLINE') return -1;
    if (b.status === 'ONLINE' && a.status !== 'ONLINE') return 1;
    if (a.status === 'BUSY' && b.status !== 'BUSY') return -1;
    if (b.status === 'BUSY' && a.status !== 'BUSY') return 1;
    return b.rating - a.rating;
  });

  const displayName = user?.user_metadata?.name || user?.email;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      
      
      {/* Top Navigation Bar - Matching Dashboard */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/pet-owner/dashboard')}>
              <button className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors mr-2">
                <ArrowLeft size={18} />
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <Activity size={16} className="text-white" />
              </div>
              <span className="text-xl font-black text-slate-800 tracking-tight">Specialists</span>
            </div>
            
            {user && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <User size={16} className="text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">{displayName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Simple Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Find a Doctor</h1>
            <p className="text-slate-500 mt-1 font-medium">Browse verified professionals and connect instantly.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {doctors.filter(d => d.status === 'ONLINE').length} Online Now
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedDoctors.map((doc) => (
            <div key={doc.id} className="relative group">
              <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm group-hover:shadow-2xl group-hover:border-blue-200 transition-all duration-300 flex flex-col absolute top-0 left-0 right-0 bottom-0 z-10 group-hover:z-20 group-hover:-left-2 group-hover:-right-2 md:group-hover:-left-4 md:group-hover:-right-4 group-hover:-top-4 md:group-hover:-top-4 group-hover:bottom-auto group-hover:h-auto group-hover:pb-4">
                
                <div className="p-6 pb-0">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-sm shrink-0 relative">
                      <img 
                        src={doc.img} 
                        alt={doc.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400'; }} 
                      />
                    </div>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(doc.id); }}
                      className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm hover:bg-white hover:scale-110 transition-all text-rose-500"
                    >
                      <Heart size={16} fill={wishlistIds.has(doc.id) ? "currentColor" : "none"} strokeWidth={wishlistIds.has(doc.id) ? 0 : 2} />
                    </button>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {doc.status === 'ONLINE' ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                        </span>
                      ) : doc.status === 'BUSY' ? (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> In Call
                        </span>
                      ) : (
                        <span className="bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5">
                          Offline
                        </span>
                      )}
                      
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md">
                        <Star size={12} className="fill-amber-500 text-amber-500" />
                        <span className="font-bold text-xs">{doc.rating}</span>
                      </div>
                    </div>
                  </div>

                    <Link to={`/doctor/${doc.id}`}>
                      <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{doc.name}</h3>
                    </Link>
                    <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mt-1 mb-3">
                      {doc.specialty}
                    </p>
                    <div className="relative">
                      <p className="text-slate-500 text-sm font-medium line-clamp-2 group-hover:line-clamp-none min-h-[40px] transition-all duration-300">
                        {doc.bio || "Dedicated veterinary professional ready to assist you with your pet's needs."}
                      </p>
                    </div>
                    
                    {/* Extra details only visible on hover */}
                    <div className="mt-4 grid grid-cols-2 gap-2 opacity-0 h-0 group-hover:h-auto group-hover:opacity-100 group-hover:mt-6 transition-all duration-300 overflow-hidden">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1"><ShieldCheck size={12}/> Verified</span>
                        <span className="text-xs font-bold text-slate-700">Lic. #VET892</span>
                      </div>
                      <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5 flex items-center gap-1"><MessageCircle size={12}/> Consults</span>
                        <span className="text-xs font-bold text-blue-700">1,200+ Pets</span>
                      </div>
                    </div>
                  </div>

                <div className="mt-auto p-6 pt-5 bg-white">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                      <Award size={16} className="text-slate-400" /> {doc.experience} Years Exp.
                    </div>
                    <div className="font-black text-slate-900 text-lg">
                      ₹{doc.fee}<span className="text-sm font-semibold text-slate-400">/min</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (doc.status === 'BUSY') {
                        handleWaitlistClick(doc);
                      } else {
                        handleChatClick(doc);
                      }
                    }}
                    disabled={doc.status === 'OFFLINE'}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg ${
                      doc.status === 'ONLINE' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                        : doc.status === 'BUSY'
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {doc.status === 'ONLINE' ? 'Consult Now' : doc.status === 'BUSY' ? 'Join Waitlist' : 'Offline'}
                  </button>
                </div>
              </div>
              {/* Invisible spacer to maintain grid height when absolute positioned card expands */}
              <div className="invisible bg-white border border-transparent rounded-[24px] flex flex-col h-full pointer-events-none">
                <div className="p-6 pb-0">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-20 h-20 rounded-2xl border border-transparent shrink-0"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-transparent leading-tight">{doc.name}</h3>
                    <p className="text-transparent font-bold text-xs uppercase mt-1 mb-3">
                      {doc.specialty}
                    </p>
                    <p className="text-transparent text-sm font-medium line-clamp-2 min-h-[40px]">
                      {doc.bio || "Dedicated veterinary professional ready to assist you with your pet's needs."}
                    </p>
                  </div>
                </div>
                <div className="mt-auto p-6 pt-5">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-transparent">
                    <div className="text-sm text-transparent font-medium">Exp</div>
                    <div className="text-lg text-transparent">Fee</div>
                  </div>
                  <button className="w-full py-3.5 rounded-xl text-transparent">Btn</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ringing Overlay */}
      {isRinging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            <div className="relative mb-6 mt-2">
              <div className="w-24 h-24 rounded-full border-4 border-emerald-50 overflow-hidden relative z-10 shadow-sm">
                <img src={selectedDoctor?.img} className="w-full h-full object-cover" alt="Doctor" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-75"></div>
            </div>
            
            <h2 className="text-xl font-black text-slate-900 mb-2">Calling {selectedDoctor?.name}...</h2>
            <p className="text-slate-500 text-sm mb-8 font-medium">Please wait while the doctor accepts your chat request.</p>
            
            <button 
              onClick={cancelCall}
              className="bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 w-full justify-center"
            >
              <X size={16} /> Cancel Call
            </button>
          </div>
        </div>
      )}

      {/* Intake Modal */}
      {isIntakeOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Start Consultation</h2>
              <button onClick={() => setIsIntakeOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                <X size={16}/>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                <img src={selectedDoctor?.img} className="w-full h-full object-cover" alt="Dr"/>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 leading-tight">{selectedDoctor?.name}</h3>
                <p className="text-slate-500 font-medium text-sm mt-0.5">₹{selectedDoctor?.fee}/minute</p>
              </div>
            </div>

            <form onSubmit={startCall}>
              {myPets.length > 0 && (
                <div className="mb-4">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Select Pet</label>
                  <div className="relative">
                    <select 
                      value={selectedPetId}
                      onChange={(e) => setSelectedPetId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 pr-10 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      {myPets.map(pet => (
                        <option key={pet.id} value={pet.id}>{pet.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Concern</label>
                <textarea 
                  required
                  rows={3}
                  value={primaryConcern}
                  onChange={(e) => setPrimaryConcern(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none shadow-sm"
                  placeholder="Briefly describe why you are consulting..."
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                <PhoneCall size={16} /> Connect Now
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
