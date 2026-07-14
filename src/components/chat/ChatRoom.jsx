import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../features/auth/api/supabase';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../features/auth/store/authStore';

export default function ChatRoom({ consultation, currentUserId, otherPersonName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Billing state
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [consultationStatus, setConsultationStatus] = useState(consultation.status);
  const [endTime, setEndTime] = useState(consultation.ended_at);
  const { role: userRole } = useAuthStore();
  const { user } = useAuthStore();
  
  // Handle final billing deduction when consultation is completed
  useEffect(() => {
    if (consultationStatus === 'COMPLETED' && userRole === 'petOwner' && user?.id) {
      const deductFinalFee = async () => {
        try {
          // Check if already deducted by looking for a transaction
          const desc = `Consultation Fee - ${consultation.id}`;
          const { data: existingTx } = await supabase
            .from('wallet_transactions')
            .select('id')
            .eq('description', desc)
            .maybeSingle();

          if (!existingTx) {
            // Calculate final fee
            const start = new Date(consultation.started_at || consultation.created_at).getTime();
            const end = new Date(endTime || consultation.ended_at || new Date()).getTime();
            const seconds = Math.floor((end - start) / 1000);
            const intervals = Math.ceil(Math.max(seconds, 0) / 60);
            const fee = intervals * consultation.per_minute_rate;

            // Get wallet
            const { data: wallet } = await supabase
              .from('wallets')
              .select('id, balance')
              .eq('user_id', user.id)
              .single();

            if (wallet) {
              const localOffset = parseFloat(localStorage.getItem(`wallet_offset_${user.id}`) || '0');
              const currentBalance = parseFloat(wallet.balance) + localOffset;
              const newBalance = Math.max(0, currentBalance - fee);
              const newDbBalance = Math.max(0, parseFloat(wallet.balance) - fee);
              
              let rlsBlocked = false;

              // Deduct from DB
              const { data: updateData } = await supabase
                .from('wallets')
                .update({ balance: newDbBalance })
                .eq('id', wallet.id)
                .select();
                
              if (!updateData || updateData.length === 0) {
                rlsBlocked = true;
              }

              if (rlsBlocked) {
                // RLS Blocked: apply to local storage
                localStorage.setItem(`wallet_offset_${user.id}`, localOffset - fee);
              } else {
                // Record tx in DB only if wallet updated
                await supabase.from('wallet_transactions').insert({
                  wallet_id: wallet.id,
                  amount: -fee,
                  transaction_type: 'CONSULTATION_DEDUCTION',
                  description: desc
                });
              }
              toast.success(`₹${fee} deducted for the consultation.`);
            }
          }
        } catch (err) {
          console.error("Billing error:", err);
        }
      };
      deductFinalFee();
    }
  }, [consultationStatus, userRole, consultation, endTime, user?.id]);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // 1. Fetch existing messages using consultation_id instead of chat_id
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('consultation_id', consultation.id)
        .order('created_at', { ascending: true });
        
      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
      scrollToBottom();
    };

    fetchMessages();

    // 2. Initial Wallet Balance Fetch & Subscription
    let walletChannel;
    if (userRole === 'petOwner') {
      const fetchWallet = async () => {
        const { data } = await supabase.from('wallets').select('balance').eq('user_id', currentUserId).single();
        if (data) setWalletBalance(data.balance);
      };
      fetchWallet();
      
      walletChannel = supabase
        .channel(`public:wallets:user_id=eq.${currentUserId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${currentUserId}`
        }, (payload) => {
           setWalletBalance(payload.new.balance);
           if (payload.new.balance < consultation.per_minute_rate) {
             toast.error("Low balance warning!");
           }
        })
        .subscribe();
    }

    // 3. Subscribe to Realtime new messages
    const messageChannel = supabase
      .channel(`public:messages:consultation_id=eq.${consultation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `consultation_id=eq.${consultation.id}`
      }, (payload) => {
        if (payload.new.sender_id !== currentUserId) {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
        }
      })
      .subscribe();
      
      // 4. Subscribe to consultation changes (e.g. server ends it due to low balance)
      const consultationChannel = supabase
        .channel(`public:consultations:id=eq.${consultation.id}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'consultations',
          filter: `id=eq.${consultation.id}`
        }, (payload) => {
           if (payload.new.status === 'COMPLETED' && consultationStatus !== 'COMPLETED') {
             setConsultationStatus('COMPLETED');
             setEndTime(payload.new.ended_at || new Date().toISOString());
           }
        })
        .subscribe();
        
      // 5. Fallback polling for new messages (every 3s)
      const fallbackMsgInterval = setInterval(async () => {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('consultation_id', consultation.id)
          .order('created_at', { ascending: true });
          
        if (data) {
          setMessages(prev => {
            if (data.length > prev.length) {
              setTimeout(scrollToBottom, 100);
              return data;
            }
            return prev;
          });
        }
      }, 3000);
      
      const fallbackConsInterval = setInterval(async () => {
        const { data } = await supabase
          .from('consultations')
          .select('status, ended_at')
          .eq('id', consultation.id)
          .single();
          
        if (data && data.status === 'COMPLETED' && consultationStatus !== 'COMPLETED') {
          setConsultationStatus('COMPLETED');
          setEndTime(data.ended_at || new Date().toISOString());
        }
      }, 5000);

      return () => {
        supabase.removeChannel(messageChannel);
        supabase.removeChannel(consultationChannel);
        if (walletChannel) supabase.removeChannel(walletChannel);
        clearInterval(fallbackMsgInterval);
        clearInterval(fallbackConsInterval);
      };
  }, [consultation.id, consultation.per_minute_rate, currentUserId, userRole]);

  // Active Timer (Purely visual now, billing is server-side)
  useEffect(() => {
    let interval;
    if (consultationStatus === 'ACTIVE') {
      const start = new Date(consultation.started_at || consultation.created_at).getTime();
      setActiveSeconds(Math.floor((Date.now() - start) / 1000));

      interval = setInterval(() => {
        setActiveSeconds(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [consultationStatus, consultation.started_at, consultation.created_at]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    
    const tempMessage = {
      id: Math.random().toString(),
      consultation_id: consultation.id,
      sender_id: currentUserId,
      message_text: messageText,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    const receiverId = currentUserId === consultation.doctor_id ? consultation.owner_id : consultation.doctor_id;

    await supabase.from('messages').insert([{
      consultation_id: consultation.id,
      sender_id: currentUserId,
      receiver_id: receiverId,
      message_text: messageText
    }]);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading chat...</div>;

  const formatTime = (totalSeconds) => {
    if (totalSeconds < 0) totalSeconds = 0;
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border border-slate-200 rounded-3xl overflow-hidden relative shadow-sm">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
            <span className="text-rose-500 font-bold">{otherPersonName.charAt(0)}</span>
          </div>
          <div>
            <h3 className="text-slate-900 font-bold">{otherPersonName}</h3>
            {consultationStatus === 'ACTIVE' ? (
              <span className="text-green-500 text-xs flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse"></span>
                {formatTime(activeSeconds)} Active
              </span>
            ) : (
              <span className="text-slate-500 text-xs font-semibold">
                Consultation Ended
              </span>
            )}
          </div>
        </div>
        
        {userRole === 'petOwner' && (
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm flex flex-col items-end">
            <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Wallet Balance</span>
            <span className={`font-bold ${walletBalance < consultation.per_minute_rate ? 'text-red-500' : 'text-slate-800'}`}>
              ₹{walletBalance}
            </span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <svg className="w-12 h-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${
                    isMe 
                      ? 'bg-rose-500 text-white rounded-tr-sm' 
                      : 'bg-slate-100 text-slate-900 rounded-tl-sm border border-slate-200'
                  }`}
                >
                  <p>{msg.message_text}</p>
                  <span className={`text-[10px] mt-1 block ${isMe ? 'text-white/80' : 'text-slate-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area or Call Summary */}
      {consultationStatus === 'ACTIVE' ? (
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-white border border-slate-200 rounded-full px-6 py-3 text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all shadow-sm"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors disabled:opacity-50 shrink-0 shadow-sm"
            >
              <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col items-center">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md text-center">
             <h3 className="text-xl font-bold text-slate-800 mb-2">Consultation Ended</h3>
             <p className="text-slate-500 mb-4 font-medium">Duration: {(() => {
               const start = new Date(consultation.started_at || consultation.created_at).getTime();
               const end = new Date(endTime || consultation.ended_at || new Date()).getTime();
               let seconds = Math.floor((end - start) / 1000);
               return formatTime(seconds);
             })()}</p>
             
             <div className="flex justify-center gap-8 mb-6">
               {userRole === 'petOwner' ? (
                 <div className="bg-rose-50 text-rose-600 px-6 py-3 rounded-xl border border-rose-100 flex-1">
                   <p className="text-xs font-bold uppercase tracking-widest mb-1">Fee Charged</p>
                   <p className="text-2xl font-black">₹{(() => {
                     const start = new Date(consultation.started_at || consultation.created_at).getTime();
                     const end = new Date(endTime || consultation.ended_at || new Date()).getTime();
                     let seconds = Math.floor((end - start) / 1000);
                     const intervals = Math.ceil(Math.max(seconds, 0) / 60); // Per minute charge fixed
                     return intervals * consultation.per_minute_rate;
                   })()}</p>
                 </div>
               ) : (
                 <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-xl border border-emerald-100 flex-1">
                   <p className="text-xs font-bold uppercase tracking-widest mb-1">Total Earned</p>
                   <p className="text-2xl font-black">₹{(() => {
                     const start = new Date(consultation.started_at || consultation.created_at).getTime();
                     const end = new Date(endTime || consultation.ended_at || new Date()).getTime();
                     let seconds = Math.floor((end - start) / 1000);
                     const intervals = Math.ceil(Math.max(seconds, 0) / 60);
                     return intervals * consultation.per_minute_rate;
                   })()}</p>
                 </div>
               )}
             </div>
             
             <button 
               onClick={() => window.location.href = userRole === 'doctor' ? '/doctor/dashboard' : '/pet-owner/dashboard'}
               className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl w-full hover:bg-slate-800 transition-colors shadow-sm"
             >
               Return to Dashboard
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
