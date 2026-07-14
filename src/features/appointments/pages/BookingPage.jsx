import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../features/auth/api/supabase';
import { useAuthStore } from '../../../features/auth/store/authStore';
import toast, { Toaster } from 'react-hot-toast';

export default function BookingPage() {
  const { id: doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [doctor, setDoctor] = useState(null);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // Fetch Doctor Details
      const { data: docData, error: docError } = await supabase
        .from('doctor_profiles')
        .select(`*, doctor_availability(current_status, slot_duration_minutes)`)
        .eq('id', doctorId)
        .single();
      
      if (docData) setDoctor(docData);
      else console.error(docError);

      // Fetch Owner's Pets
      if (user?.id) {
        const { data: petData, error: petError } = await supabase
          .from('pets')
          .select('*')
          .eq('owner_id', user.id);
        
        if (petData) setPets(petData);
        else console.error(petError);
      }
      setLoading(false);
    }
    fetchData();
  }, [doctorId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPet) {
      toast.error("Please select a pet");
      return;
    }

    setSubmitting(true);
    
    // For Instant Consultation, scheduled_at is NOW
    const scheduledAt = new Date().toISOString();

    const { error } = await supabase
      .from('appointments')
      .insert([
        {
          doctor_id: doctorId,
          owner_id: user.id,
          pet_id: selectedPet,
          scheduled_at: scheduledAt,
          status: 'PENDING'
        }
      ]);

    setSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Appointment request sent to the doctor!");
      setTimeout(() => {
        navigate('/pet-owner/dashboard');
      }, 2000);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f2687c]"></div></div>;
  if (!doctor) return <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-8">Doctor not found</div>;

  const status = doctor.doctor_availability?.[0]?.current_status || 'Offline';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      <Toaster position="top-center" toastOptions={{ style: { background: '#fff', color: '#333' } }} />
      
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
        <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-[#f2687c]/5 blur-[80px] rounded-full pointer-events-none"></div>
        
        <Link to="/pet-owner/doctors" className="text-slate-500 hover:text-slate-900 text-sm mb-6 inline-block transition-colors">&larr; Back to Directory</Link>
        
        <div className="mb-8 border-b border-slate-200 pb-8">
          <h1 className="text-3xl font-light mb-2">Book Consultation</h1>
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-[#f2687c]">{doctor.name}</h2>
            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">{doctor.specialization || 'General Vet'}</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            Status: <span className="text-slate-900 font-medium">{status}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          <div>
            <label className="block text-sm text-slate-500 mb-2">Select your Pet</label>
            {pets.length > 0 ? (
              <select 
                value={selectedPet}
                onChange={(e) => setSelectedPet(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#f2687c] focus:ring-1 focus:ring-[#f2687c] transition-all shadow-sm"
                required
              >
                <option value="" disabled>-- Choose a pet --</option>
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                ))}
              </select>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-center">
                <p className="text-slate-500 text-sm mb-2">You haven't added any pets yet.</p>
                <button type="button" className="text-[#f2687c] text-sm hover:underline">Add a Pet in Dashboard</button>
              </div>
            )}
          </div>

          <div className="bg-[#f2687c]/5 border border-[#f2687c]/20 rounded-xl p-4 mt-6">
            <p className="text-[#f2687c] text-sm flex gap-2 items-start">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>No payment is required yet.</strong> Your request will be sent to the doctor for review. 
                If accepted, you will receive a secure payment link to confirm the consultation.
              </span>
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || pets.length === 0}
            className="w-full bg-[#f2687c] text-white font-bold py-4 rounded-xl hover:bg-[#d45668] transition-all duration-300 disabled:opacity-50 mt-4 flex justify-center items-center gap-2 text-lg shadow-sm hover:shadow-md"
          >
            {submitting ? 'Sending Request...' : 'Request Instant Consult'}
          </button>
        </form>

      </div>
    </div>
  );
}
