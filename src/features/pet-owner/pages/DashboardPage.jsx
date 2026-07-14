import React, { useRef } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Plus, Stethoscope, Star, PawPrint, 
  Wallet, ChevronRight, MessageCircle, Clock, X 
} from 'lucide-react';
import { supabase } from '../../auth/api/supabase';
import toast from 'react-hot-toast';

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

  const prevAppointmentsRef = useRef();
  React.useEffect(() => {
    prevAppointmentsRef.current = appointments;
  }, [appointments]);

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
        }, (payload) => {
          const oldAppt = prevAppointmentsRef.current?.find(a => a.id === payload.new?.id);
          if (payload.new?.status === 'READY_FOR_CHAT' && oldAppt?.status === 'CONFIRMED') {
            toast.success("The doctor is ready! You can now join the chat.", { duration: 6000, icon: '🟢' });
          }
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#f2687c]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full h-full min-h-screen px-4 sm:px-8 lg:px-12 py-8 relative z-10 flex flex-col">
        
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
                <p className="text-4xl font-black text-slate-900 mb-2 tracking-tight">₹ 0.00</p>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-6 bg-emerald-100/50 w-max px-3 py-1.5 rounded-full border border-emerald-200/50 shadow-sm uppercase tracking-wider">
                  <Star size={14} className="fill-current" /> Consultations are currently free
                </div>
                <button className="w-full py-3 bg-white/60 border border-emerald-200/50 text-slate-400 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2 transition-colors uppercase tracking-wider text-xs">
                  <Plus size={16} /> Recharge Wallet
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Browse Doctors */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Upcoming Consultations</h2>
                <p className="text-slate-500 mt-1 text-sm">Manage your scheduled appointments and active requests.</p>
              </div>
              <button 
                onClick={() => navigate('/pet-owner/doctors')}
                className="bg-[#f2687c] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#d75062] transition-colors shadow-md flex items-center gap-2 hover:-translate-y-0.5"
              >
                <Stethoscope size={18} /> Book New Appointment
              </button>
            </div>
            
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Clock size={24} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Upcoming Appointments</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-6">You don't have any pending or confirmed appointments. Browse our directory to find a doctor.</p>
                  <button 
                    onClick={() => navigate('/pet-owner/doctors')}
                    className="text-[#f2687c] hover:text-[#d75062] transition-colors font-medium border-b border-[#f2687c]/30 pb-1"
                  >
                    Browse Doctor Directory &rarr;
                  </button>
                </div>
              ) : (
                appointments.map(appt => (
                  <div key={appt.id} className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between hover:border-[#f2687c]/50 hover:shadow-sm transition-all group hover:-translate-y-0.5">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{appt.doctor.name}</h4>
                      <p className="text-slate-600 text-sm mb-2 font-medium">{appt.doctor.specialization || 'General Vet'} • For {appt.pet?.name || 'Pet'}</p>
                      <div className="flex items-center gap-4 text-slate-500 text-sm">
                        <span className="flex items-center gap-1"><Clock size={14}/> {new Date(appt.scheduled_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                        appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 border border-green-200' :
                        appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        appt.status === 'ACCEPTED_PAYMENT_PENDING' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {appt.status.replaceAll('_', ' ')}
                      </span>
                      
                      {appt.status === 'ACCEPTED_PAYMENT_PENDING' && (
                        <button 
                          onClick={() => handlePayNow(appt.id)}
                          className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#f2687c] transition-colors shadow-sm animate-pulse"
                        >
                          Pay ₹500 Now
                        </button>
                      )}
                      
                      {appt.status === 'CONFIRMED' && (
                        <button disabled className="bg-slate-100 text-slate-500 px-4 py-2 rounded-lg font-bold text-sm cursor-not-allowed flex items-center gap-2 border border-slate-200">
                          <MessageCircle size={16}/> Waiting for Doctor...
                        </button>
                      )}
                      
                      {appt.status === 'READY_FOR_CHAT' && (
                        <Link 
                          to={`/pet-owner/chat/${appt.id}`}
                          className="bg-[#f2687c] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#d75062] transition-colors shadow-sm flex items-center gap-2 animate-pulse"
                        >
                          <MessageCircle size={16}/> Join Chat Now
                        </Link>
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
