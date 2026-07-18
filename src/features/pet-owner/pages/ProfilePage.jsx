import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Award, Settings, Edit3, Save, X } from 'lucide-react';
import { useAuthStore } from '../../auth/store/authStore';
import { supabase } from '../../auth/api/supabase';
import toast from 'react-hot-toast';

export default function PetOwnerProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { name: name.trim() }
    });
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      window.location.reload();
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/pet-owner/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-100 to-indigo-50 z-0" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 mt-12">
            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-md relative">
              <div className="w-full h-full bg-slate-200 rounded-full overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${user?.user_metadata?.name || 'User'}&background=2563eb&color=fff&size=200`} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <button className="absolute bottom-1 right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white hover:bg-blue-700 transition-colors">
                <Edit3 size={14} />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-3xl font-black text-slate-900 border-b-2 border-blue-500 focus:outline-none bg-transparent w-full max-w-sm px-1 py-1"
                  placeholder="Your Name"
                />
              ) : (
                <h1 className="text-3xl font-black text-slate-900">{user?.user_metadata?.name || 'Pet Owner'}</h1>
              )}
              <p className="text-slate-500 font-medium">{user?.email}</p>
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => { setIsEditing(false); setName(user?.user_metadata?.name || ''); }}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={16} /> Account Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Full Name</p>
                  {isEditing ? (
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="font-semibold text-slate-800 border-b border-slate-300 focus:border-blue-500 focus:outline-none bg-transparent w-full pb-1"
                    />
                  ) : (
                    <p className="font-semibold text-slate-800">{user?.user_metadata?.name || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Email Address</p>
                  <p className="font-semibold text-slate-800">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Settings size={16} /> Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">Email Notifications</p>
                    <p className="text-xs text-slate-500">Receive updates about appointments</p>
                  </div>
                  <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1" />
                  </div>
                </div>
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
