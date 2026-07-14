import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../features/auth/api/supabase';
import { useAuthStore } from '../../features/auth/store/authStore';
import ChatRoom from '../../components/chat/ChatRoom';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, ShieldCheck, Phone } from 'lucide-react';

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

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-[#f2687c] rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium">Opening secure room...</p>
    </div>
  );

  const formattedDoctorName = consultation.doctor.name.startsWith('Dr.') ? consultation.doctor.name : `Dr. ${consultation.doctor.name}`;
  const otherPersonName = userRole === 'doctor' ? consultation.owner.name : formattedDoctorName;
  const backLink = userRole === 'doctor' ? '/doctor/dashboard' : '/pet-owner/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-8 pt-24 selection:bg-[#f2687c]/20">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-5xl mx-auto px-4 h-[calc(100vh-7rem)] flex flex-col">
        
        {/* Sleek Minimal Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 shrink-0">
          <div>
            <Link 
              to={backLink} 
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium mb-5"
            >
              <ArrowLeft size={16} />
              Return to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Live Consult</h1>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                <ShieldCheck size={14} /> Encrypted
              </div>
            </div>
          </div>
          
          {consultation.status === 'ACTIVE' && (
            <button 
              onClick={handleEndConsultation}
              className="mt-4 md:mt-0 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 hover:border-red-500 px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2"
            >
              <Phone size={16} className="rotate-[135deg]" /> End Call
            </button>
          )}
        </div>

        {/* Chat Component Container */}
        <div className="flex-1 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden flex flex-col min-h-0">
          <ChatRoom 
            consultation={consultation}
            currentUserId={user.id} 
            otherPersonName={otherPersonName}
          />
        </div>
      </div>
    </div>
  );
}
