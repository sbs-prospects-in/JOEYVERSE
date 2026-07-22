import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../features/auth/api/supabase';
import { useAuthStore } from '../../features/auth/store/authStore';
import ChatRoom from '../../components/chat/ChatRoom';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, ShieldCheck, Star } from 'lucide-react';

const RatingModal = ({ onSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
        <h3 className="text-2xl font-black text-slate-900 mb-2">Rate your consultation</h3>
        <p className="text-slate-500 mb-6">Please let us know how your experience was. Your feedback helps us improve.</p>
        
        <div className="flex items-center gap-2 mb-6 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110 active:scale-95">
              <Star size={36} className={`${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} transition-colors`} />
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">Doubts or suggestions? (Optional)</label>
          <textarea 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us what you loved or what could be better..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#f2687c] focus:border-transparent resize-none h-24"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Skip</button>
          <button 
            onClick={() => onSubmit(rating, feedback)} 
            disabled={rating === 0} 
            className="flex-1 py-3 bg-[#f2687c] text-white font-bold rounded-xl hover:bg-[#e05669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const { id } = useParams(); // consultation id
  const navigate = useNavigate();
  const { user, role: userRole } = useAuthStore();
  
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);

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

    // Listen for consultation updates (like doctor ending it)
    const channel = supabase
      .channel(`chat_page_consultation_${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'consultations',
        filter: `id=eq.${id}`
      }, (payload) => {
        if (payload.new.status === 'COMPLETED') {
          setConsultation(prev => {
             // Only show rating if the chat transitioned from ACTIVE to COMPLETED while on this page
             if (prev && prev.status === 'ACTIVE') {
                 if (userRole === 'petOwner') setShowRating(true);
                 return {...prev, status: 'COMPLETED'};
             }
             return prev;
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user, navigate, userRole]);

  const handleEndConsultation = async () => {
    const confirmEnd = window.confirm("Are you sure you want to end this consultation? This will stop billing and close the chat.");
    if (!confirmEnd) return;

    // Update consultation status to COMPLETED
    const endedAt = new Date().toISOString();

    try {
      const start = new Date(consultation.started_at || consultation.created_at).getTime();
      const end = new Date(endedAt).getTime();
      let seconds = Math.floor((end - start) / 1000);
      if (seconds < 0) seconds = 0;
      const intervals = Math.ceil(Math.max(seconds, 0) / 60);
      const finalFee = intervals * consultation.per_minute_rate;
      
      if (finalFee > 0) {
        const { error: walletError } = await supabase.rpc('wallet_deduct', {
          p_user_id: consultation.owner_id,
          p_amount: finalFee,
          p_description: `Consultation fee for ${consultation.id}`
        });
        if (walletError) console.error("Wallet deduction error:", walletError);
      }
    } catch (err) {
      console.error("Error calculating or deducting fee:", err);
    }

    await supabase.from('consultations').update({ status: 'COMPLETED', ended_at: endedAt }).eq('id', id);
    
    setConsultation(prev => ({...prev, status: 'COMPLETED', ended_at: endedAt}));
    toast.success("Consultation completed!");
    
    // Show rating modal for Pet Owners
    if (userRole === 'petOwner') {
      setShowRating(true);
    } else {
      navigate('/doctor/dashboard');
    }
  };

  const handleRatingSubmit = async (rating, feedback) => {
    try {
      const { error } = await supabase
        .from('consultations')
        .update({ rating, review_text: feedback })
        .eq('id', id);
        
      if (error) throw error;
      toast.success("Thank you for your feedback!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review");
    } finally {
      setShowRating(false);
      navigate('/pet-owner/dashboard');
    }
  };

  const handleRatingClose = () => {
    setShowRating(false);
    navigate('/pet-owner/dashboard');
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
      
      
      <div className="w-full max-w-5xl mx-auto px-4 h-[calc(100dvh-7rem)] flex flex-col">
        
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
              End Consult
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
