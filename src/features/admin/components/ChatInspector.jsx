import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../auth/api/supabase';
import { X, Mic, Volume2 } from 'lucide-react';

export default function ChatInspector({ consultation, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time messages for THIS consultation only
    const subscription = supabase
      .channel(`admin:messages:consultation_id=eq.${consultation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `consultation_id=eq.${consultation.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [consultation.id]);

  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('consultation_id', consultation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col h-[80vh] border border-slate-200 overflow-hidden relative">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="font-black text-slate-900 text-lg">Chat Inspector</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              Session ID: {consultation.id.substring(0,8)} • Status: 
              <span className={`ml-1 ${consultation.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-500'}`}>
                {consultation.status}
              </span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Mic size={48} className="mb-4 opacity-20" />
              <p className="font-medium">No messages in this consultation yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => {
                const isDoctor = msg.sender_id === consultation.doctor_id;
                
                return (
                  <div key={msg.id} className={`flex flex-col ${isDoctor ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
                      {isDoctor ? 'Doctor' : 'Pet Owner'} • {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    
                    <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                      isDoctor 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-sm'
                    }`}>
                      {msg.message_type === 'voice' || msg.message_type === 'audio' ? (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <Volume2 size={16} className={isDoctor ? 'text-indigo-200' : 'text-slate-400'} />
                            <span className="text-xs font-bold">Voice Note</span>
                          </div>
                          <audio controls src={msg.message_text.split('|')[0]} className="h-8 w-full max-w-[250px] outline-none" />
                        </div>
                      ) : msg.message_type === 'image' || (msg.file_url && msg.file_url.match(/\.(jpeg|jpg|gif|png)$/i)) ? (
                        <img 
                          src={msg.file_url} 
                          alt="Attachment" 
                          className="max-w-[200px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity shadow-sm" 
                          onClick={() => setSelectedMedia({ type: 'image', url: msg.file_url })} 
                        />
                      ) : msg.message_type === 'video' || (msg.file_url && msg.file_url.match(/\.(mp4|webm|ogg)$/i)) ? (
                        <div 
                          className="relative max-w-[200px] rounded-xl overflow-hidden cursor-pointer group shadow-sm"
                          onClick={() => setSelectedMedia({ type: 'video', url: msg.file_url })}
                        >
                          <video src={msg.file_url} className="w-full bg-black pointer-events-none" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                            <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Play className="text-white fill-white translate-x-0.5" size={20} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message_text}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Footer info */}
        {consultation.status === 'ACTIVE' && (
          <div className="px-6 py-3 bg-emerald-50 border-t border-emerald-100 flex items-center justify-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Live Monitoring Active</p>
          </div>
        )}

      </div>

      {/* Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => setSelectedMedia(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center">
            {selectedMedia.type === 'image' ? (
              <img 
                src={selectedMedia.url} 
                alt="Full size attachment" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
            ) : (
              <video 
                src={selectedMedia.url} 
                controls 
                autoPlay
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
