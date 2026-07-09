import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { supabase } from '../../auth/api/supabase';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  LogOut, Activity, Users, Star, IndianRupee, 
  Clock, CheckCircle, XCircle, ChevronRight, Bell, MessageCircle
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Doctor's Pending Requests & Availability
  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    // 1. Fetch Availability Status
    const { data: availData } = await supabase
      .from('doctor_availability')
      .select('current_status')
      .eq('doctor_id', user.id)
      .single();
    
    if (availData) {
      setIsOnline(availData.current_status !== 'Offline');
    }

    // 2. Fetch PENDING appointments
    const { data: reqData } = await supabase
      .from('appointments')
      .select(`
        id, scheduled_at, status,
        pet:pets(name, species),
        owner:owner_profiles(name)
      `)
      .eq('doctor_id', user.id)
      .in('status', ['PENDING', 'CONFIRMED', 'ACCEPTED_PAYMENT_PENDING'])
      .order('scheduled_at', { ascending: true });
      
    if (reqData) setRequests(reqData);
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.id) return;
    
    fetchDashboardData();

    // Realtime subscription for live appointment requests and status updates
    const queueChannel = supabase
      .channel('public:appointments_doctor')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `doctor_id=eq.${user.id}`
      }, () => {
        fetchDashboardData(); // Refresh queue instantly when patient books or pays
      })
      .subscribe();

    return () => {
      supabase.removeChannel(queueChannel);
    };
  }, [user]);

  const toggleAvailability = async () => {
    const newStatus = isOnline ? 'Offline' : 'Accepting Requests';
    setIsOnline(!isOnline);
    await supabase
      .from('doctor_availability')
      .update({ current_status: newStatus })
      .eq('doctor_id', user.id);
    toast.success(`You are now ${newStatus}`);
  };

  const handleAction = async (appointmentId, action) => {
    let newStatus;
    if (action === 'ACCEPT') newStatus = 'ACCEPTED_PAYMENT_PENDING';
    else if (action === 'REJECT') newStatus = 'REJECTED';
    else if (action === 'CONFIRM') newStatus = 'CONFIRMED';
    
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);
      
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Action Successful`);
      fetchDashboardData(); // Refetch all to update UI properly
    }
  };

  // Mock Chart Data
  const earningsData = [
    { name: 'Mon', earnings: 1200 },
    { name: 'Tue', earnings: 2100 },
    { name: 'Wed', earnings: 800 },
    { name: 'Thu', earnings: 1600 },
    { name: 'Fri', earnings: 2400 },
    { name: 'Sat', earnings: 3200 },
    { name: 'Sun', earnings: 2900 },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      <Toaster position="top-center" toastOptions={{ style: { background: '#222', color: '#fff' } }} />
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#bd905b]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#bd905b]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full h-full min-h-screen px-4 sm:px-8 lg:px-12 py-8 relative z-10 flex flex-col">
        
        {/* Header & Status Toggle */}
        <div className="flex justify-between items-center pb-8 mb-8 border-b border-white/5">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-[#888] bg-clip-text text-transparent tracking-tight">
              Doctor Portal
            </h1>
            <p className="text-[#bd905b] mt-2 font-medium tracking-wide">{user?.email}</p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 bg-[#111]/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/5 shadow-lg">
              <span className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isOnline ? 'text-green-500' : 'text-[#888]'}`}>
                {isOnline && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                )}
                {isOnline ? 'Accepting Patients' : 'Offline'}
              </span>
              <button 
                onClick={toggleAvailability}
                className={`w-14 h-7 rounded-full transition-all duration-300 relative shadow-inner ${isOnline ? 'bg-green-500' : 'bg-[#333]'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform duration-300 shadow-md ${isOnline ? 'translate-x-8' : 'translate-x-1'}`}></div>
              </button>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md"
            >
              <LogOut size={18} className="text-[#888]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Request Queue */}
          <div className="lg:col-span-4">
            <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden min-h-[500px]">
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Bell size={20} className="text-red-500 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-bold">Live Queue</h2>
                </div>
                <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                  {requests.length} Waiting
                </div>
              </div>
              
              {isOnline ? (
                <div className="space-y-4 relative z-10">
                  {requests.filter(req => req.status === 'PENDING').length === 0 ? (
                    <div className="text-center py-12 text-[#888]">
                      No pending requests at the moment.
                    </div>
                  ) : (
                    requests.filter(req => req.status === 'PENDING').map(req => (
                      <div key={req.id} className="group bg-white/5 p-5 rounded-xl border border-white/5 hover:border-[#bd905b]/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden">
                        
                        <div className="flex justify-between items-start mb-3">
                          <p className="font-bold text-lg text-white group-hover:text-[#bd905b] transition-colors">{req.pet?.name || 'Pet'}</p>
                          <span className="text-xs font-medium text-[#888] flex items-center gap-1"><Clock size={12}/> {new Date(req.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold text-black bg-[#bd905b] px-2 py-0.5 rounded-md">{req.pet?.species || 'Animal'}</span>
                        </div>
                        
                        <p className="text-sm text-[#ccc] mb-5 line-clamp-2">Owner: {req.owner?.name}</p>
                        
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleAction(req.id, 'ACCEPT')}
                            className="flex-1 py-2.5 bg-gradient-to-r from-[#bd905b] to-[#d4af37] text-black font-bold rounded-lg hover:shadow-[0_4px_15px_rgba(189,144,91,0.4)] transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={16} /> Accept
                          </button>
                          <button 
                            onClick={() => handleAction(req.id, 'REJECT')}
                            className="px-3 py-2.5 bg-white/5 text-[#888] rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center justify-center"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center text-[#888]">
                  <Activity size={48} className="text-[#333] mb-4" />
                  <p className="font-medium">You are offline.</p>
                  <p className="text-sm mt-1">Toggle your status to start receiving patient requests.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Analytics & Quick Actions */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Confirmed Appointments Section */}
            <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
              <h2 className="text-xl font-bold mb-6">Confirmed Consultations (Paid)</h2>
              <div className="space-y-4">
                {requests.filter(req => req.status === 'CONFIRMED').length === 0 ? (
                  <p className="text-[#888]">No active consultations ready for chat.</p>
                ) : (
                  requests.filter(req => req.status === 'CONFIRMED').map(req => (
                    <div key={req.id} className="bg-white/5 border border-white/10 p-5 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold">{req.pet?.name || 'Pet'}</h4>
                        <p className="text-sm text-[#888]">Owner: {req.owner?.name}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/doctor/chat/${req.id}`)}
                        className="bg-[#bd905b] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#d4af37] transition-colors shadow-lg flex items-center gap-2"
                      >
                        <MessageCircle size={16}/> Start Chat
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Awaiting Payment Section */}
            <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                Waiting For Payment <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">{requests.filter(req => req.status === 'ACCEPTED_PAYMENT_PENDING').length}</span>
              </h2>
              <div className="space-y-4">
                {requests.filter(req => req.status === 'ACCEPTED_PAYMENT_PENDING').length === 0 ? (
                  <p className="text-[#888]">No appointments waiting for payment.</p>
                ) : (
                  requests.filter(req => req.status === 'ACCEPTED_PAYMENT_PENDING').map(req => (
                    <div key={req.id} className="bg-white/5 border border-white/10 p-5 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold">{req.pet?.name || 'Pet'}</h4>
                        <p className="text-sm text-[#888]">Owner: {req.owner?.name}</p>
                      </div>
                      <button 
                        onClick={() => handleAction(req.id, 'CONFIRM')}
                        className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-500 hover:text-white transition-colors shadow-lg"
                      >
                        Force Confirm (Dev Mode)
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-gradient-to-br from-[#111111]/80 to-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl hover:-translate-y-1 transition-transform duration-300">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[#888] text-sm font-medium">Today's Sessions</p>
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Users size={18}/></div>
                </div>
                <p className="text-4xl font-bold tracking-tight">0</p>
              </div>

              <div className="bg-gradient-to-br from-[#111111]/80 to-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl hover:-translate-y-1 transition-transform duration-300">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[#888] text-sm font-medium">Average Rating</p>
                  <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Star size={18}/></div>
                </div>
                <p className="text-4xl font-bold text-white tracking-tight flex items-baseline gap-1">4.9 <span className="text-yellow-500 text-lg">⭐</span></p>
              </div>

              <div className="bg-gradient-to-br from-[#111111]/80 to-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl hover:-translate-y-1 transition-transform duration-300 group">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[#888] text-sm font-medium">Earnings This Week</p>
                  <div className="p-2 bg-[#bd905b]/10 rounded-lg text-[#bd905b] group-hover:bg-[#bd905b] group-hover:text-black transition-colors"><IndianRupee size={18}/></div>
                </div>
                <p className="text-4xl font-bold text-[#bd905b] tracking-tight">14,200</p>
              </div>

            </div>

            {/* Earnings Chart */}
            <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Weekly Earnings Activity</h2>
                <button className="text-sm font-medium text-[#bd905b] flex items-center gap-1 hover:text-[#d4af37] transition-colors">
                  View Full Report <ChevronRight size={16}/>
                </button>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={earningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#666" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="#666" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `₹${value}`} 
                      dx={-10}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.02)'}} 
                      contentStyle={{
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                      }} 
                      itemStyle={{ color: '#bd905b', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="earnings" radius={[6, 6, 6, 6]}>
                      {
                        earningsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === earningsData.length - 1 ? '#d4af37' : '#bd905b'} fillOpacity={index === earningsData.length - 1 ? 1 : 0.6} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
