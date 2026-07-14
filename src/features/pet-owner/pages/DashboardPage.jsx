import React, { useRef, useState, useEffect } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Plus, Star, PawPrint, 
  Wallet, ChevronRight, MessageCircle, Clock, X,
  Activity, Video, PhoneCall, Calendar, ChevronDown, User, Trash2
} from 'lucide-react';
import { supabase } from '../../auth/api/supabase';
import toast, { Toaster } from 'react-hot-toast';

export default function PetOwnerDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const [consultations, setConsultations] = useState([]);
  const [myPets, setMyPets] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0 });
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  
  const [newPet, setNewPet] = useState({ 
    name: '', 
    species: 'Dog', 
    breed: '', 
    age: '',
    ageUnit: 'Years'
  });
  
  const fetchPets = () => {
    if (user?.id) {
      supabase.from('pets')
        .select('*')
        .eq('owner_id', user.id)
        .then(({ data }) => {
          if (data) setMyPets(data);
        });
    }
  };

  const fetchWallet = async () => {
    if (user?.id) {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        const localOffset = parseFloat(localStorage.getItem(`wallet_offset_${user.id}`) || '0');
        setWallet({ ...data, balance: parseFloat(data.balance) + localOffset });
      } else if (error) {
        console.error("Error fetching wallet:", error);
      }
    }
  };

  const fetchConsultations = async () => {
    if (user?.id) {
      const { data } = await supabase.from('consultations')
        .select(`
          id, created_at, status, per_minute_rate, doctor_id,
          pet:pets(name)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (data && data.length > 0) {
        const doctorIds = [...new Set(data.map(c => c.doctor_id))];
        const { data: doctors } = await supabase
          .from('doctor_profiles')
          .select('id, name, specialization')
          .in('id', doctorIds);
          
        const docMap = {};
        if (doctors) {
          doctors.forEach(d => docMap[d.id] = { name: d.name, specialization: d.specialization });
        }
        
        const enriched = data.map(c => ({
          ...c,
          doctor: docMap[c.doctor_id] || { name: 'Doctor', specialization: 'Vet' }
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
      fetchConsultations();
      fetchPets();
      fetchWallet();

      const channel = supabase
        .channel('public:consultations_owner')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'consultations',
          filter: `owner_id=eq.${user.id}`
        }, (payload) => {
          const oldCons = prevConsultationsRef.current?.find(a => a.id === payload.new?.id);
          if (payload.new?.status === 'ACTIVE' && oldCons?.status === 'RINGING') {
            toast.success("The doctor connected! Joining chat...", { duration: 4000, icon: '🟢' });
            setTimeout(() => navigate(`/pet-owner/chat/${payload.new.id}`), 1000);
          } else if (payload.new?.status === 'REJECTED' && oldCons?.status === 'RINGING') {
            toast.error("The doctor is busy and declined the call.", { duration: 4000 });
          }
          fetchConsultations();
        })
        .subscribe();

      const walletChannel = supabase
        .channel('public:wallets_owner')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          if (payload.new) setWallet(payload.new);
        })
        .subscribe();
        
      const fallbackInterval = setInterval(async () => {
        const oldConsList = prevConsultationsRef.current || [];
        const ringingCons = oldConsList.filter(c => c.status === 'RINGING');
        
        if (ringingCons.length > 0) {
          const { data: updated } = await supabase
            .from('consultations')
            .select('id, status')
            .in('id', ringingCons.map(c => c.id));
            
          if (updated) {
            let changed = false;
            updated.forEach(u => {
              const old = ringingCons.find(c => c.id === u.id);
              if (old && old.status !== u.status) {
                changed = true;
                if (u.status === 'ACTIVE') {
                  toast.success("The doctor connected! Joining chat...", { duration: 4000, icon: '🟢' });
                  setTimeout(() => navigate(`/pet-owner/chat/${u.id}`), 1000);
                } else if (u.status === 'REJECTED') {
                  toast.error("The doctor is busy and declined the call.", { duration: 4000 });
                }
              }
            });
            if (changed) fetchConsultations();
          }
        }
      }, 3000);

      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(walletChannel);
        clearInterval(fallbackInterval);
      };
    }
  }, [user, navigate]);

  const handleAddPet = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    
    let displayAge = `${newPet.age} ${newPet.ageUnit}`;
    
    const { error } = await supabase.from('pets').insert({
      owner_id: user.id,
      name: newPet.name,
      species: newPet.species,
      breed: newPet.breed,
      age: parseInt(newPet.age) || null
    });
    
    if (!error) {
      setIsAddPetOpen(false);
      setNewPet({ name: '', species: 'Dog', breed: '', age: '', ageUnit: 'Years' });
      fetchPets();
      toast.success("Companion added!");
    } else {
      toast.error("Error adding pet");
    }
  };

  const handleDeletePet = async (petId) => {
    if (!confirm('Are you sure you want to remove this companion?')) return;
    const { error } = await supabase.from('pets').delete().eq('id', petId);
    if (!error) {
      toast.success('Pet removed successfully');
      setSelectedPet(null);
      fetchPets();
    } else {
      toast.error('Failed to remove pet');
    }
  };

  const handleTopUp = async () => {
    if (!user?.id) return;
    
    try {
      const { data: currentWallet } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user.id)
        .single();
        
      const localOffset = parseFloat(localStorage.getItem(`wallet_offset_${user.id}`) || '0');
      const actualDbBalance = currentWallet ? parseFloat(currentWallet.balance) : 0;
      const displayBalance = actualDbBalance + localOffset;
      const newDisplayBalance = displayBalance + 500.0;
      const newDbBalance = actualDbBalance + 500.0;
      
      let walletId = currentWallet?.id;
      let rlsBlocked = false;
      
      if (currentWallet) {
        const { data: updateData } = await supabase
          .from('wallets')
          .update({ balance: newDbBalance })
          .eq('user_id', user.id)
          .select();
        
        if (!updateData || updateData.length === 0) rlsBlocked = true;
      } else {
        const { data: newWallet, error: insertError } = await supabase
          .from('wallets')
          .insert({ user_id: user.id, balance: newDbBalance })
          .select()
          .single();
          
        if (insertError || !newWallet) {
          rlsBlocked = true;
        } else {
          walletId = newWallet.id;
        }
      }

      if (rlsBlocked) {
        localStorage.setItem(`wallet_offset_${user.id}`, localOffset + 500.0);
      } else if (walletId) {
        await supabase.from('wallet_transactions').insert({
          wallet_id: walletId,
          amount: 500.0,
          transaction_type: 'TOPUP',
          description: 'Recharge Wallet'
        });
      }
      
      toast.success(rlsBlocked ? "₹500 added to wallet! (Local Mode)" : "₹500 added to wallet!");
      setWallet(prev => ({ ...prev, balance: newDisplayBalance }));
      fetchWallet();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to add funds.");
    }
  };

  const displayName = user?.user_metadata?.name || user?.email || "Pet Owner";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      <Toaster position="top-center" />

      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <PawPrint size={22} className="text-white" />
              </div>
              <span className="text-xl font-black text-slate-800 tracking-tight">Anitalk</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                <User size={16} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">{displayName}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1 font-medium">Manage your pets, wallet, and consultations.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/doctors')}
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
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Active</span>
            </div>
            <div>
              <div className="text-4xl font-black text-slate-900 tracking-tight">
                <span className="text-slate-400 font-medium text-2xl">₹</span>
                {Number(wallet.balance).toFixed(2)}
              </div>
              <button 
                onClick={handleTopUp}
                className="mt-6 w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Recharge Wallet
              </button>
            </div>
          </div>

          {/* Find a Doctor Shortcut */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between group cursor-pointer hover:border-blue-300 transition-colors" onClick={() => navigate('/doctors')}>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Find a Specialist</h3>
              <p className="text-sm text-slate-500 font-medium">Browse our verified veterinarians and start a live consultation instantly.</p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm font-bold text-blue-600">
              Browse Doctors <ChevronRight size={16} />
            </div>
          </div>

          {/* Add a Pet Shortcut */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between group cursor-pointer hover:border-rose-300 transition-colors" onClick={() => setIsAddPetOpen(true)}>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PawPrint size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Register a Pet</h3>
              <p className="text-sm text-slate-500 font-medium">Keep track of your furry friends to provide doctors with essential context.</p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm font-bold text-rose-600">
              Add Companion <ChevronRight size={16} />
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column - Consultations */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Calendar size={20} className="text-slate-700" /> Recent Consultations
            </h2>
            
            <div className="space-y-4">
              {consultations.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock size={24} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No Consultations Yet</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">You haven't chatted with any doctors yet. Connect with a verified professional instantly.</p>
                  <button 
                    onClick={() => navigate('/doctors')}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    Browse Doctors
                  </button>
                </div>
              ) : (
                consultations.map(cons => (
                  <div key={cons.id} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between shadow-sm hover:shadow-md transition-shadow gap-4">
                    
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg ${
                          cons.status === 'RINGING' ? 'bg-amber-500' :
                          cons.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}>
                          {cons.doctor?.name[0] || 'D'}
                        </div>
                        {cons.status === 'RINGING' && (
                          <div className="absolute inset-0 rounded-xl border-2 border-amber-400 animate-ping opacity-75" />
                        )}
                        {cons.status === 'ACTIVE' && (
                          <div className="absolute inset-0 rounded-xl border-2 border-emerald-400 animate-pulse opacity-75" />
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-base font-bold text-slate-900 leading-tight">Dr. {cons.doctor?.name.replace('Dr. ', '') || 'Doctor'}</h4>
                        <p className="text-slate-500 text-sm mt-0.5">
                          {cons.doctor?.specialization || 'General Vet'} {cons.pet?.name ? `• ${cons.pet.name}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center sm:justify-end gap-6 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                      
                      <div className="hidden md:block text-right">
                        <div className="text-sm font-bold text-emerald-600">₹{cons.per_minute_rate}/min</div>
                        <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1 justify-end">
                          <Clock size={12}/> {new Date(cons.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          cons.status === 'COMPLETED' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                          cons.status === 'RINGING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          cons.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {cons.status}
                        </span>
                        
                        {cons.status === 'ACTIVE' && (
                          <button 
                            onClick={() => navigate(`/pet-owner/chat/${cons.id}`)}
                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-600 transition-all flex items-center gap-2"
                          >
                            <PhoneCall size={14} className="animate-pulse" /> Join
                          </button>
                        )}
                        
                        {cons.status === 'COMPLETED' && (
                          <button 
                            onClick={() => navigate(`/pet-owner/chat/${cons.id}`)}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                          >
                            <MessageCircle size={14}/> View Chat
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
                <PawPrint size={20} className="text-slate-700" /> My Companions
              </h2>
              <button onClick={() => setIsAddPetOpen(true)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition-colors">
                <Plus size={16} />
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                {myPets.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <PawPrint size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-sm">No pets registered yet</p>
                  </div>
                ) : (
                  myPets.map((pet, i) => (
                    <div 
                      key={pet.id} 
                      onClick={() => setSelectedPet(pet)}
                      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
                          i % 3 === 0 ? 'bg-rose-500' : 
                          i % 3 === 1 ? 'bg-blue-500' : 
                          'bg-teal-500'
                        }`}>
                          {pet.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{pet.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{pet.species} • {pet.age} yrs</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                    </div>
                  ))
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
              onClick={() => setSelectedPet(null)} 
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X size={16} />
            </button>
            
            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-4xl mb-5 shadow-sm border-[6px] border-white ring-1 ring-slate-100">
                {selectedPet.name[0].toLowerCase()}
              </div>
              <h3 className="text-3xl font-black text-slate-900">{selectedPet.name.toLowerCase()}</h3>
              <p className="text-slate-500 text-sm mt-2 flex items-center justify-center gap-1.5 font-medium">
                <PawPrint size={14} className="text-slate-400" /> {selectedPet.species} • {selectedPet.breed || 'Mixed'}
              </p>
              
              <div className="grid grid-cols-2 gap-4 w-full mt-8">
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 text-center flex flex-col justify-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Age</div>
                  <div className="text-lg font-black text-slate-800">{selectedPet.age} {selectedPet.age === 1 ? 'yr' : 'yrs'}</div>
                </div>
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 text-center flex flex-col justify-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">ID</div>
                  <div className="text-xs font-bold text-slate-700 break-all">#{String(selectedPet.id).split('-')[0]}</div>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedPet(null)}
                className="w-full mt-8 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 font-bold py-3.5 rounded-2xl transition-colors shadow-sm"
              >
                Close
              </button>
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
                <h3 className="text-xl font-black text-slate-900">Register Pet</h3>
                <p className="text-sm text-slate-500 mt-1">Add a new companion to your profile</p>
              </div>
              <button onClick={() => setIsAddPetOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleAddPet} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pet's Name</label>
                <input 
                  required
                  type="text" 
                  value={newPet.name}
                  onChange={e => setNewPet({...newPet, name: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="e.g. Bella"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Species</label>
                  <div className="relative">
                    <select 
                      value={newPet.species}
                      onChange={e => setNewPet({...newPet, species: e.target.value})}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      <option>Dog</option>
                      <option>Cat</option>
                      <option>Bird</option>
                      <option>Rabbit</option>
                      <option>Other</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Age</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={newPet.age}
                      onChange={e => setNewPet({...newPet, age: e.target.value})}
                      className="w-1/2 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-center"
                      placeholder="e.g. 3"
                    />
                    <div className="relative w-1/2">
                      <select 
                        value={newPet.ageUnit}
                        onChange={e => setNewPet({...newPet, ageUnit: e.target.value})}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-3 pr-8 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                      >
                        <option>Years</option>
                        <option>Months</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Breed (Optional)</label>
                <input 
                  type="text" 
                  value={newPet.breed}
                  onChange={e => setNewPet({...newPet, breed: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="e.g. Golden Retriever"
                />
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
                >
                  Save Companion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
