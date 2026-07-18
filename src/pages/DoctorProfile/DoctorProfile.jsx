import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Award, Sparkles, HeartPulse, ShieldCheck, Clock, DollarSign, ChevronLeft, Calendar, Mail, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../features/auth/api/supabase';
import SchedulingModal from '../../features/shared/components/SchedulingModal';

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);

  useEffect(() => {
    async function fetchDoctorData() {
      try {
        // Fetch doctor profile
        const { data: docData, error: docError } = await supabase
          .from('doctor_profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (docError) throw docError;
        setDoctor(docData);

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('consultations')
          .select('rating, review_text, profiles(full_name), ended_at')
          .eq('doctor_id', id)
          .not('rating', 'is', null)
          .order('ended_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctorData();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-28 pb-20 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="pt-28 pb-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Doctor not found</h2>
        <Link to="/doctors" className="text-rose-500 hover:underline mt-4 inline-block">Return to Veterinarians</Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 md:px-8 max-w-[1280px] mx-auto flex flex-col gap-8">
      
      {/* Back link */}
      <div>
        <Link 
          to="/doctors" 
          className="inline-flex items-center gap-1.5 text-xs font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Veterinarians
        </Link>
      </div>

      {/* ==========================================
         PROFILE HEADER CARD
         ========================================== */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
        
        {/* Subtle background overlay blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-rose-100/20 blur-3xl pointer-events-none" />
        
        {/* Headshot Frame */}
        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-slate-50 shadow-md shrink-0">
          <img 
            src={doctor.img || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400'} 
            alt={doctor.name} 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400'; }}
          />
        </div>

        {/* Doctor Identity details */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <span className="inline-flex bg-rose-50 border border-rose-100 text-rose-600 px-2.5 py-0.5 rounded-md text-[0.65rem] font-bold uppercase tracking-wider mb-1">
            {doctor.specialty || 'General Veterinary Medicine'}
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
            {doctor.name}
          </h1>
          <span className="text-slate-400 font-medium text-sm">
            {doctor.credentials || 'DVM / BVSc'}
          </span>
          
          {/* Status badge inline */}
          <div className="flex items-center gap-2 mt-4">
            <span className="bg-rose-50 border border-rose-100 px-3.5 py-1 text-xs font-bold text-rose-600 rounded-full flex items-center gap-1.5 shadow-sm">
              <Award className="w-3.5 h-3.5" /> Licensed Practitioner
            </span>
            <span className={`px-3.5 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm ${doctor.status === 'ONLINE' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${doctor.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} /> {doctor.status}
            </span>
          </div>
        </div>

        {/* Floating Rating Badge (Desktop) */}
        <div className="absolute top-6 right-6 hidden md:flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200/50 shadow-sm">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-bold text-slate-700">{doctor.rating || '4.8'}</span>
        </div>

      </div>

      {/* ==========================================
         TWO-COLUMN SECTION
         ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: Bio & Qualifications */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Biography Card */}
          <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100">
            <h3 className="border-l-4 border-rose-300 pl-3 font-extrabold text-lg text-slate-800 mb-4 tracking-tight">
              Professional Biography
            </h3>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              {doctor.bio || 'Licensed board-certified veterinary medical practitioner with years of practical compassionate clinical experience.'}
            </p>
            <p className="text-slate-500 text-sm leading-relaxed mt-4">
              With over {doctor.experience} years of dedicated pet care experience, {doctor.name} remains committed to providing accessible, board-certified medical guidance. Our virtual consult clinic allows you to discuss symptoms, review diet plans, and obtain active stubs in the comfort of your home.
            </p>
          </div>

          {/* Clinical Focuses */}
          <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100">
            <h3 className="border-l-4 border-rose-300 pl-3 font-extrabold text-lg text-slate-800 mb-6 tracking-tight">
              Clinical Core Focuses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Triage & Diagnostics', desc: 'Symptom analysis, video physical triage review.' },
                { title: 'Prescription Coordination', desc: 'Secure medical renew panels and active stubs.' },
                { title: 'Chronic Care Panels', desc: 'Diet tweaks, behavioral guidance, allergy charts.' },
                { title: 'Emergency Guidance', desc: 'Late night critical first-aid tracking steps.' },
              ].map((focus, i) => (
                <div key={i} className="flex gap-3 items-start p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 leading-none mb-1">{focus.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{focus.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-slate-100">
            <h3 className="border-l-4 border-amber-300 pl-3 font-extrabold text-lg text-slate-800 mb-6 tracking-tight flex justify-between items-center">
              <span>Patient Reviews</span>
              <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">{reviews.length} Reviews</span>
            </h3>
            
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                          {rev.profiles?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{rev.profiles?.full_name || 'Anonymous Patient'}</p>
                          <p className="text-[10px] text-slate-400">{new Date(rev.ended_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < rev.rating ? 'fill-current' : 'text-slate-200'} />
                        ))}
                      </div>
                    </div>
                    {rev.review_text && (
                      <p className="text-slate-600 text-sm italic pl-10">"{rev.review_text}"</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400 font-medium">No reviews yet for this doctor.</p>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Schedule & CTAs */}
        <div className="flex flex-col gap-6">
          
          {/* Scheduling Card */}
          <div className="bg-[#A9DFBF]/10 text-slate-800 rounded-[32px] p-8 shadow-md border border-[#A9DFBF]/30 flex flex-col gap-6 relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#A9DFBF]/20 blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <span className="text-emerald-700 font-extrabold text-[0.65rem] uppercase tracking-wider">
                Video / Chat Consult
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-slate-900 text-5xl font-black tracking-tight">₹{doctor.fee}</span>
                <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">/ Min</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed mt-2">
                Covers standard live chat/video sessions per minute.
              </p>
            </div>

            {/* Schedule Details */}
            <div className="relative z-10 flex flex-col gap-3.5 border-t border-b border-[#A9DFBF]/25 py-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600" /> Mon - Fri</span>
                <span className="font-extrabold text-slate-700">09:00 AM - 05:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600" /> Saturday</span>
                <span className="font-extrabold text-slate-700">10:00 AM - 02:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600" /> Sunday</span>
                <span className="font-extrabold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded text-xs">Emergency Only</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="relative z-10 flex flex-col gap-3">
              <button 
                onClick={() => setShowSchedulingModal(true)}
                className="w-full inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-6 rounded-2xl shadow-md transition-colors text-center text-sm gap-2"
              >
                <Calendar className="w-4.5 h-4.5 text-[#A9DFBF]" /> Book Consultation
              </button>
              <div className="flex items-center gap-2 justify-center text-slate-500 text-xs mt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Medical Panel Practitioner</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Scheduling Modal */}
      {showSchedulingModal && (
        <SchedulingModal 
          doctorId={doctor.id} 
          doctorName={doctor.name} 
          onClose={() => setShowSchedulingModal(false)} 
        />
      )}

    </div>
  );
}
