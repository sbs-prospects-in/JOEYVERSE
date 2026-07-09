import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../features/auth/api/supabase';

export default function ChatRoom({ appointmentId, chatId, currentUserId, otherPersonName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // 1. Fetch existing messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
        
      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
      scrollToBottom();
    };

    fetchMessages();

    // 2. Subscribe to Realtime new messages
    const channel = supabase
      .channel(`public:messages:chat_id=eq.${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        // Only append if it's not our own message (we optimistically add our own)
        if (payload.new.sender_id !== currentUserId) {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, currentUserId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // clear input instantly
    
    // Optimistic UI update
    const tempMessage = {
      id: Math.random().toString(),
      chat_id: chatId,
      sender_id: currentUserId,
      message_text: messageText,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    // The receiver ID is technically needed by the schema. 
    // We can fetch the appointment to find the other party, but a quick shortcut for the MVP
    // is to fetch the chat row which contains both doctor_id and owner_id.
    const { data: chatRow } = await supabase.from('chats').select('*').eq('id', chatId).single();
    if (!chatRow) return;

    const receiverId = currentUserId === chatRow.doctor_id ? chatRow.owner_id : chatRow.doctor_id;

    // Send to database
    await supabase.from('messages').insert([{
      chat_id: chatId,
      sender_id: currentUserId,
      receiver_id: receiverId,
      message_text: messageText
    }]);
    
    // Update last_message_at
    await supabase.from('chats').update({ last_message_at: new Date().toISOString() }).eq('id', chatId);
  };

  if (loading) return <div className="p-8 text-center text-[#888]">Loading chat...</div>;

  return (
    <div className="flex flex-col h-[600px] bg-[#111] border border-[#222] rounded-3xl overflow-hidden relative">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#222] p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#bd905b]/20 flex items-center justify-center">
            <span className="text-[#bd905b] font-bold">{otherPersonName.charAt(0)}</span>
          </div>
          <div>
            <h3 className="text-white font-bold">{otherPersonName}</h3>
            <span className="text-green-500 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse"></span>
              Live Chat Active
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#555]">
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
                  className={`max-w-[75%] p-4 rounded-2xl ${
                    isMe 
                      ? 'bg-[#bd905b] text-black rounded-tr-sm' 
                      : 'bg-[#222] text-white rounded-tl-sm border border-[#333]'
                  }`}
                >
                  <p>{msg.message_text}</p>
                  <span className={`text-[10px] mt-1 block ${isMe ? 'text-black/60' : 'text-[#888]'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#1a1a1a] border-t border-[#222]">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#050505] border border-[#333] rounded-full px-6 py-3 text-white focus:outline-none focus:border-[#bd905b] transition-colors"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 bg-[#bd905b] text-black rounded-full flex items-center justify-center hover:bg-[#c99e69] transition-colors disabled:opacity-50 shrink-0"
          >
            <svg className="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
