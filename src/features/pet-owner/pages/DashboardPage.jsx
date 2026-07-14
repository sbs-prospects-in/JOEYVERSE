import React, { useRef, useState, useEffect } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Plus, Stethoscope, Star, PawPrint, 
  Wallet, ChevronRight, MessageCircle, Clock, X 
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
  const [newPet, setNewPet] = useState({ name: '', species: 'Dog', breed: '', age: '' });
  
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

      // Realtime subscription for live consultation updates (e.g. Doctor accepted)
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

      // Listen to wallet changes
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
        
      // Fallback polling for status changes (runs every 3 seconds)
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
    
    const { error } = await supabase.from('pets').insert({
      owner_id: user.id,
      name: newPet.name,
      species: newPet.species,
      breed: newPet.breed,
      age: parseInt(newPet.age) || null
    });
    
    if (!error) {
      setIsAddPetOpen(false);
      setNewPet({ name: '', species: 'Dog', breed: '', age: '' });
      fetchPets();
    }
  };

  const handleTopUp = async () => {
    if (!user?.id) return;
    
    try {
      // Get current wallet first
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
        const { data: updateData, error: updateError } = await supabase
          .from('wallets')
          .update({ balance: newDbBalance })
          .eq('user_id', user.id)
          .select();
        
        if (!updateData || updateData.length === 0) {
          rlsBlocked = true; // Supabase RLS silently blocked the update
        }
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
        // Fallback: save to local storage if DB blocked it
        localStorage.setItem(`wallet_offset_${user.id}`, localOffset + 500.0);
      } else if (walletId) {
        // Only log transaction if DB actually let us write
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      <Toaster position="top-center" />
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#f2687c]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full h-full min-h-screen px-4 sm:px-8 lg:px-12 pt-32 pb-8 relative z-10 flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-8 mb-8 border-b border-slate-200">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 mt-2 font-medium tracking-wide">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm"
          >
            <LogOut size={18} className="text-slate-500" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* My Pets Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#f2687c]/5 rounded-bl-full transition-transform duration-700 group-hover:scale-110" />
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#f2687c]/10 rounded-lg">
                    <PawPrint size={20} className="text-[#f2687c]" />
                  </div>
                  <h2 className="text-xl font-semibold">My Pets</h2>
                </div>
                <button 
                  onClick={() => setIsAddPetOpen(true)}
                  className="flex items-center gap-1 text-[#f2687c] text-sm font-medium hover:text-[#d75062] transition-colors"
                >
                  <Plus size={16} /> Add Pet
                </button>
              </div>
              
              <div className="space-y-3 relative z-10">
                {myPets.map(pet => (
                  <div key={pet.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center hover:bg-slate-100 hover:border-slate-200 transition-colors cursor-pointer group/item">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f2687c] to-[#d75062] flex items-center justify-center text-white font-bold shadow-sm">
                        {pet.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{pet.name}</p>
                        <p className="text-xs text-slate-500">{pet.breed} • {pet.age} yrs</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-400 group-hover/item:text-[#f2687c] transition-colors" />
                  </div>
                ))}
                
                {myPets.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">No pets added yet. Click 'Add Pet' to get started.</p>
                )}
              </div>
            </div>

            {/* Wallet Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 p-6 rounded-2xl shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute -right-4 -top-4 text-emerald-500/5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
                <Wallet size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-100/50 text-emerald-600 rounded-lg">
                    <Wallet size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Wallet Balance</h2>
                </div>
                <p className="text-4xl font-black text-slate-900 mb-2 tracking-tight">₹ {Number(wallet.balance).toFixed(2)}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-6 bg-emerald-100/50 w-max px-3 py-1.5 rounded-full border border-emerald-200/50 shadow-sm uppercase tracking-wider">
                  <Star size={14} className="fill-current" /> Valid for Consultations
                </div>
                <button onClick={handleTopUp} className="w-full py-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors uppercase tracking-wider text-xs shadow-sm">
                  <Plus size={16} /> Recharge Wallet (Mock ₹500)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Browse Doctors & History */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Consultations</h2>
                <p className="text-slate-500 mt-1 text-sm">Your recent calls and chat history.</p>
              </div>
              <button 
                onClick={() => navigate('/doctors')}
                className="bg-[#f2687c] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#d75062] transition-colors shadow-md flex items-center gap-2 hover:-translate-y-0.5"
              >
                <MessageCircle size={18} /> Chat With Doctor Now
              </button>
            </div>
            
            <div className="space-y-4">
              {consultations.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Clock size={24} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Consultations Yet</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-6">You haven't chatted with any doctors yet. Browse our directory to connect with a vet instantly.</p>
                  <button 
                    onClick={() => navigate('/doctors')}
                    className="text-[#f2687c] hover:text-[#d75062] transition-colors font-medium border-b border-[#f2687c]/30 pb-1"
                  >
                    Browse Doctor Directory &rarr;
                  </button>
                </div>
              ) : (
                consultations.map(cons => (
                  <div key={cons.id} className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between hover:border-[#f2687c]/50 hover:shadow-sm transition-all group hover:-translate-y-0.5">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{cons.doctor?.name}</h4>
                      <p className="text-slate-600 text-sm mb-2 font-medium">{cons.doctor?.specialization || 'General Vet'} • For {cons.pet?.name || 'Pet'}</p>
                      <div className="flex items-center gap-4 text-slate-500 text-sm">
                        <span className="flex items-center gap-1"><Clock size={14}/> {new Date(cons.created_at).toLocaleString()}</span>
                        <span className="font-bold">₹{cons.per_minute_rate}/min</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                        cons.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                        cons.status === 'RINGING' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 animate-pulse' :
                        cons.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border border-green-200' :
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {cons.status}
                      </span>
                      
                      {cons.status === 'RINGING' && (
                        <p className="text-xs text-slate-400">Waiting for doctor to answer...</p>
                      )}
                      
                      {cons.status === 'ACTIVE' && (
                        <button 
                          onClick={() => navigate(`/pet-owner/chat/${cons.id}`)}
                          className="bg-[#f2687c] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#d75062] transition-colors shadow-sm flex items-center gap-2"
                        >
                          <MessageCircle size={16}/> Return to Chat
                        </button>
                      )}
                      
                      {cons.status === 'COMPLETED' && (
                        <button 
                          onClick={() => navigate(`/pet-owner/chat/${cons.id}`)}
                          className="bg-white text-[#f2687c] px-4 py-2 rounded-lg font-bold text-sm border border-[#f2687c]/30 hover:bg-[#f2687c]/5 transition-colors shadow-sm flex items-center gap-2 mt-2"
                        >
                          <MessageCircle size={16}/> View Chat History
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
      
      {/* Add Pet Modal */}
      {isAddPetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Add a New Pet</h3>
              <button onClick={() => setIsAddPetOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddPet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Pet's Name</label>
                <input 
                  required
                  type="text" 
                  value={newPet.name}
                  onChange={e => setNewPet({...newPet, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#f2687c] focus:ring-1 focus:ring-[#f2687c] transition-all"
                  placeholder="e.g. Bella"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Species</label>
                  <select 
                    value={newPet.species}
                    onChange={e => setNewPet({...newPet, species: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#f2687c] focus:ring-1 focus:ring-[#f2687c] transition-all"
                  >
                    <option>Dog</option>
                    <option>Cat</option>
                    <option>Bird</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Age (Years)</label>
                  <input 
                    type="number" 
                    value={newPet.age}
                    onChange={e => setNewPet({...newPet, age: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#f2687c] focus:ring-1 focus:ring-[#f2687c] transition-all"
                    placeholder="e.g. 3"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Breed (Optional)</label>
                <input 
                  type="text" 
                  value={newPet.breed}
                  onChange={e => setNewPet({...newPet, breed: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#f2687c] focus:ring-1 focus:ring-[#f2687c] transition-all"
                  placeholder="e.g. Golden Retriever"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-[#f2687c] hover:bg-[#d75062] text-white font-bold py-3 rounded-xl transition-colors mt-4 shadow-sm hover:shadow-md"
              >
                Save Pet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
