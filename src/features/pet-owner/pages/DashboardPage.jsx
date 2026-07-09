import React from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Plus, Stethoscope, Star, PawPrint, 
  Wallet, ChevronRight, MessageCircle, Clock, X 
} from 'lucide-react';
import { supabase } from '../../auth/api/supabase';

export default function PetOwnerDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const [appointments, setAppointments] = React.useState([]);
  const [myPets, setMyPets] = React.useState([]);
  const [isAddPetOpen, setIsAddPetOpen] = React.useState(false);
  const [newPet, setNewPet] = React.useState({ name: '', species: 'Dog', breed: '', age: '' });
  
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

  const fetchAppointments = () => {
    if (user?.id) {
      supabase.from('appointments')
        .select(`
          id, scheduled_at, status,
          doctor:doctor_profiles(name, specialization),
          pet:pets(name)
        `)
        .eq('owner_id', user.id)
        .order('scheduled_at', { ascending: false })
        .limit(10)
        .then(({ data }) => {
          if (data) setAppointments(data);
        });
    }
  };

  React.useEffect(() => {
    if (user?.id) {
      fetchAppointments();
      fetchPets();
      
      // Prototype Helper: If returning from Stripe success on localhost, auto-confirm to bypass needing Stripe Webhook CLI
      if (window.location.search.includes('payment=success')) {
        supabase.from('appointments')
          .update({ status: 'CONFIRMED' })
          .eq('owner_id', user.id)
          .eq('status', 'ACCEPTED_PAYMENT_PENDING')
          .then(() => fetchAppointments());
      }

      // Realtime subscription for live appointment updates
      const appointmentsChannel = supabase
        .channel('public:appointments_owner')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `owner_id=eq.${user.id}`
        }, () => {
          fetchAppointments(); // Refresh list instantly when doctor accepts/updates
        })
        .subscribe();

      return () => {
        supabase.removeChannel(appointmentsChannel);
      };
    }
  }, [user]);

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

  const handlePayNow = async (appointmentId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ appointmentId })
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Payment initialization failed');
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend server. Make sure node server.js is running!");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#bd905b]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#bd905b]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full h-full min-h-screen px-4 sm:px-8 lg:px-12 py-8 relative z-10 flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-8 mb-8 border-b border-white/5">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-[#888] bg-clip-text text-transparent tracking-tight">
              Welcome back
            </h1>
            <p className="text-[#bd905b] mt-2 font-medium tracking-wide">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md"
          >
            <LogOut size={18} className="text-[#888]" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>

        {/* Payment Success/Cancel Toasts (We would use hot-toast in a real scenario) */}
        {window.location.search.includes('payment=success') && (
          <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-xl mb-8 flex justify-between items-center animate-in fade-in">
            <span>Payment successful! Your appointment is now Confirmed.</span>
            <button onClick={() => navigate('/pet-owner/dashboard')}><X size={16}/></button>
          </div>
        )}
        {window.location.search.includes('payment=cancelled') && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-xl mb-8 flex justify-between items-center animate-in fade-in">
            <span>Payment was cancelled. You can try paying again later.</span>
            <button onClick={() => navigate('/pet-owner/dashboard')}><X size={16}/></button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* My Pets Card (Glassmorphism) */}
            <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#bd905b]/5 rounded-bl-full transition-transform duration-700 group-hover:scale-110" />
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#bd905b]/20 rounded-lg">
                    <PawPrint size={20} className="text-[#bd905b]" />
                  </div>
                  <h2 className="text-xl font-semibold">My Pets</h2>
                </div>
                <button 
                  onClick={() => setIsAddPetOpen(true)}
                  className="flex items-center gap-1 text-[#bd905b] text-sm font-medium hover:text-[#d4af37] transition-colors"
                >
                  <Plus size={16} /> Add Pet
                </button>
              </div>
              
              <div className="space-y-3 relative z-10">
                {myPets.map(pet => (
                  <div key={pet.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer group/item">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#bd905b] to-[#8a6b43] flex items-center justify-center text-black font-bold shadow-lg">
                        {pet.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{pet.name}</p>
                        <p className="text-xs text-[#888]">{pet.breed} • {pet.age} yrs</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#555] group-hover/item:text-[#bd905b] transition-colors" />
                  </div>
                ))}
                
                {myPets.length === 0 && (
                  <p className="text-[#888] text-sm text-center py-4">No pets added yet. Click 'Add Pet' to get started.</p>
                )}
              </div>
            </div>

            {/* Wallet Card */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-white/5">
                <Wallet size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Wallet size={20} className="text-[#bd905b]" />
                  </div>
                  <h2 className="text-lg font-semibold">Wallet Balance</h2>
                </div>
                <p className="text-4xl font-bold text-white mb-2 tracking-tight">₹ 0.00</p>
                <div className="flex items-center gap-2 text-sm text-green-400 mb-6 bg-green-400/10 w-max px-3 py-1 rounded-full border border-green-400/20">
                  <Star size={14} /> Consultations are currently free
                </div>
                <button className="w-full py-3 bg-white/5 border border-white/10 text-[#888] rounded-xl font-medium cursor-not-allowed hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                  <Plus size={18} /> Recharge Wallet
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Browse Doctors */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Upcoming Consultations</h2>
                <p className="text-[#888] mt-1 text-sm">Manage your scheduled appointments and active requests.</p>
              </div>
              <button 
                onClick={() => navigate('/pet-owner/doctors')}
                className="bg-[#bd905b] text-black px-5 py-2.5 rounded-xl font-bold hover:bg-[#d4af37] transition-colors shadow-[0_0_15px_rgba(189,144,91,0.3)] flex items-center gap-2"
              >
                <Stethoscope size={18} /> Book New Appointment
              </button>
            </div>
            
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="bg-[#111111]/80 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={24} className="text-[#888]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Upcoming Appointments</h3>
                  <p className="text-[#888] max-w-sm mx-auto mb-6">You don't have any pending or confirmed appointments. Browse our directory to find a doctor.</p>
                  <button 
                    onClick={() => navigate('/pet-owner/doctors')}
                    className="text-[#bd905b] hover:text-white transition-colors font-medium border-b border-[#bd905b]/30 pb-1"
                  >
                    Browse Doctor Directory &rarr;
                  </button>
                </div>
              ) : (
                appointments.map(appt => (
                  <div key={appt.id} className="bg-[#111] border border-white/10 p-6 rounded-2xl flex items-center justify-between hover:border-[#bd905b]/30 transition-colors">
                    <div>
                      <h4 className="text-lg font-bold">{appt.doctor.name}</h4>
                      <p className="text-[#bd905b] text-sm mb-2">{appt.doctor.specialization || 'General Vet'} • For {appt.pet?.name || 'Pet'}</p>
                      <div className="flex items-center gap-4 text-[#888] text-sm">
                        <span className="flex items-center gap-1"><Clock size={14}/> {new Date(appt.scheduled_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                        appt.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                        appt.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        appt.status === 'ACCEPTED_PAYMENT_PENDING' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {appt.status.replaceAll('_', ' ')}
                      </span>
                      
                      {appt.status === 'ACCEPTED_PAYMENT_PENDING' && (
                        <button 
                          onClick={() => handlePayNow(appt.id)}
                          className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors shadow-lg animate-pulse"
                        >
                          Pay ₹500 Now
                        </button>
                      )}
                      
                      {appt.status === 'CONFIRMED' && (
                        <button 
                          onClick={() => navigate(`/pet-owner/chat/${appt.id}`)}
                          className="bg-[#bd905b] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#d4af37] transition-colors shadow-lg flex items-center gap-2"
                        >
                          <MessageCircle size={16}/> Start Chat
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add a New Pet</h3>
              <button onClick={() => setIsAddPetOpen(false)} className="text-[#888] hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddPet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#888] mb-1">Pet's Name</label>
                <input 
                  required
                  type="text" 
                  value={newPet.name}
                  onChange={e => setNewPet({...newPet, name: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#bd905b] transition-colors"
                  placeholder="e.g. Bella"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#888] mb-1">Species</label>
                  <select 
                    value={newPet.species}
                    onChange={e => setNewPet({...newPet, species: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#bd905b] transition-colors"
                  >
                    <option>Dog</option>
                    <option>Cat</option>
                    <option>Bird</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888] mb-1">Age (Years)</label>
                  <input 
                    type="number" 
                    value={newPet.age}
                    onChange={e => setNewPet({...newPet, age: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#bd905b] transition-colors"
                    placeholder="e.g. 3"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#888] mb-1">Breed (Optional)</label>
                <input 
                  type="text" 
                  value={newPet.breed}
                  onChange={e => setNewPet({...newPet, breed: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#bd905b] transition-colors"
                  placeholder="e.g. Golden Retriever"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-[#bd905b] hover:bg-[#d4af37] text-black font-bold py-3 rounded-xl transition-colors mt-4"
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
