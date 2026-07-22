import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Settings, Edit3, Award, Save, X, MapPin, Globe, Briefcase, GraduationCap, Phone } from 'lucide-react';
import { useAuthStore } from '../../auth/store/authStore';
import { supabase } from '../../auth/api/supabase';
import toast, { Toaster } from 'react-hot-toast';
import CountryPhoneInput from '../../../components/ui/CountryPhoneInput';

const LANGUAGES = ['English', 'Hindi', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati', 'Kannada', 'Odia', 'Punjabi'];
const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'
];

export default function DoctorProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({});
  const [stats, setStats] = useState({ consultations: 0, rating: 0 });

  useEffect(() => {
    if (!user?.id) return;
    const loadProfile = async () => {
      const { data } = await supabase.from('doctor_profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data);
        setEditData({
          name: data.name || user?.user_metadata?.name || '',
          phone: data.phone || '',
          city: data.city || '',
          state: data.state || '',
          experience: data.experience || '',
          qualification: data.qualification || '',
          about: data.about || '',
          languages: Array.isArray(data.languages) ? data.languages : ['English'],
        });
      }
      // Fetch stats
      const { data: consultData } = await supabase
        .from('consultations')
        .select('id, rating')
        .eq('doctor_id', user.id)
        .eq('status', 'COMPLETED');
      if (consultData) {
        const ratings = consultData.filter(c => c.rating).map(c => c.rating);
        const avg = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
        setStats({ consultations: consultData.length, rating: avg });
      }
    };
    loadProfile();
  }, [user?.id]);

  const handleSave = async () => {
    if (!editData.name?.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setIsSaving(true);
    try {
      // Update auth user metadata
      await supabase.auth.updateUser({ data: { name: editData.name.trim() } });
      
      // Update doctor_profiles
      const { error } = await supabase.from('doctor_profiles').update({
        name: editData.name.trim(),
        phone: editData.phone || null,
        city: editData.city || null,
        state: editData.state || null,
        experience: editData.experience || null,
        qualification: editData.qualification || null,
        about: editData.about || null,
        languages: editData.languages || ['English'],
      }).eq('id', user.id);

      if (error) throw error;
      
      toast.success("Profile updated! ✅");
      setProfile(prev => ({ ...prev, ...editData }));
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (window.confirm("Are you absolutely sure you want to delete your profile? This action cannot be undone.")) {
      try {
        const { error } = await supabase.rpc('delete_user');
        if (error) throw error;
        await supabase.auth.signOut();
        window.location.href = '/';
      } catch (err) {
        toast.error("Could not delete profile. Please ensure the RPC function is installed.");
      }
    }
  };

  const toggleLanguage = (lang) => {
    setEditData(prev => {
      const langs = prev.languages || [];
      if (langs.includes(lang)) {
        return { ...prev, languages: langs.filter(l => l !== lang) };
      } else {
        return { ...prev, languages: [...langs, lang] };
      }
    });
  };

  const displayName = profile?.name || user?.user_metadata?.name || 'Doctor';
  const shortDoctorId = profile?.short_id ? `DOC-${String(profile.short_id).padStart(2, '0')}` : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-8 px-4">
      
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/doctor/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        {/* Profile Header Card */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-100 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-emerald-100 to-teal-50 z-0" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 mt-12">
            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-md relative">
              <div className="w-full h-full bg-emerald-100 rounded-full overflow-hidden flex items-center justify-center text-emerald-700 text-4xl font-black">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{displayName[0]?.toUpperCase()}</span>
                )}
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <input 
                  type="text" 
                  value={editData.name}
                  onChange={(e) => setEditData(p => ({...p, name: e.target.value.replace(/[^a-zA-Z\s]/g, '')}))}
                  className="text-3xl font-black text-slate-900 border-b-2 border-emerald-500 focus:outline-none bg-transparent w-full max-w-sm px-1 py-1"
                  placeholder="Your Name"
                />
              ) : (
                <h1 className="text-3xl font-black text-slate-900">{displayName}</h1>
              )}
              <p className="text-slate-500 font-medium mt-1">{user?.email}</p>
              {shortDoctorId && (
                <span className="inline-block mt-2 bg-emerald-50 text-emerald-700 text-[11px] font-black px-3 py-1 rounded-full border border-emerald-200">
                  {shortDoctorId}
                </span>
              )}
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm flex items-center gap-2"
                >
                  <Edit3 size={16} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-emerald-50 rounded-2xl p-5 text-center border border-emerald-100">
              <div className="text-3xl font-black text-emerald-700">{stats.consultations}</div>
              <div className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-wider">Consultations</div>
            </div>
            <div className="bg-amber-50 rounded-2xl p-5 text-center border border-amber-100">
              <div className="text-3xl font-black text-amber-700">{stats.rating > 0 ? stats.rating : '—'}</div>
              <div className="text-xs font-bold text-amber-600 mt-1 uppercase tracking-wider">Avg Rating</div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Professional Details */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={16} /> Professional Details
              </h3>
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block font-semibold">Phone</label>
                      <CountryPhoneInput
                        defaultValue={editData.phone}
                        onChange={(val) => setEditData(p => ({...p, phone: val}))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block font-semibold">Qualification</label>
                      <input
                        value={editData.qualification}
                        onChange={e => setEditData(p => ({...p, qualification: e.target.value}))}
                        placeholder="BVSc & AH, MVSc"
                        className="font-semibold text-slate-800 border-b border-slate-300 focus:border-emerald-500 focus:outline-none bg-transparent w-full pb-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block font-semibold">Experience (Years)</label>
                      <input
                        type="number"
                        min="0"
                        max="70"
                        value={editData.experience?.toString().replace(/[^0-9]/g, '') || ''}
                        onChange={e => setEditData(p => ({...p, experience: e.target.value}))}
                        placeholder="e.g. 5"
                        className="font-semibold text-slate-800 border-b border-slate-300 focus:border-emerald-500 focus:outline-none bg-transparent w-full pb-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block font-semibold">About / Bio</label>
                      <textarea
                        value={editData.about}
                        onChange={e => setEditData(p => ({...p, about: e.target.value}))}
                        placeholder="Write a short bio..."
                        rows={3}
                        className="font-semibold text-slate-800 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-transparent w-full p-2 text-sm resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Email</p>
                      <p className="font-semibold text-slate-800 text-sm">{user?.email}</p>
                    </div>
                    {profile?.phone && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Phone</p>
                        <p className="font-semibold text-slate-800 text-sm">{profile.phone}</p>
                      </div>
                    )}
                    {profile?.qualification && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Qualification</p>
                        <p className="font-semibold text-slate-800 text-sm">{profile.qualification}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Experience</p>
                      <p className="font-semibold text-slate-800 text-sm">{profile?.experience || '0'} Years</p>
                    </div>
                    {profile?.about && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Bio</p>
                        <p className="font-semibold text-slate-800 text-sm">{profile.about}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Location & Languages */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin size={16} /> Location & Languages
              </h3>
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block font-semibold">City</label>
                      <input
                        value={editData.city}
                        onChange={e => setEditData(p => ({...p, city: e.target.value.replace(/[^a-zA-Z\s]/g, '')}))}
                        placeholder="Mumbai"
                        className="font-semibold text-slate-800 border-b border-slate-300 focus:border-emerald-500 focus:outline-none bg-transparent w-full pb-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block font-semibold">State</label>
                      <select
                        value={editData.state}
                        onChange={e => setEditData(p => ({...p, state: e.target.value}))}
                        className="font-semibold text-slate-800 border-b border-slate-300 focus:border-emerald-500 focus:outline-none bg-transparent w-full pb-1 text-sm"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block font-semibold">Languages</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {LANGUAGES.map(lang => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => toggleLanguage(lang)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                              (editData.languages || []).includes(lang)
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {(profile?.city || profile?.state) && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Location</p>
                        <p className="font-semibold text-slate-800 text-sm flex items-center gap-1">
                          <MapPin size={13} className="text-slate-400" />
                          {[profile.city, profile.state].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {(profile?.languages?.length > 0 ? profile.languages : ['English']).map(lang => (
                          <span key={lang} className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={async () => {
            await logout();
            navigate('/');
          }}
          className="w-full py-4 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Sign Out Completely
        </button>
      </div>
    </div>
  );
}
