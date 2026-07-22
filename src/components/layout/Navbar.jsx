import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PawPrint, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useModal } from '../../context/ModalContext';
import { Bell } from 'lucide-react';
import { supabase } from '../../features/auth/api/supabase';

const NAV_LINKS = [
  { label: 'Home', href: '/', bgActive: 'bg-rose-100 text-rose-700 border-rose-200/50 shadow-sm rotate-[-1.5deg]', hoverStyle: 'hover:bg-rose-50 hover:text-rose-600' },
  { label: 'Doctors', href: '/doctors', bgActive: 'bg-sky-100 text-sky-700 border-sky-200/50 shadow-sm rotate-[1deg]', hoverStyle: 'hover:bg-sky-50 hover:text-sky-600' },
  { label: 'Services', href: '/services', bgActive: 'bg-yellow-100 text-yellow-800 border-yellow-250/50 shadow-sm rotate-[-1.2deg]', hoverStyle: 'hover:bg-yellow-50 hover:text-yellow-700' },
  { label: 'Success Stories', href: '/success-stories', bgActive: 'bg-purple-100 text-purple-700 border-purple-200/50 shadow-sm rotate-[1.5deg]', hoverStyle: 'hover:bg-purple-50 hover:text-purple-600' },
  { label: 'Why Choose Us?', href: '/why-choose-us', bgActive: 'bg-emerald-100 text-emerald-700 border-emerald-250/50 shadow-sm rotate-[-1deg]', hoverStyle: 'hover:bg-emerald-50 hover:text-emerald-600' }
];


export default function Navbar() {
  const location = useLocation();
  const { user, role, isLoading, logout } = useAuthStore();
  const { openContact } = useModal();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, payload => {
        setNotifications(prev => [payload.new, ...prev].slice(0, 10));
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async () => {
    if (unreadCount === 0 || !user) return;
    
    setUnreadCount(0);
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    
    if (unreadIds.length > 0) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  useEffect(() => {
    // Only keeping the PWA prompt, removed the heavy SVG animations to fix lag
  }, []);

  return (
    <div className="fixed top-4 sm:top-6 inset-x-0 z-50 px-4 sm:px-6 pointer-events-none flex justify-center w-full max-w-[100vw]">
      <header 
        className="w-full max-w-[1200px] bg-white/95 border border-slate-200/60 rounded-full px-4 sm:px-6 py-2 sm:py-2.5 shadow-md flex items-center justify-between pointer-events-auto backdrop-blur-md relative overflow-hidden"
      >

        {/* Brand Logo with Paw circle */}
        <Link 
          to="/" 
          className="text-slate-900 font-extrabold text-lg md:text-xl tracking-tight flex items-center gap-3 sm:gap-4 cursor-pointer relative z-10"
          aria-label="Joeyverse"
        >
          <img src="/images/logo_icon.png" alt="Joeyverse Icon" className="h-10 md:h-12 w-auto object-contain" />
          <img src="/images/logo_text.png" alt="Joeyverse Text" className="h-5 md:h-6 w-auto object-contain -translate-y-0.5 ml-1" />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-3 relative z-10">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.label}
                to={link.href}
                className={`px-3 py-1.5 rounded-full border border-transparent text-xs font-black tracking-tight transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? `${link.bgActive} border-slate-200` 
                    : `text-slate-650 ${link.hoverStyle} hover:scale-105 active:scale-95`
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={() => openContact('general')}
            className={`px-3 py-1.5 rounded-full border border-transparent text-xs font-black tracking-tight transition-all duration-300 cursor-pointer text-slate-650 hover:bg-slate-50 hover:text-slate-700 hover:scale-105 active:scale-95`}
          >
            Contact
          </button>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-2 sm:gap-4 relative z-10">
          {!isLoading && (
            user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 text-xs uppercase tracking-wider font-bold text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                >
                  Sign Out
                </button>
                <Link
                  to={role === 'admin' ? '/admin/dashboard' : role === 'doctor' ? '/doctor/dashboard' : '/pet-owner/dashboard'}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#f2687c] to-amber-500 hover:from-amber-500 hover:to-[#f2687c] text-white text-xs uppercase tracking-wider rounded-full font-black shadow-md hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 cursor-pointer border border-white/50"
                >
                  Dashboard
                </Link>
                
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications) markAsRead();
                    }}
                    className="p-2 rounded-full hover:bg-slate-100 transition-colors relative"
                  >
                    <Bell size={20} className="text-slate-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                      <div className="p-3 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-slate-500 text-sm">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map(notif => (
                            <div key={notif.id} className={`p-3 border-b border-slate-50 text-sm ${!notif.is_read ? 'bg-indigo-50/30' : ''}`}>
                              <p className="text-slate-700">{notif.message}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(notif.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/sign-in"
                className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-[#f2687c] to-amber-500 hover:from-amber-500 hover:to-[#f2687c] text-white text-xs uppercase tracking-wider rounded-full font-black shadow-md hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 cursor-pointer border border-white/50"
              >
                Sign In
              </Link>
            )
          )}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="hidden md:flex px-4 py-2 text-xs uppercase tracking-wider font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full transition-all border border-indigo-200"
            >
              Install App
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button 
            className="md:hidden p-2 rounded-full bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="absolute top-[110%] left-4 right-4 bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-xl rounded-3xl p-6 flex flex-col gap-4 z-50 animate-in slide-in-from-top-4 fade-in duration-200 pointer-events-auto md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-2xl text-sm font-black tracking-tight transition-all duration-300 ${
                    isActive 
                      ? `${link.bgActive} border-slate-200` 
                      : `text-slate-650 bg-slate-50 border border-transparent hover:bg-slate-100`
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={() => { openContact('general'); setIsMobileMenuOpen(false); }}
              className={`px-4 py-3 rounded-2xl text-sm font-black tracking-tight transition-all duration-300 text-slate-650 bg-slate-50 border border-transparent hover:bg-slate-100 text-left`}
            >
              Contact
            </button>
          </nav>
          
          <div className="h-px bg-slate-200 my-2" />
          
          <div className="flex flex-col gap-3">
            {!isLoading && (
              user ? (
                <>
                  <Link
                    to={role === 'admin' ? '/admin/dashboard' : role === 'doctor' ? '/doctor/dashboard' : '/pet-owner/dashboard'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center px-5 py-3.5 bg-gradient-to-r from-[#f2687c] to-amber-500 text-white text-sm uppercase tracking-wider rounded-2xl font-black shadow-md border border-white/50"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="w-full text-center px-5 py-3.5 bg-slate-100 text-slate-600 text-sm uppercase tracking-wider rounded-2xl font-black"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/sign-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center px-5 py-3.5 bg-gradient-to-r from-[#f2687c] to-amber-500 text-white text-sm uppercase tracking-wider rounded-2xl font-black shadow-md border border-white/50"
                >
                  Sign In
                </Link>
              )
            )}
            {isInstallable && (
              <button
                onClick={() => { handleInstallClick(); setIsMobileMenuOpen(false); }}
                className="w-full text-center px-4 py-3.5 text-sm uppercase tracking-wider font-black bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-200"
              >
                Install App
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
