import React, { useEffect, useState } from 'react';
import { supabase } from '../../auth/api/supabase';
import { Link } from 'react-router-dom';

export default function DoctorDirectoryPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctors() {
      // We join doctor_profiles with doctor_availability
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select(`
          id,
          name,
          specialization,
          rating,
          doctor_availability (
            current_status
          )
        `);
      
      if (!error && data) {
        setDoctors(data);
      } else {
        console.error("Failed to fetch doctors:", error);
      }
      setLoading(false);
    }
    fetchDoctors();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available Now': return 'bg-green-500';
      case 'Accepting Requests': return 'bg-yellow-500';
      case 'In Consultation': return 'bg-blue-500';
      default: return 'bg-red-500'; // Offline
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8 flex justify-between items-end">
          <div>
            <Link to="/pet-owner/dashboard" className="text-[#bd905b] text-sm font-medium hover:underline mb-2 inline-block">&larr; Back to Dashboard</Link>
            <h1 className="text-4xl font-light">Find a <span className="font-semibold">Doctor</span></h1>
            <p className="text-[#888] mt-2">Connect with verified veterinary professionals in real-time.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bd905b]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doc => {
              const availability = Array.isArray(doc.doctor_availability) ? doc.doctor_availability[0] : doc.doctor_availability;
              const status = availability?.current_status || 'Offline';
              return (
                <div key={doc.id} className="bg-[#111] border border-[#222] rounded-2xl p-6 hover:border-[#bd905b]/50 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{doc.name}</h3>
                      <p className="text-[#bd905b] text-sm">{doc.specialization || 'General Vet'}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded text-sm font-bold">
                      ⭐ {doc.rating}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(status)} animate-pulse`}></span>
                    <span className="text-sm text-[#888]">{status}</span>
                  </div>

                  <Link 
                    to={`/pet-owner/book/${doc.id}`}
                    className="w-full block text-center bg-white/5 border border-white/10 hover:bg-[#bd905b] hover:text-black font-semibold py-3 rounded-xl transition-all"
                  >
                    Request Appointment
                  </Link>
                </div>
              );
            })}
            
            {doctors.length === 0 && (
              <div className="col-span-full text-center py-20 text-[#666]">
                No doctors are currently registered on the platform.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
