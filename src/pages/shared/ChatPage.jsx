import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../features/auth/api/supabase';
import { useAuthStore } from '../../features/auth/store/authStore';
import ChatRoom from '../../components/chat/ChatRoom';
import toast, { Toaster } from 'react-hot-toast';

export default function ChatPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user, userRole } = useAuthStore();
  
  const [appointment, setAppointment] = useState(null);
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initChat = async () => {
      // 1. Validate Appointment
      const { data: appt, error: apptError } = await supabase
        .from('appointments')
        .select('*, doctor:doctor_profiles(name), owner:owner_profiles(name)')
        .eq('id', appointmentId)
        .single();
        
      if (apptError || !appt) {
        toast.error("Appointment not found");
        navigate(-1);
        return;
      }

      // Allow access if CONFIRMED. If COMPLETED, allow read-only (for this MVP, we just allow normal access or block it entirely). 
      // Let's block it entirely if it's not CONFIRMED.
      if (appt.status !== 'CONFIRMED') {
        toast.error(`Appointment is ${appt.status}. Chat is closed.`);
        navigate(-1);
        return;
      }
      
      setAppointment(appt);

      // 2. Fetch or Create Chat Row
      const { data: existingChat, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single();

      if (existingChat) {
        setChat(existingChat);
      } else {
        // If chat doesn't exist, create it (usually the first person to open the page creates it)
        const { data: newChat, error: createError } = await supabase
          .from('chats')
          .insert([{
            appointment_id: appointmentId,
            doctor_id: appt.doctor_id,
            owner_id: appt.owner_id
          }])
          .select()
          .single();
          
        if (createError) {
          console.error(createError);
          toast.error("Failed to initialize chat");
        } else {
          setChat(newChat);
        }
      }
      setLoading(false);
    };

    if (user?.id) {
      initChat();
    }
  }, [appointmentId, user, navigate]);

  const handleEndConsultation = async () => {
    const confirmEnd = window.confirm("Are you sure you want to end this consultation? This will close the chat permanently.");
    if (!confirmEnd) return;

    // Update appointment status to COMPLETED
    await supabase.from('appointments').update({ status: 'COMPLETED' }).eq('id', appointmentId);
    
    toast.success("Consultation completed!");
    setTimeout(() => {
      navigate('/doctor/dashboard');
    }, 1500);
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bd905b]"></div></div>;

  const otherPersonName = userRole === 'doctor' ? appointment.owner.name : `Dr. ${appointment.doctor.name}`;
  const backLink = userRole === 'doctor' ? '/doctor/dashboard' : '/pet-owner/dashboard';

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      <Toaster position="top-center" toastOptions={{ style: { background: '#222', color: '#fff' } }} />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <Link to={backLink} className="text-[#888] hover:text-white text-sm mb-4 inline-block transition-colors">&larr; Back to Dashboard</Link>
            <h1 className="text-3xl font-light">Consultation Room</h1>
          </div>
          
          {userRole === 'doctor' && (
            <button 
              onClick={handleEndConsultation}
              className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-500 hover:text-white transition-colors"
            >
              End Consultation
            </button>
          )}
        </div>

        {chat && (
          <ChatRoom 
            appointmentId={appointmentId} 
            chatId={chat.id} 
            currentUserId={user.id} 
            otherPersonName={otherPersonName}
          />
        )}
      </div>
    </div>
  );
}
