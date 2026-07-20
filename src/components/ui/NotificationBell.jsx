import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCheck, MessageCircle, Wallet, Calendar, Activity, Info } from 'lucide-react';
import { supabase } from '../../features/auth/api/supabase';
import { useAuthStore } from '../../features/auth/store/authStore';

const notificationIcon = (type) => {
  switch (type) {
    case 'consultation': return <Activity size={16} className="text-blue-500" />;
    case 'wallet': return <Wallet size={16} className="text-emerald-500" />;
    case 'appointment': return <Calendar size={16} className="text-purple-500" />;
    case 'chat': return <MessageCircle size={16} className="text-indigo-500" />;
    default: return <Info size={16} className="text-slate-500" />;
  }
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function NotificationBell() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const audioRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAllRead = async () => {
    if (!user?.id) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const markRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) await markRead(notification.id);
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications();

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.new) {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
          // Play notification sound
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  return (
    <>
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EzJ2Wo3M2nYjYnWqDXyK5jNSdYodbJrWU1J1ii18muZTUoWKLWya1lNShXotfJrGU1KFei18msZTUoV6LXyaxlNShXodfJrGU1KFei18msZjQpV6LXyaxlNCdXo9fJrGY0KFei18mrZTUoV6PXyaxlNChXo9fJq2Y0KFej18mrZTUpV6PXyaxlNCdXo9fJq2Y1KFej18mrZTUpV6PXyatmNCdXo9bJq2U1KFej18mrZjUpWKPXyatmNChXo9bKq2U1KFek18qrZjUpWKTXyqtmNChYo9bKq2U1KFek2MqrZjUpWKTXyqtmNilYpNfKq2Y1KFil2MqrZzQpWKTXyqxnNilYpNfKrGc0KVil2MqsZzQpWKTXyqtnNilYpNjKrGc0KVil2MqsZzQpWKTYyqtnNilYpNjKrGg0KVml2MqtaDQpWaTYyqtnNilZpNjKrGg1KVml2MqtaDQpWaTZyqxoNilZpNjKrWg1KVml2MuuaTQpWaTZyqxoNilZpNjLrWg1KVml2Muuai0pWKTZyqxoNilZo9jLrWk1KVml2Muuai0pWKTZy61oNilZo9jLrWk1KVml2Muuai0pWKTZy61oNipZo9nLrWk1KVmmzMuuai0pWaTZy61oNipZo9nLrWk2KVmmzMuuai0pWaTZy61pNipZo9nLrmk2KVmmzMuuai4pWaTZy65pNipZo9nLrmk3KVmmzMuuai4pWaTZy65pNipZo9nLrmk3KVmmzMuuay0pWaTZy65pNipZo9nLrmk3KVmmzMuuay0pWaTZy65pNipZo9nLrmk3KVmmzMuuay4pWaTay65pNipZo9nLrmk3KVmmzMuuay4pWaTay65pNipZo9nLrmk3KVmmzMuuay4pWaTay65pNipZo9nLrmo3KVmmzMuuay4pWaTay65pNitZo9nLrmo3KVmmzMuuay4pWaTay65qNitZo9nLrmo3KVmmzMuubC4pWaTay65qNitZo9nLrmo3KVmmzMuubC4pWaTay65qNitZo9nLrmo4KVmmzMuubC4pWaTay65qNitZo9nLrmo4KVmmzMuubC4pWaTay65qNitZo9nLrmo4KVmmzMuubC4pWaTay65qNitZo9nLrmo4KVmmzMuubC4pWaTay65qNitZo9nLrmo4KVmmzMuubC0pWaTay65rNitZo9nLrmo4KVmmzMuubC0pWaTay65rNitZo9nLrmo4KVmmzMuubC0pWaTay65rNitZo9nLrmo4KVmmzMuubC0pWaTay65rNitZo9nLrmo4KVmmzMuubC0pWaTay65rNitZo9nLrmo4KVmmzMuubC0pWaTay65rNitZo9nLrmo4KVmmzMuubC0pWaTay65rNitZo9nLrmo4KVmmzMuubC0pWaTay65rNitZo9nLrmo4KVmmzMuubC0pWaTay65rNitZo9nLrmo4KVmmzMuubC0pWaTay65rNitZo9nLrmo4KVmmzMuubC0pWaTay65rNitZo9nLrmo4KVmmzMuubC0pWaTay65rNitZo9nLrmo4KVmmzMuubC0pWaTay65rNitZo9nLrmo4KVmmzMuubC0pWaTay65rNitZo9nLrmo4A=" type="audio/wav" />
      </audio>

      <div className="relative" ref={dropdownRef}>
        {/* Bell Button */}
        <button
          onClick={() => {
            setOpen(prev => !prev);
            if (!open && unreadCount > 0) markAllRead();
          }}
          className="relative w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow-md">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[200] overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-slate-700" />
                <span className="font-bold text-slate-900 text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-semibold">No notifications yet</p>
                  <p className="text-xs mt-1">We'll notify you about consultations, payments, and more.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-slate-50 ${!n.is_read ? 'bg-blue-50/60' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${!n.is_read ? 'bg-blue-100' : 'bg-slate-100'}`}>
                      {notificationIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
