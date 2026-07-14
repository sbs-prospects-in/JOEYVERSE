import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../features/auth/api/supabase';
import { useAuthStore } from '../../features/auth/store/authStore';
import ChatRoom from '../../components/chat/ChatRoom';
import toast, { Toaster } from 'react-hot-toast';

export default function ChatPage() {
  const { id } = useParams(); // consultation id
  const navigate = useNavigate();
  const { user, role: userRole } = useAuthStore();
  
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initChat = async () => {
      // 1. Fetch Consultation
      const { data: consult, error: consultError } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single();
        
      if (consultError || !consult) {
        toast.error("Consultation not found");
        navigate(userRole === 'doctor' ? '/doctor/dashboard' : '/pet-owner/dashboard');
        return;
      }
      
      // 1b. Fetch doctor and owner profiles manually
      const { data: docData } = await supabase.from('doctor_profiles').select('name').eq('id', consult.doctor_id).single();
      const { data: ownerData } = await supabase.from('owner_profiles').select('name').eq('id', consult.owner_id).single();
      
      consult.doctor = docData || { name: 'Doctor' };
      consult.owner = ownerData || { name: 'Pet Owner' };

      // We no longer auto-kick out completed chats so they can view history
      
      setConsultation(consult);
      setLoading(false);
    };

    if (user?.id) {
      initChat();
    }
  }, [id, user, navigate]);

  const handleEndConsultation = async () => {
    const confirmEnd = window.confirm("Are you sure you want to end this consultation? This will stop billing and close the chat.");
    if (!confirmEnd) return;

    // Update consultation status to COMPLETED
    const endedAt = new Date().toISOString();
    await supabase.from('consultations').update({ status: 'COMPLETED', ended_at: endedAt }).eq('id', id);
    
    setConsultation(prev => ({...prev, status: 'COMPLETED', ended_at: endedAt}));
    toast.success("Consultation completed!");
  };

  if (loading) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div></div>;

  const otherPersonName = userRole === 'doctor' ? consultation.owner.name : `Dr. ${consultation.doctor.name}`;
  const backLink = userRole === 'doctor' ? '/doctor/dashboard' : '/pet-owner/dashboard';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      <Toaster position="top-center" toastOptions={{ style: { background: '#fff', color: '#333' } }} />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <Link to={backLink} className="text-slate-500 hover:text-slate-900 text-sm mb-4 inline-block transition-colors">&larr; Back to Dashboard</Link>
            <h1 className="text-3xl font-light">Consultation Room</h1>
          </div>
          
          {consultation.status === 'ACTIVE' && (
            <button 
              onClick={handleEndConsultation}
              className="bg-red-50 text-red-600 border border-red-200 px-6 py-2 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
              End Consultation
            </button>
          )}
        </div>

        <ChatRoom 
          consultation={consultation}
          currentUserId={user.id} 
          otherPersonName={otherPersonName}
        />
      </div>
    </div>
  );
}
