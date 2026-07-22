import { create } from 'zustand';
import { supabase } from '../api/supabase';
import emailjs from '@emailjs/browser';

export const useAuthStore = create((set) => ({
  user: null,
  role: null, // 'petOwner' or 'doctor'
  isLoading: true,
  error: null,

  // Helper to send tracking data to SheetDB
  trackActivity: async (userType, email, role, name = 'Unknown') => {
    const sheetdbUrl = import.meta.env.VITE_SHEETDB_URL;
    if (!sheetdbUrl) return; // Skip if no webhook URL is configured
    try {
      await fetch(sheetdbUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          data: {
            Timestamp: new Date().toLocaleString(),
            UserType: userType,
            Email: email,
            Role: role,
            Name: name
          }
        })
      });
    } catch (e) {
      console.error('Failed to send tracking data to SheetDB:', e);
    }
  },

  // Initialize session and listen for auth changes
  initAuth: () => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Supabase getSession error:", error);
        set({ user: null, role: null, isLoading: false, error: error.message });
        return;
      }
      if (session?.user) {
        set({ user: session.user, role: session.user.user_metadata?.role || null, isLoading: false });
      } else {
        set({ user: null, role: null, isLoading: false });
      }
    }).catch(err => {
      console.error("Supabase network error:", err);
      set({ user: null, role: null, isLoading: false, error: err.message });
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ user: session.user, role: session.user.user_metadata?.role || null, isLoading: false });
      } else {
        set({ user: null, role: null, isLoading: false });
      }
    });
  },

  // Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error };
      }
      const role = data.user.user_metadata?.role;
      
      if (role === 'doctor') {
        await supabase.from('doctor_profiles').update({ status: 'ONLINE' }).eq('id', data.user.id);
      }

      set({ user: data.user, role, isLoading: false });
      
      // Track login
      useAuthStore.getState().trackActivity(
        'Existing User', 
        email, 
        role, 
        data.user.user_metadata?.name
      );
      
      return { success: true, role };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err };
    }
  },

  // Signup
  signup: async (email, password, role, additionalData = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, ...additionalData },
        },
      });
      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error };
      }
      // Only set user if session exists (email confirm might be on)
      if (data.session) {
        set({ user: data.user, role, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      
      // Track signup in Google Sheets
      useAuthStore.getState().trackActivity(
        'New User', 
        email, 
        role, 
        additionalData.name
      );
      
        // Send Welcome Email
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        // Check for dedicated role-specific templates first, fallback to generic
        let templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID; // generic fallback
        if (role === 'doctor' && import.meta.env.VITE_EMAILJS_DOCTOR_WELCOME_TEMPLATE_ID) {
          templateId = import.meta.env.VITE_EMAILJS_DOCTOR_WELCOME_TEMPLATE_ID;
        } else if (role === 'petOwner' && import.meta.env.VITE_EMAILJS_PETOWNER_WELCOME_TEMPLATE_ID) {
          templateId = import.meta.env.VITE_EMAILJS_PETOWNER_WELCOME_TEMPLATE_ID;
        }
        
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
        
        if (serviceId && templateId && publicKey) {
          try {
            console.log("Attempting to send EmailJS welcome email to:", email, "Role:", role);
            await emailjs.send(serviceId, templateId, {
              email: email,
              name: additionalData.name || 'User',
              role: role, // can still be used as a variable
              subject: role === 'doctor' 
                ? 'Welcome to Joeyverse! Your Doctor Account Has Been Created' 
                : 'Welcome to Joeyverse! Your Pet Owner Account is Ready',
              title: `Welcome to Joeyverse!`
            }, publicKey);
            console.log("EmailJS welcome email sent successfully!");
            } catch (e) {
              console.error("Failed to send welcome email via EmailJS", e);
              import('react-hot-toast').then(({ toast }) => {
                toast.error("EmailJS Error: " + (e.text || e.message || JSON.stringify(e)), { duration: 6000 });
              });
            }
          } else {
            console.warn("EmailJS configuration missing. Please check your Vercel Environment Variables.", {serviceId, templateId, publicKey: !!publicKey});
            import('react-hot-toast').then(({ toast }) => {
              toast.error("Configuration Error: Missing EmailJS keys in environment variables.", { duration: 6000 });
            });
          }
        
        return { success: true, role, session: data.session };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err };
    }
  },

  // Logout
  logout: async () => {
    const state = useAuthStore.getState();
    if (state.role === 'doctor' && state.user?.id) {
      await supabase.from('doctor_profiles').update({ status: 'OFFLINE' }).eq('id', state.user.id);
    }
    await supabase.auth.signOut();
    set({ user: null, role: null });
  },
  // Send Password Reset Email
  sendPasswordResetEmail: async (email) => {
    set({ isLoading: true, error: null });
    try {
      // Artificial delay so the user can see the loading animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Update Password (used on the Reset Password page)
  updatePassword: async (newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      set({ isLoading: false, user: data.user });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

}));


