import React, { useState, useEffect } from 'react';
import { supabase } from '../../features/auth/api/supabase';
import { useAuthStore } from '../../features/auth/store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Star, Award, HeartPulse, Clock, DollarSign, PawPrint, Heart, MessageCircle, X, Loader2 } from 'lucide-react';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Ringing Flow State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [currentConsultationId, setCurrentConsultationId] = useState(null);

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

  // Listen to Consultation status changes while ringing (Realtime + Fallback Polling)
  useEffect(() => {
    let pollInterval;
    
    if (currentConsultationId && isRinging) {
      // 1. Setup Realtime subscription
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
        
      // 2. Setup Fallback Polling (every 2 seconds) in case Realtime isn't configured in DB
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
      // Create a WAITLIST consultation
      const { error } = await supabase
        .from('consultations')
        .insert({
          doctor_id: doc.id,
          owner_id: user.id,
          status: 'WAITLIST',
          per_minute_rate: doc.fee
        });

      if (error) throw error;
      toast.success(`You've been added to Dr. ${doc.name}'s waitlist!`);
      // Update local state temporarily to prevent multiple clicks if desired
      // But they will be notified by the dashboard anyway.
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
    setSelectedDoctor(doc);
    setIsIntakeOpen(true);
  };

  const startCall = async (e) => {
    e.preventDefault();
    setIsIntakeOpen(false);
    setIsRinging(true);
    
    // Create consultation
    const { data, error } = await supabase.from('consultations').insert({
      doctor_id: selectedDoctor.id,
      owner_id: user.id,
      per_minute_rate: selectedDoctor.fee,
      status: 'RINGING'
    }).select().single();

    if (error) {
      toast.error("Failed to call doctor.");
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
    // 1. ONLINE first
    if (a.status === 'ONLINE' && b.status !== 'ONLINE') return -1;
    if (b.status === 'ONLINE' && a.status !== 'ONLINE') return 1;
    
    // 2. BUSY second
    if (a.status === 'BUSY' && b.status !== 'BUSY') return -1;
    if (b.status === 'BUSY' && a.status !== 'BUSY') return 1;
    
    // 3. Then sort by rating
    return b.rating - a.rating;
  });

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-[1280px] mx-auto flex flex-col gap-16 relative overflow-hidden">
      <Toaster position="top-center" />
      {/* Mesh Background Blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-rose-200/20 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-teal-200/10 blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-amber-200/10 blur-3xl pointer-events-none z-0" />

      {/* Ringing Overlay */}
      {isRinging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative overflow-hidden border border-slate-200">
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none" />
            
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-green-500 overflow-hidden relative z-10 shadow-lg">
                <img src={selectedDoctor?.img} className="w-full h-full object-cover" alt="Doctor" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-ping opacity-75"></div>
              <div className="absolute -inset-4 rounded-full border-2 border-green-400 animate-ping opacity-50 animation-delay-300"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Calling {selectedDoctor?.name}...</h2>
            <p className="text-slate-500 mb-8 font-medium">Please wait while the doctor accepts your chat request.</p>
            
            <button 
              onClick={cancelCall}
              className="bg-red-100 text-red-600 hover:bg-red-200 px-8 py-3 rounded-full font-bold transition-colors flex items-center gap-2"
            >
              <X size={20} /> Cancel Call
            </button>
          </div>
        </div>
      )}

      {/* Intake Modal */}
      {isIntakeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Start Consultation</h2>
              <button onClick={() => setIsIntakeOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <img src={selectedDoctor?.img} className="w-12 h-12 rounded-full object-cover" alt="Dr"/>
              <div>
                <h3 className="font-bold text-slate-900">{selectedDoctor?.name}</h3>
                <p className="text-sm text-green-600 font-bold">₹{selectedDoctor?.fee}/minute</p>
              </div>
            </div>
            <form onSubmit={startCall}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">What is your primary concern?</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-rose-500 bg-slate-50 focus:bg-white transition-colors resize-none"
                  placeholder="E.g. My dog has been scratching excessively..."
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5">
                <MessageCircle size={20} /> Connect Now
              </button>
            </form>
          </div>
        </div>
      )}

      <header className="w-full flex flex-col lg:flex-row gap-12 lg:gap-16 items-center min-h-[480px] z-10 relative mt-6">
        <div className="flex-1 flex flex-col gap-6 items-center lg:items-start text-center lg:text-left">
          <span className="text-[0.68rem] font-black text-slate-500 uppercase tracking-widest pl-1">
            Instant Vet Advice
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black text-slate-800 tracking-tight leading-tight">
            Chat with a <br />
            <span className="text-rose-500 italic font-serif">specialist</span> instantly.
          </h1>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-md pl-1 font-medium">
            No more waiting rooms. Connect with top veterinarians in seconds for immediate advice, triage, and peace of mind. Pay per minute.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <a href="#specialty" onClick={(e) => { e.preventDefault(); document.getElementById('specialty')?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-white hover:bg-slate-50 text-slate-850 px-7 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider border border-slate-200 shadow-sm transition-all duration-200">
              Browse Doctors
            </a>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center relative shrink-0 min-h-[360px] lg:min-h-[440px] z-10">
          <div className="absolute w-[280px] h-[280px] md:w-[320px] md:h-[320px] bg-rose-100/75 rounded-full z-0 pointer-events-none animate-pulse-slow" />
          <div className="w-[260px] h-[260px] md:w-[300px] md:h-[300px] rounded-full overflow-hidden border-4 border-white shadow-xl hover:scale-[1.02] transition-transform duration-500 relative z-10 shrink-0">
            <img src="/images/dr-anjali.png" alt="Veterinarian Panel" className="w-full h-full object-cover object-top" />
          </div>
        </div>
      </header>



      <section className="flex flex-col gap-8 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedDoctors.map((doc) => (
            <div key={doc.id} className="bg-white backdrop-blur-md rounded-[32px] p-6 flex flex-col justify-between shadow-sm border border-slate-200 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group min-h-[460px] relative overflow-hidden">
              <div>
                <div className="w-full h-52 rounded-2xl overflow-hidden mb-5 relative shrink-0 shadow-sm border border-slate-100">
                  <img src={doc.img} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400'; }} />
                  {doc.status === 'ONLINE' ? (
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-[0.65rem] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Online Now
                    </div>
                  ) : doc.status === 'BUSY' ? (
                    <div className="absolute top-3 left-3 bg-amber-500 text-white text-[0.65rem] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Busy in Call
                    </div>
                  ) : (
                    <div className="absolute top-3 left-3 bg-slate-800 text-white text-[0.65rem] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                      Offline
                    </div>
                  )}
                </div>

                <span className="inline-flex bg-rose-50 border border-rose-100 text-rose-600 px-2.5 py-0.5 rounded-md text-[0.65rem] font-bold uppercase tracking-wider mb-3">
                  {doc.specialty}
                </span>

                <div className="flex justify-between items-start gap-4 mb-3">
                  <h2 className="text-slate-800 font-extrabold text-xl leading-tight group-hover:text-rose-600 transition-colors">
                    {doc.name}
                  </h2>
                  <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/50">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-slate-700">{doc.rating}</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
                  {doc.bio}
                </p>
              </div>

              <div className="mt-auto">
                <div className="grid grid-cols-2 border-t border-b border-slate-100 py-3 mb-5 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 justify-center border-r border-slate-200/40">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span>{doc.experience} Yrs</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span>₹{doc.fee}/min</span>
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
                  className={`w-full inline-flex items-center justify-center font-extrabold text-sm py-4 px-4 rounded-xl transition-all shadow-md flex items-center gap-2 ${
                    doc.status === 'ONLINE' 
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:-translate-y-0.5' 
                      : doc.status === 'BUSY'
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {doc.status === 'ONLINE' ? <MessageCircle size={18} /> : doc.status === 'BUSY' ? <Clock size={18} /> : null}
                  {doc.status === 'ONLINE' ? 'Chat Now' : doc.status === 'BUSY' ? 'Join Waitlist (Busy)' : 'Currently Offline'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
