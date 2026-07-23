import React, { useEffect, useState } from 'react';
import { supabase } from '../../auth/api/supabase';
import { useAuthStore } from '../../auth/store/authStore';
import { LayoutDashboard, Users, Activity, Heart, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import ChatInspector from '../components/ChatInspector';
import PlatformRevenue from '../components/PlatformRevenue';
import UserManagement from '../components/UserManagement';
import ConsultationsHistory from '../components/ConsultationsHistory';
import DoctorProfileModal from '../components/DoctorProfileModal';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [doctors, setDoctors] = useState([]);
  const [owners, setOwners] = useState([]);
  const [pets, setPets] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Inspector States
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [doctorsRes, ownersRes, petsRes, consultationsRes, walletsRes, revenueRes] = await Promise.all([
        supabase.from('doctor_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('owner_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('pets').select('*'),
        supabase.from('consultations').select('*').order('created_at', { ascending: false }),
        supabase.from('wallets').select('*'),
        supabase.from('platform_revenue').select('*')
      ]);

      if (doctorsRes.data) setDoctors(doctorsRes.data);
      if (ownersRes.data) setOwners(ownersRes.data);
      if (petsRes.data) setPets(petsRes.data);
      if (consultationsRes.data) setConsultations(consultationsRes.data);
      if (walletsRes.data) setWallets(walletsRes.data);
      if (revenueRes.data) setRevenue(revenueRes.data);
      
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

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm("Are you sure you want to decline and remove this doctor request?")) return;
    try {
      const { error } = await supabase
        .from('doctor_profiles')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw new Error("You do not have permission to perform this action. Please run the required SQL in Supabase to fix permissions.");
      }
      
      toast.success("Doctor request declined and removed successfully");
      setDoctors(doctors.filter(d => d.id !== id));
    } catch (err) {
      toast.error(err.message);
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

  const handleApproveRate = async (doctorId, newRate) => {
    try {
      const res = await fetch('/api/admin/approve-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve rate');
      
      toast.success('Rate approved successfully');
      setDoctors(doctors.map(d => d.id === doctorId ? { ...d, per_minute_rate: newRate, pending_rate_request: null, rate_status: 'Approved' } : d));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRejectRate = async (doctorId) => {
    if (!window.confirm("Are you sure you want to reject this rate request?")) return;
    try {
      const res = await fetch('/api/admin/reject-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject rate');
      
      toast.success('Rate request rejected');
      setDoctors(doctors.map(d => d.id === doctorId ? { ...d, pending_rate_request: null, rate_status: 'Rejected' } : d));
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Stats Calculation
  const totalRevenue = revenue.reduce((acc, curr) => acc + (curr.platform_share ? Number(curr.platform_share) : 0), 0);

  const filteredDoctors = doctors.filter(doc => {
    const nameStr = doc.name || '';
    const specStr = doc.specialization || '';
    const emailStr = doc.email || '';
    return nameStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
           specStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
           emailStr.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredOwners = owners.filter(owner => {
    const nameStr = owner.name || '';
    return nameStr.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

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
          <button
            onClick={() => setActiveTab('owners')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              activeTab === 'owners' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart size={18} />
            Pet Owners
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          {activeTab === 'overview' && (
            <PlatformRevenue 
              wallets={wallets} 
              doctors={doctors} 
              consultations={consultations} 
              totalRevenue={totalRevenue} 
            />
          )}

          <UserManagement 
            activeTab={activeTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredDoctors={filteredDoctors}
            filteredOwners={filteredOwners}
            wallets={wallets}
            pets={pets}
            handleApproveRate={handleApproveRate}
            handleRejectRate={handleRejectRate}
            handleUpdateDoctorStatus={handleUpdateDoctorStatus}
          />

          {activeTab === 'consultations' && (
            <ConsultationsHistory 
              consultations={consultations}
              setSelectedConsultation={setSelectedConsultation}
              handleForceEndConsultation={handleForceEndConsultation}
            />
          )}

        </div>
      </div>
      
      {/* Modals */}
      <DoctorProfileModal
        selectedDoctor={selectedDoctor}
        setSelectedDoctor={setSelectedDoctor}
        handleDeleteDoctor={handleDeleteDoctor}
        handleUpdateDoctorStatus={handleUpdateDoctorStatus}
      />

      {selectedConsultation && (
        <ChatInspector 
          consultation={selectedConsultation} 
          onClose={() => setSelectedConsultation(null)} 
        />
      )}
    </div>
  );
}
