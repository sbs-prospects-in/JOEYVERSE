import React, { useState, useEffect, useRef } from 'react';
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
  const [isOnline, setIsOnline] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeConsultations, setActiveConsultations] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [history, setHistory] = useState([]);
  const [todaysSessions, setTodaysSessions] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    // Ensure we mark them OFFLINE when they log out
    if (isOnline && user?.id) {
      await supabase.from('doctor_profiles').update({ status: 'OFFLINE' }).eq('id', user.id);
    }
    await logout();
    navigate('/');
  };

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    // 1. Fetch Doctor Status from doctor_profiles
    const { data: profile } = await supabase
      .from('doctor_profiles')
      .select('status, name')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      setIsOnline(profile.status === 'ONLINE');
      setProfileData(profile);
    }

    // Helper to enrich consultations with owner names
    const enrichWithOwnerNames = async (consultationsData) => {
      if (!consultationsData || consultationsData.length === 0) return [];
      const ownerIds = [...new Set(consultationsData.map(c => c.owner_id))];
      const { data: owners } = await supabase
        .from('owner_profiles')
        .select('id, name')
        .in('id', ownerIds);
      
      const ownerMap = {};
      if (owners) {
        owners.forEach(o => ownerMap[o.id] = o.name);
      }
      return consultationsData.map(c => ({
        ...c,
        owner: { name: ownerMap[c.owner_id] || 'Pet Owner' }
      }));
    };

    // 2. Fetch Incoming Consultations (RINGING)
    const { data: reqData } = await supabase
      .from('consultations')
      .select(`
        id, status, created_at, owner_id
      `)
      .eq('doctor_id', user.id)
      .eq('status', 'RINGING')
      .order('created_at', { ascending: false });
      
    if (reqData) setRequests(await enrichWithOwnerNames(reqData));

    // 3. Fetch Active Consultations
    const { data: activeData } = await supabase
      .from('consultations')
      .select(`
        id, status, created_at, owner_id
      `)
      .eq('doctor_id', user.id)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (activeData) setActiveConsultations(await enrichWithOwnerNames(activeData));

    // 4. Fetch Waitlist
    const { data: waitlistData } = await supabase
      .from('consultations')
      .select('id, status, created_at, owner_id')
      .eq('doctor_id', user.id)
      .eq('status', 'WAITLIST')
      .order('created_at', { ascending: true });
    if (waitlistData) setWaitlist(await enrichWithOwnerNames(waitlistData));

    // 5. Fetch History (Completed)
    const { data: historyData } = await supabase
      .from('consultations')
      .select('id, status, created_at, owner_id, started_at, ended_at, per_minute_rate')
      .eq('doctor_id', user.id)
      .eq('status', 'COMPLETED')
      .order('ended_at', { ascending: false });
      
    if (historyData) {
      setHistory(await enrichWithOwnerNames(historyData.slice(0, 5)));
      
      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      
      let sessionsToday = 0;
      let earningsWeek = 0;
      
      historyData.forEach(c => {
        const endedTime = new Date(c.ended_at).getTime();
        const startedTime = new Date(c.started_at || c.created_at).getTime();
        
        if (endedTime >= today) {
          sessionsToday++;
        }
        
        if (endedTime >= oneWeekAgo) {
          const seconds = Math.floor((endedTime - startedTime) / 1000);
          const intervals = Math.ceil(Math.max(seconds, 0) / 60);
          earningsWeek += intervals * c.per_minute_rate;
        }
      });
      
      setTodaysSessions(sessionsToday);
      setWeeklyEarnings(earningsWeek);
    }

    setLoading(false);
  };

  const prevRequestsRef = useRef();
  useEffect(() => {
    prevRequestsRef.current = requests;
  }, [requests]);

  useEffect(() => {
    if (!user?.id) return;
    
    fetchDashboardData();

    // Listen to consultations
    const queueChannel = supabase
      .channel('public:consultations_doctor')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'consultations',
        filter: `doctor_id=eq.${user.id}`
      }, (payload) => {
        if (payload.new?.status === 'RINGING') {
          toast('Incoming Consultation Request!', { icon: '🔔', duration: 4000 });
        }
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(queueChannel);
    };
  }, [user]);

  const toggleAvailability = async () => {
    const newStatus = isOnline ? 'OFFLINE' : 'ONLINE';
    setIsOnline(!isOnline);
    await supabase
      .from('doctor_profiles')
      .update({ status: newStatus })
      .eq('id', user.id);
    toast.success(`You are now ${newStatus}`);
  };

  const handleAction = async (consultationId, action) => {
    if (action === 'ACCEPT') {
      const { error } = await supabase
        .from('consultations')
        .update({ status: 'ACTIVE', started_at: new Date().toISOString() })
        .eq('id', consultationId);
        
      if (!error) {
        toast.success('Consultation started! redirecting...');
        // Wait briefly for status to propagate, then go to chat
        setTimeout(() => navigate(`/doctor/chat/${consultationId}`), 1000);
      } else {
        toast.error('Failed to accept: ' + error.message);
      }
    } else if (action === 'REJECT') {
      const { error } = await supabase
        .from('consultations')
        .update({ status: 'REJECTED' })
        .eq('id', consultationId);
      
      if (!error) {
        toast.success('Consultation rejected.');
        fetchDashboardData();
      }
    } else if (action === 'CANCEL') {
      const confirmEnd = window.confirm("Are you sure you want to end this consultation?");
      if (!confirmEnd) return;
      
      const { error } = await supabase
        .from('consultations')
        .update({ status: 'COMPLETED', ended_at: new Date().toISOString() })
        .eq('id', consultationId);
        
      if (!error) {
        toast.success('Consultation ended.');
        fetchDashboardData();
      }
    } else if (action === 'CANCEL_WAITLIST') {
      const { error } = await supabase
        .from('consultations')
        .update({ status: 'CANCELLED' })
        .eq('id', consultationId);
      if (!error) {
        toast.success('Removed from waitlist.');
        fetchDashboardData();
      }
    } else if (action === 'ACCEPT_WAITLIST') {
      const { error } = await supabase
        .from('consultations')
        .update({ status: 'ACTIVE', started_at: new Date().toISOString() })
        .eq('id', consultationId);
        
      if (!error) {
        toast.success('Waitlist accepted! redirecting...');
        setTimeout(() => navigate(`/doctor/chat/${consultationId}`), 1000);
      }
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      <Toaster position="top-center" toastOptions={{ style: { background: '#fff', color: '#333' } }} />
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#f2687c]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full h-full min-h-screen px-4 sm:px-8 lg:px-12 pt-32 pb-8 relative z-10 flex flex-col">
        
        {/* Header & Status Toggle */}
        <div className="flex justify-between items-center pb-8 mb-8 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-slate-200 overflow-hidden shadow-sm shrink-0 bg-white">
              <img 
                src={(profileData?.email || user?.email || '').includes('anjali') ? '/images/dr-anjali.png' : '/images/dr-marcus.png'} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                {profileData?.name || (user?.email?.includes('anjali') ? 'Dr. Anjali Mehta' : user?.email?.includes('marcus') ? 'Dr. Marcus Owens' : user?.email?.includes('priya') ? 'Dr. Priya Nair' : 'Doctor Portal')}
              </h1>
              <p className="text-[#f2687c] text-sm font-medium tracking-wide">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-sm">
              <span className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isOnline ? 'text-green-500' : 'text-slate-500'}`}>
                {isOnline && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                )}
                {isOnline ? 'ONLINE - Accepting Chats' : 'OFFLINE'}
              </span>
              <button 
                onClick={toggleAvailability}
                className={`w-14 h-7 rounded-full transition-all duration-300 relative shadow-inner ${isOnline ? 'bg-green-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform duration-300 shadow-md ${isOnline ? 'translate-x-8' : 'translate-x-1'}`}></div>
              </button>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-300"
            >
              <LogOut size={18} className="text-slate-500" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Request Queue */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative overflow-hidden min-h-[500px]">
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Bell size={20} className="text-red-500 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-bold">Incoming Calls</h2>
                </div>
                <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                  {requests.length} Ringing
                </div>
              </div>
              
              {isOnline ? (
                <div className="space-y-4 relative z-10">
                  {requests.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      No incoming calls right now.
                    </div>
                  ) : (
                    requests.map(req => (
                      <div key={req.id} className="group bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-[#f2687c]/50 hover:bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden">
                        
                        <div className="flex justify-between items-start mb-3">
                          <p className="font-bold text-lg text-slate-900 group-hover:text-[#f2687c] transition-colors">{req.pet?.name || 'New Patient'}</p>
                          <span className="text-xs font-medium text-slate-400 flex items-center gap-1"><Clock size={12}/> Just now</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold text-white bg-[#f2687c] px-2 py-0.5 rounded-md">{req.pet?.species || 'Consultation'}</span>
                        </div>
                        
                        <p className="text-sm text-slate-500 mb-5 line-clamp-2">Owner: {req.owner?.name}</p>
                        
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleAction(req.id, 'ACCEPT')}
                            className="flex-1 py-2.5 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                          >
                            <MessageCircle size={16} /> Accept & Chat
                          </button>
                          <button 
                            onClick={() => handleAction(req.id, 'REJECT')}
                            className="px-3 py-2.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-red-100 hover:text-red-500 transition-colors flex items-center justify-center"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500">
                  <Activity size={48} className="text-slate-300 mb-4" />
                  <p className="font-medium">You are offline.</p>
                  <p className="text-sm mt-1">Toggle your status to start receiving incoming consultation calls.</p>
                </div>
              )}
              
              {/* Waiting Room (Waitlist) */}
              {isOnline && waitlist.length > 0 && (
                <div className="mt-8 relative z-10 border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-700">
                      <Users size={18} className="text-amber-500" /> Waiting Room
                    </h2>
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">{waitlist.length} Waiting</span>
                  </div>
                  <div className="space-y-3">
                    {waitlist.map(w => (
                      <div key={w.id} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-slate-800">{w.owner?.name}</p>
                          <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12}/> Waiting</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleAction(w.id, 'ACCEPT_WAITLIST')} className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors">Accept</button>
                          <button onClick={() => handleAction(w.id, 'CANCEL_WAITLIST')} className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors">Cancel</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Analytics & Quick Actions */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Active Consultations Section */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                Active Consultations <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{activeConsultations.length}</span>
              </h2>
              <div className="space-y-4">
                {activeConsultations.length === 0 ? (
                  <p className="text-slate-400">No active consultations.</p>
                ) : (
                  activeConsultations.map(req => (
                    <div key={req.id} className="bg-green-50/50 border border-green-200 p-5 rounded-xl flex items-center justify-between hover:border-green-300 transition-colors">
                      <div>
                        <h4 className="text-lg font-bold text-green-900">{req.pet?.name || 'Patient'}</h4>
                        <p className="text-sm text-green-700">Owner: {req.owner?.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/doctor/chat/${req.id}`)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition-colors shadow-sm flex items-center gap-2"
                        >
                          <MessageCircle size={16}/> Resume Chat
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, 'CANCEL')}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm border border-red-200 hover:bg-red-100 transition-colors shadow-sm flex items-center gap-2"
                        >
                          <XCircle size={16}/> Cancel
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Past Consultations (History) Section */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                <CheckCircle size={20} className="text-blue-500" /> Past Consultations
              </h2>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-slate-400 text-sm">No recent consultations.</p>
                ) : (
                  history.map(req => (
                    <div key={req.id} className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800">{req.owner?.name}</h4>
                        <p className="text-xs text-slate-500">{new Date(req.ended_at).toLocaleDateString()} • {new Date(req.ended_at).toLocaleTimeString()}</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/doctor/chat/${req.id}`)}
                        className="bg-white text-blue-600 px-3 py-1.5 rounded-lg font-bold text-xs border border-blue-200 hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-2"
                      >
                        <MessageCircle size={14}/> View History
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-slate-500 text-sm font-medium">Today's Sessions</p>
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><Users size={18}/></div>
                </div>
                <p className="text-4xl font-bold text-slate-900 tracking-tight">{todaysSessions}</p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-slate-500 text-sm font-medium">Average Rating</p>
                  <div className="p-2 bg-yellow-50 rounded-lg text-yellow-500"><Star size={18}/></div>
                </div>
                <p className="text-4xl font-bold text-slate-900 tracking-tight flex items-baseline gap-1">4.9 <span className="text-yellow-500 text-lg">⭐</span></p>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-slate-500 text-sm font-medium">Earnings This Week</p>
                  <div className="p-2 bg-[#f2687c]/10 rounded-lg text-[#f2687c] group-hover:bg-[#f2687c] group-hover:text-white transition-colors"><IndianRupee size={18}/></div>
                </div>
                <p className="text-4xl font-bold text-[#f2687c] tracking-tight">{weeklyEarnings.toLocaleString()}</p>
              </div>

            </div>

            {/* Earnings Chart */}
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Weekly Earnings Activity</h2>
                <button className="text-sm font-medium text-[#f2687c] flex items-center gap-1 hover:text-[#d45668] transition-colors">
                  View Full Report <ChevronRight size={16}/>
                </button>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={earningsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `₹${value}`} 
                      dx={-10}
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(0,0,0,0.02)'}} 
                      contentStyle={{
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }} 
                      itemStyle={{ color: '#f2687c', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="earnings" radius={[6, 6, 6, 6]}>
                      {
                        earningsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === earningsData.length - 1 ? '#d45668' : '#f2687c'} fillOpacity={index === earningsData.length - 1 ? 1 : 0.6} />
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
