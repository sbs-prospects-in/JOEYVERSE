import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Edit3, Save, X, PawPrint, Phone } from 'lucide-react';
import { useAuthStore } from '../../auth/store/authStore';
import { supabase } from '../../auth/api/supabase';
import toast, { Toaster } from 'react-hot-toast';
import CountryPhoneInput from '../../../components/ui/CountryPhoneInput';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra',
  'Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'
];

export default function PetOwnerProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({});
  const [petCount, setPetCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    const loadProfile = async () => {
      const { data } = await supabase.from('owner_profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data);
        setEditData({
          name: data.name || user?.user_metadata?.name || '',
          phone: data.phone || '',
          city: data.city || '',
          state: data.state || '',
        });
      } else {
        setEditData({
          name: user?.user_metadata?.name || '',
          phone: '',
          city: '',
          state: '',
        });
      }
      const { count } = await supabase.from('pets').select('id', { count: 'exact', head: true }).eq('owner_id', user.id);
      setPetCount(count || 0);
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
      await supabase.auth.updateUser({ data: { name: editData.name.trim() } });
      const { error } = await supabase.from('owner_profiles').update({
        name: editData.name.trim(),
        phone: editData.phone || null,
        city: editData.city || null,
        state: editData.state || null,
      }).eq('id', user.id);

      if (error) throw error;
      toast.success("Profile updated! ✅");
      setProfile(prev => ({ ...prev, ...editData }));
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || "Failed to save");
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

  const displayName = profile?.name || user?.user_metadata?.name || 'Pet Owner';
  const shortUserId = profile?.short_id ? `USR-${String(profile.short_id).padStart(2, '0')}` : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-8 px-4">
      
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/pet-owner/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-100 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-100 to-indigo-50 z-0" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 mt-12">
            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-md">
              <div className="w-full h-full bg-blue-100 rounded-full overflow-hidden flex items-center justify-center text-blue-700 text-4xl font-black">
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
                  onChange={(e) => setEditData(p => ({...p, name: e.target.value}))}
                  className="text-3xl font-black text-slate-900 border-b-2 border-blue-500 focus:outline-none bg-transparent w-full max-w-sm px-1 py-1"
                  placeholder="Your Name"
                />
              ) : (
                <h1 className="text-3xl font-black text-slate-900">{displayName}</h1>
              )}
              <p className="text-slate-500 font-medium mt-1">{user?.email}</p>
              {shortUserId && (
                <span className="inline-block mt-2 bg-blue-50 text-blue-700 text-[11px] font-black px-3 py-1 rounded-full border border-blue-200">
                  {shortUserId}
                </span>
              )}
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm flex items-center gap-2"
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm flex items-center gap-2"
                >
                  <Edit3 size={16} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 rounded-2xl p-5 text-center border border-blue-100">
              <div className="text-3xl font-black text-blue-700">{petCount}</div>
              <div className="text-xs font-bold text-blue-600 mt-1 uppercase tracking-wider">Companions</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-5 text-center border border-purple-100">
              <div className="text-3xl font-black text-purple-700">🐾</div>
              <div className="text-xs font-bold text-purple-600 mt-1 uppercase tracking-wider">Pet Owner</div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={16} /> Account Details
              </h3>
              <div className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block font-semibold">Full Name</label>
                      <input
                        value={editData.name}
                        onChange={e => setEditData(p => ({...p, name: e.target.value.replace(/[^a-zA-Z\s]/g, '')}))}
                        className="font-semibold text-slate-800 border-b border-slate-300 focus:border-blue-500 focus:outline-none bg-transparent w-full pb-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block font-semibold">Phone</label>
                      <CountryPhoneInput
                        defaultValue={editData.phone}
                        onChange={(val) => setEditData(p => ({...p, phone: val}))}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Full Name</p>
                      <p className="font-semibold text-slate-800">{displayName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Email</p>
                      <p className="font-semibold text-slate-800">{user?.email}</p>
                    </div>
                    {profile?.phone && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Phone</p>
                        <p className="font-semibold text-slate-800 flex items-center gap-1">
                          <Phone size={13} className="text-slate-400" /> {profile.phone}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin size={16} /> Location
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
                        className="font-semibold text-slate-800 border-b border-slate-300 focus:border-blue-500 focus:outline-none bg-transparent w-full pb-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block font-semibold">State</label>
                      <select
                        value={editData.state}
                        onChange={e => setEditData(p => ({...p, state: e.target.value}))}
                        className="font-semibold text-slate-800 border-b border-slate-300 focus:border-blue-500 focus:outline-none bg-transparent w-full pb-1 text-sm"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Location</p>
                    {(profile?.city || profile?.state) ? (
                      <p className="font-semibold text-slate-800 flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        {[profile.city, profile.state].filter(Boolean).join(', ')}
                      </p>
                    ) : (
                      <p className="font-semibold text-slate-400 text-sm italic">Not set — click Edit to add</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <button 
            onClick={handleDeleteProfile}
            className="w-full py-4 mb-3 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Delete Account Forever
          </button>
        )}

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
