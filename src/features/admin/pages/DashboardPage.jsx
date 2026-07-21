import React, { useEffect, useState } from 'react';
import { supabase } from '../../auth/api/supabase';
import { useAuthStore } from '../../auth/store/authStore';
import { Users, Activity, DollarSign, ShieldAlert, CheckCircle, XCircle, LayoutDashboard, Search, Ban, Eye, XOctagon } from 'lucide-react';
import toast from 'react-hot-toast';
import ChatInspector from '../components/ChatInspector';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [doctors, setDoctors] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Inspector States
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // In a real production app, this requires an admin JWT or Row Level Security policies that allow admins to bypass restrictions.
      const [doctorsRes, consultationsRes, walletsRes] = await Promise.all([
        supabase.from('doctor_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('consultations').select('*').order('created_at', { ascending: false }),
        supabase.from('wallets').select('*')
      ]);

      if (doctorsRes.data) setDoctors(doctorsRes.data);
      if (consultationsRes.data) setConsultations(consultationsRes.data);
      if (walletsRes.data) setWallets(walletsRes.data);
      
    } catch (err) {
      console.error("Error fetching admin data:", err);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDoctorStatus = async (id, statusUpdates) => {
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .update(statusUpdates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        throw new Error("You do not have permission to perform this action (or doctor not found).");
      }
      
      toast.success("Doctor status updated successfully!");
      setDoctors(doctors.map(doc => doc.id === id ? { ...doc, ...statusUpdates } : doc));
    } catch (err) {
      console.error("Error updating doctor:", err);
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleForceEndConsultation = async (consultationId) => {
    if (!window.confirm("Are you sure you want to forcibly end this active consultation?")) return;
    
    try {
      const { error } = await supabase
        .from('consultations')
        .update({ 
          status: 'CANCELLED', 
          ended_at: new Date().toISOString() 
        })
        .eq('id', consultationId);
        
      if (error) throw error;
      
      toast.success("Consultation forcibly ended.");
      setConsultations(consultations.map(c => 
        c.id === consultationId ? { ...c, status: 'CANCELLED', ended_at: new Date().toISOString() } : c
      ));
    } catch (err) {
      console.error("Error ending consultation:", err);
      toast.error("Failed to end consultation");
    }
  };

  // Stats Calculation
  const totalRevenue = consultations
    .filter(c => c.status === 'COMPLETED')
    .reduce((acc, curr) => {
      const start = new Date(curr.started_at || curr.created_at).getTime();
      const end = new Date(curr.ended_at || new Date()).getTime();
      const seconds = Math.floor((end - start) / 1000);
      const intervals = Math.ceil(Math.max(seconds, 0) / 60);
      // Assuming a 20% platform cut for demonstration
      return acc + (intervals * curr.per_minute_rate * 0.20);
    }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredDoctors = doctors.filter(doc => {
    const nameStr = doc.name || '';
    const specStr = doc.specialization || '';
    return nameStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
           specStr.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pt-24">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-72 bg-white border-r border-slate-200 shrink-0 p-6 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative">
        <div className="px-4 py-6">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="text-indigo-600" />
            Admin Panel
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Master Control</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              activeTab === 'doctors' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users size={18} />
            Doctor Management
          </button>
          <button
            onClick={() => setActiveTab('consultations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              activeTab === 'consultations' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Activity size={18} />
            Consultations
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900">Platform Overview</h1>
                <p className="text-slate-500 font-medium mt-1">Here is what is happening on Joeyverse today.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-5 shadow-inner">
                    <Users className="text-white" size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Registered Users</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">{wallets.length + doctors.length}</p>
                </div>
                
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100/50 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5 shadow-inner">
                    <ShieldAlert className="text-white" size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Doctors</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">{doctors.length}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-5 shadow-inner">
                    <Activity className="text-white" size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Live Consultations</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">{consultations.filter(c => c.status === 'ACTIVE').length}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-5 shadow-inner">
                    <DollarSign className="text-white" size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Platform Cut</p>
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-600 tracking-tight">₹{totalRevenue.toFixed(0)}</p>
                </div>
                
              </div>
            </div>
          )}

          {/* DOCTORS TAB */}
          {activeTab === 'doctors' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-slate-900">Doctor Management</h1>
                  <p className="text-slate-500 font-medium mt-1">Verify, approve, or ban doctors.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search doctors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl w-full sm:w-64 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xs">
                      <tr>
                        <th className="px-6 py-5">Doctor Profile</th>
                        <th className="px-6 py-5">Specialization</th>
                        <th className="px-6 py-5">Consultation Rate</th>
                        <th className="px-6 py-5">License & Phone</th>
                        <th className="px-6 py-5">Verification Status</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDoctors.map(doc => (
                        <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                                {doc.profile_image_url ? (
                                  <img src={doc.profile_image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-slate-500 font-bold">{doc.name ? doc.name.charAt(0) : '?'}</span>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{doc.name || 'Unknown Doctor'}</p>
                                <p className="text-slate-500 text-xs">{doc.email || doc.id.substring(0,8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600">{doc.specialization || 'General'}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">₹{doc.per_minute_rate || 0}/min</td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-slate-700">{doc.license_number || 'N/A'}</div>
                            <div className="text-xs text-slate-500">{doc.phone || 'No Phone'}</div>
                          </td>
                          <td className="px-6 py-4">
                            {doc.verified ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                <CheckCircle size={12} /> Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {!doc.verified && (
                                <button 
                                  onClick={() => handleUpdateDoctorStatus(doc.id, { verified: true })}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-xs transition-colors"
                                >
                                  Approve
                                </button>
                              )}
                              {doc.verified && (
                                <button 
                                  onClick={() => handleUpdateDoctorStatus(doc.id, { verified: false })}
                                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs transition-colors"
                                >
                                  Revoke
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CONSULTATIONS TAB */}
          {activeTab === 'consultations' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900">Consultations History</h1>
                <p className="text-slate-500 font-medium mt-1">Global view of all platform sessions.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-5">Session ID</th>
                      <th className="px-6 py-5">Doctor Profile</th>
                      <th className="px-6 py-5">Session Rate</th>
                      <th className="px-6 py-5">Status</th>
                      <th className="px-6 py-5">Created At</th>
                      <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {consultations.map(cons => (
                      <tr key={cons.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{cons.id.substring(0,8)}...</td>
                        <td className="px-6 py-4 font-bold text-slate-700">{cons.doctor_id.substring(0,8)}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">₹{cons.per_minute_rate}/min</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            cons.status === 'COMPLETED' ? 'bg-slate-100 text-slate-600' :
                            cons.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {cons.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(cons.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedConsultation(cons)}
                              className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
                              title="Inspect Chat"
                            >
                              <Eye size={16} />
                              <span className="text-xs font-bold">Inspect</span>
                            </button>
                            {cons.status === 'ACTIVE' && (
                              <button
                                onClick={() => handleForceEndConsultation(cons.id)}
                                className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5"
                                title="Force End Consultation"
                              >
                                <XOctagon size={16} />
                                <span className="text-xs font-bold">End</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Modals */}
      {selectedConsultation && (
        <ChatInspector 
          consultation={selectedConsultation} 
          onClose={() => setSelectedConsultation(null)} 
        />
      )}
    </div>
  );
}
