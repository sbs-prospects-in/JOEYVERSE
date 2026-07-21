import React, { useState, useEffect } from 'react';
import { supabase } from '../../auth/api/supabase';
import { useAuthStore } from '../../auth/store/authStore';
import { Calendar as CalendarIcon, Clock, X, ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SchedulingModal({ doctorId, doctorName, onClose }) {
  const { user } = useAuthStore();
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPets, setLoadingPets] = useState(true);

  useEffect(() => {
    async function fetchPets() {
      if (!user) return;
      const { data, error } = await supabase.from('pets').select('id, name').eq('owner_id', user.id);
      if (!error && data) {
        setPets(data);
        if (data.length > 0) setSelectedPet(data[0].id);
      }
      setLoadingPets(false);
    }
    fetchPets();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPet || !date || !time) {
      toast.error('Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledTime = new Date(`${date}T${time}`).toISOString();
      // Get the doctor's per_minute_rate
      const { data: docData } = await supabase.from('doctor_profiles').select('per_minute_rate').eq('id', doctorId).single();
      const per_minute_rate = docData?.per_minute_rate || 50;

      const { error } = await supabase.from('consultations').insert({
        owner_id: user.id,
        doctor_id: doctorId,
        pet_id: selectedPet,
        consultation_type: 'scheduled',
        scheduled_at: scheduledTime,
        status: 'PENDING',
        per_minute_rate
      });

      if (error) throw error;
      toast.success('Appointment requested successfully!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to request appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get today's date in YYYY-MM-DD for the min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full animate-in zoom-in-95 duration-200 relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 rounded-full p-1"
        >
          <X size={20} />
        </button>
        
        <div className="mb-6">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-500">
            <CalendarIcon size={24} className="fill-current opacity-20 absolute" />
            <CalendarIcon size={24} className="relative" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Schedule Appointment</h2>
          <p className="text-slate-500 text-sm mt-1">Request a consultation with {doctorName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Pet Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Select Pet</label>
            {loadingPets ? (
              <div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
            ) : pets.length > 0 ? (
              <select 
                value={selectedPet}
                onChange={(e) => setSelectedPet(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none"
              >
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>{pet.name}</option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-rose-500 font-semibold bg-rose-50 p-3 rounded-xl border border-rose-100">
                You need to add a pet first.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Time</label>
              <div className="relative">
                <input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !selectedPet}
            className="w-full mt-6 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Request Appointment'}
            {!isSubmitting && <ChevronRight size={18} />}
          </button>
        </form>

      </div>
    </div>
  );
}
