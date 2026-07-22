const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/priya/OneDrive/Desktop/anitalk/Anitalk_Website/src/components/chat';
const chatRoomPath = path.join(srcDir, 'ChatRoom.jsx');
let content = fs.readFileSync(chatRoomPath, 'utf8');

const useChatSessionPath = path.join(srcDir, 'hooks', 'useChatSession.js');
const chatMessagesPath = path.join(srcDir, 'ChatMessages.jsx');
const chatInputPath = path.join(srcDir, 'ChatInput.jsx');

if (!fs.existsSync(path.join(srcDir, 'hooks'))) {
    fs.mkdirSync(path.join(srcDir, 'hooks'));
}

const useChatSessionCode = `import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../features/auth/api/supabase';
import toast from 'react-hot-toast';

export function useChatSession({ consultation, currentUserId, userRole, user, navigate }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecordingIndicator, setIsRecordingIndicator] = useState(false);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [consultationStatus, setConsultationStatus] = useState(consultation.status);
  const [endTime, setEndTime] = useState(consultation.ended_at);
  const [showWalletWarning, setShowWalletWarning] = useState(false);
  
  const [callStatus, setCallStatus] = useState('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);

  const walletWarningShownRef = useRef(false);
  const typingChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const webrtcChannelRef = useRef(null);
  const feeDeductedRef = useRef(false);
  const callStatusRef = useRef(callStatus);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    if (consultation.status !== consultationStatus) {
      setConsultationStatus(consultation.status);
    }
    if (consultation.ended_at !== endTime) {
      setEndTime(consultation.ended_at);
    }
  }, [consultation.status, consultation.ended_at, consultationStatus, endTime]);

  const endCallLocal = () => {
    setCallStatus('idle');
    setIncomingCallData(null);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    setIsMuted(false);
  };

  const endCall = async () => {
    try {
      if (consultationStatus === 'COMPLETED') return;
      const { error } = await supabase
        .from('consultations')
        .update({ 
          status: 'COMPLETED',
          ended_at: new Date().toISOString()
        })
        .eq('id', consultation.id);
        
      if (!error) {
        setConsultationStatus('COMPLETED');
        endCallLocal();
      }
    } catch (err) {
      console.error("Error ending call:", err);
    }
  };

  useEffect(() => {
    const channel = supabase.channel(\`webrtc:consultation_\${consultation.id}\`, {
      config: { broadcast: { self: false } }
    });

    channel
      .on('broadcast', { event: 'call-offer' }, (payload) => {
        if (callStatusRef.current !== 'idle') {
          channel.send({ type: 'broadcast', event: 'end-call' });
          return;
        }
        setIncomingCallData(payload.payload);
        setCallStatus('receiving');
      })
      .on('broadcast', { event: 'call-answer' }, async (payload) => {
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.payload.answer));
            setCallStatus('active');
          } catch (err) {
            console.error("Error setting remote description", err);
          }
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, async (payload) => {
        if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.payload.candidate));
          } catch (e) {
             console.error('Error adding received ice candidate', e);
          }
        } else if (peerConnectionRef.current) {
           if (!window.iceCandidateQueue) window.iceCandidateQueue = [];
           window.iceCandidateQueue.push(payload.payload.candidate);
        }
      })
      .on('broadcast', { event: 'end-call' }, () => {
         endCallLocal();
         toast.success("Voice call ended by the other person.");
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          webrtcChannelRef.current = channel;
        }
      });

    return () => {
      supabase.removeChannel(channel);
      endCallLocal();
    };
  }, [consultation.id]);

  const initWebRTC = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;

    const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] };
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionRef.current = peerConnection;

    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });

    peerConnection.onicecandidate = event => {
      if (event.candidate && webrtcChannelRef.current) {
        webrtcChannelRef.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: { candidate: event.candidate }
        });
      }
    };

    peerConnection.ontrack = event => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
        remoteAudioRef.current.play().catch(e => console.error("Audio play error", e));
      }
    };

    return peerConnection;
  };

  const startCall = async () => {
    try {
      setCallStatus('calling');
      const pc = await initWebRTC();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      webrtcChannelRef.current.send({
        type: 'broadcast',
        event: 'call-offer',
        payload: { offer, caller: user.id }
      });
      toast("Calling...", { icon: '📞' });
    } catch (err) {
      console.error(err);
      toast.error("Failed to access microphone. Please check permissions.");
      setCallStatus('idle');
    }
  };

  const acceptCall = async () => {
    try {
      const pc = await initWebRTC();
      const offer = incomingCallData?.offer;
      if (!offer) return;

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (window.iceCandidateQueue) {
        for (const candidate of window.iceCandidateQueue) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('Error adding queued ice candidate', e);
          }
        }
        window.iceCandidateQueue = [];
      }

      webrtcChannelRef.current.send({
        type: 'broadcast',
        event: 'call-answer',
        payload: { answer }
      });

      setCallStatus('active');
      toast.success("Voice call connected!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect call.");
      setCallStatus('idle');
    }
  };

  const rejectCall = () => {
    webrtcChannelRef.current.send({ type: 'broadcast', event: 'end-call' });
    setCallStatus('idle');
  };

  const hangUp = () => {
    webrtcChannelRef.current.send({ type: 'broadcast', event: 'end-call' });
    endCallLocal();
    toast("You ended the voice call.");
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!localStreamRef.current.getAudioTracks()[0].enabled);
    }
  };

  useEffect(() => {
    if (consultationStatus === 'COMPLETED' && userRole === 'petOwner' && user?.id && !feeDeductedRef.current) {
      feeDeductedRef.current = true;
      const durationSeconds = Math.floor((new Date(endTime || new Date()).getTime() - new Date(consultation.started_at).getTime()) / 1000);
      const durationMinutes = Math.max(1, Math.ceil(durationSeconds / 60));

      fetch('/api/billing/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          consultationId: consultation.id,
          petOwnerId: consultation.owner_id,
          doctorId: consultation.doctor_id,
          durationMinutes: durationMinutes
        })
      })
      .then(res => res.json())
      .then(data => console.log('Billing Processed:', data))
      .catch(err => console.error('Billing Error:', err));
    }
    
    if (consultationStatus === 'COMPLETED' && userRole === 'doctor') {
      const timer = setTimeout(() => navigate('/doctor/dashboard'), 3000);
      return () => clearTimeout(timer);
    }
  }, [consultationStatus, userRole, consultation, endTime, user?.id, navigate]);

  useEffect(() => {
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
    };

    fetchMessages();

    const msgInterval = setInterval(() => {
      fetchMessages();
    }, 2000);

    let walletChannel;
    if (userRole === 'petOwner') {
      const fetchWallet = async () => {
        const { data } = await supabase.from('wallets').select('balance').eq('user_id', currentUserId).single();
        if (data) setWalletBalance(data.balance);
      };
      fetchWallet();
      
      walletChannel = supabase
        .channel(\`public:wallets:user_id=eq.\${currentUserId}\`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'wallets',
          filter: \`user_id=eq.\${currentUserId}\`
        }, (payload) => {
           setWalletBalance(payload.new.balance);
           if (payload.new.balance < consultation.per_minute_rate) {
             toast.error("Low balance warning!");
           }
        })
        .subscribe();
    }

    const roomChannel = supabase
      .channel(\`room_consultation_\${consultation.id}\`, {
        config: { broadcast: { self: false } }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: \`consultation_id=eq.\${consultation.id}\`
      }, (payload) => {
        if (payload.new.sender_id !== currentUserId) {
          setMessages(prev => [...prev, payload.new]);
          setIsTyping(false);
          setIsRecordingIndicator(false);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'consultations',
        filter: \`id=eq.\${consultation.id}\`
      }, (payload) => {
         if (payload.new.status === 'COMPLETED') {
           setConsultationStatus('COMPLETED');
           setEndTime(payload.new.ended_at || new Date().toISOString());
           endCallLocal();
         }
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        setIsTyping(payload.payload.isTyping);
        setIsRecordingIndicator(payload.payload.isRecording);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          typingChannelRef.current = roomChannel;
        }
      });

      return () => {
        clearInterval(msgInterval);
        if (walletChannel) supabase.removeChannel(walletChannel);
        supabase.removeChannel(roomChannel);
      };
  }, [consultation.id, consultation.per_minute_rate, currentUserId, userRole]);

  useEffect(() => {
    let interval;
    if (consultationStatus === 'ACTIVE') {
      const start = new Date(consultation.started_at || consultation.created_at).getTime();
      setActiveSeconds(Math.floor((Date.now() - start) / 1000));

      interval = setInterval(() => {
        const currentSeconds = Math.floor((Date.now() - start) / 1000);
        setActiveSeconds(currentSeconds);
        
        if (userRole === 'petOwner' && consultation.per_minute_rate > 0) {
          const maxTimeAllowed = Math.floor((walletBalance / consultation.per_minute_rate) * 60);
          const remainingSeconds = maxTimeAllowed - currentSeconds;
          
          if (remainingSeconds <= 60 && remainingSeconds > 0 && !walletWarningShownRef.current) {
            setShowWalletWarning(true);
            walletWarningShownRef.current = true;
          }
          
          if (remainingSeconds <= 0 && consultationStatus === 'ACTIVE') {
            endCall();
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [consultationStatus, consultation, walletBalance, userRole, endCall]);

  return {
    messages,
    setMessages,
    loading,
    isTyping,
    setIsTyping,
    isRecordingIndicator,
    setIsRecordingIndicator,
    activeSeconds,
    walletBalance,
    consultationStatus,
    setConsultationStatus,
    endTime,
    setEndTime,
    showWalletWarning,
    setShowWalletWarning,
    callStatus,
    isMuted,
    incomingCallData,
    remoteAudioRef,
    typingChannelRef,
    typingTimeoutRef,
    endCall,
    startCall,
    acceptCall,
    rejectCall,
    hangUp,
    toggleMute
  };
}
`;

fs.writeFileSync(useChatSessionPath, useChatSessionCode);


const chatMessagesCode = `import React, { useEffect, useState, useRef } from 'react';
import { ShieldCheck, Play, Pause, Mic } from 'lucide-react';

const VoiceMessagePlayer = ({ src, duration: initialDuration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const duration = initialDuration || 0;

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (totalSeconds) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return \`\${m}:\${s}\`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 bg-white/50 rounded-xl px-3 py-2 min-w-[140px]">
      <audio ref={audioRef} src={src} className="hidden" />
      <button 
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 hover:bg-blue-700 transition-colors"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="translate-x-0.5" />}
      </button>
      <div className="flex flex-col">
        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all ease-linear" style={{ width: \`\${progress}%\` }}></div>
        </div>
        <span className="text-[10px] text-slate-500 font-medium mt-1">
          {isPlaying ? formatTime(currentTime) : formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default function ChatMessages({ 
  messages, 
  currentUserId, 
  otherPersonName, 
  isTyping, 
  isRecordingIndicator, 
  setSelectedMedia 
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isRecordingIndicator]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        <div className="h-full flex flex-col items-center justify-center text-slate-400">
          <ShieldCheck size={32} className="text-slate-300 mb-3" />
          <p className="font-medium text-slate-500">End-to-end encrypted room</p>
          <p className="text-sm">Say hello to start the consultation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
      {messages.map((msg, index) => {
        const isMe = msg.sender_id === currentUserId;
        const showTail = index === messages.length - 1 || messages[index + 1]?.sender_id !== msg.sender_id;
        const isAudioMessage = msg.message_text.startsWith('data:audio/');
        
        return (
          <div key={msg.id} className={\`flex \${isMe ? 'justify-end' : 'justify-start'}\`}>
            <div className={\`flex items-end gap-2 max-w-[85%] md:max-w-[70%]\`}>
              {!isMe && (
                <div className="shrink-0 mb-1">
                  {showTail ? (
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
                      <span className="text-slate-600 font-bold text-[10px]">{otherPersonName.charAt(0)}</span>
                    </div>
                  ) : (
                    <div className="w-7 h-7" />
                  )}
                </div>
              )}

              <div 
                className={\`px-4 py-2.5 shadow-sm text-sm \${
                  isMe 
                    ? isAudioMessage ? 'bg-slate-100 p-2 border border-slate-200' : 'bg-slate-800 text-white' 
                    : 'bg-white border border-slate-200 text-slate-800'
                } \${
                  isMe 
                    ? showTail ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl'
                    : showTail ? 'rounded-2xl rounded-bl-sm' : 'rounded-2xl'
                }\`}
              >
                {isAudioMessage ? (
                  <VoiceMessagePlayer 
                    src={msg.message_text.split('|')[0]} 
                    duration={parseInt(msg.message_text.split('|')[1] || '0', 10)} 
                  />
                ) : msg.message_type === 'image' || (msg.file_url && msg.file_url.match(/\\.(jpeg|jpg|gif|png)$/i)) ? (
                  <img 
                    src={msg.file_url} 
                    alt="Attachment" 
                    className="max-w-[200px] sm:max-w-[250px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity shadow-sm" 
                    onClick={() => setSelectedMedia({ type: 'image', url: msg.file_url })} 
                  />
                ) : msg.message_type === 'video' || (msg.file_url && msg.file_url.match(/\\.(mp4|webm|ogg)$/i)) ? (
                  <div 
                    className="relative max-w-[200px] sm:max-w-[250px] rounded-xl overflow-hidden cursor-pointer group shadow-sm"
                    onClick={() => setSelectedMedia({ type: 'video', url: msg.file_url })}
                  >
                    <video src={msg.file_url} className="w-full bg-black pointer-events-none" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                      <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="text-white fill-white translate-x-0.5" size={24} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="leading-relaxed">{msg.message_text}</p>
                )}
                <div className={\`text-[10px] mt-1 text-right \${isMe ? (isAudioMessage ? 'text-slate-500' : 'text-white/80') : 'text-slate-400'}\`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {(isTyping || isRecordingIndicator) && (
        <div className="flex justify-start animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%]">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mb-1">
              <span className="text-slate-600 font-bold text-[10px]">{otherPersonName.charAt(0)}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2 h-10">
              {isRecordingIndicator ? (
                <div className="flex items-center gap-1.5">
                  <Mic size={14} className="text-red-500 animate-pulse" />
                  <span className="text-xs text-slate-500 font-medium">Recording audio...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
`;

fs.writeFileSync(chatMessagesPath, chatMessagesCode);

const chatInputCode = `import React from 'react';
import { Send, Mic, Trash2, ImagePlus, Video } from 'lucide-react';

export default function ChatInput({
  consultationStatus,
  isRecording,
  recordingTime,
  cancelRecording,
  stopRecording,
  handleSendMessage,
  newMessage,
  handleTyping,
  uploadingMedia,
  photoInputRef,
  videoInputRef,
  handleFileUpload,
  startRecording
}) {
  const formatTime = (totalSeconds) => {
    if (totalSeconds < 0) totalSeconds = 0;
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return \`\${m}:\${s}\`;
  };

  if (consultationStatus !== 'ACTIVE') {
    return null;
  }

  return (
    <div className="p-4 bg-white border-t border-slate-100 shrink-0">
      {isRecording ? (
        <div className="flex items-center gap-4 bg-red-50 rounded-full px-5 py-3 border border-red-100">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-red-500 font-medium text-sm flex-1">
            Recording... {formatTime(recordingTime)}
          </span>
          <button 
            type="button"
            onClick={cancelRecording}
            className="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-red-500 flex items-center justify-center transition-colors shadow-sm"
            title="Cancel Recording"
          >
            <Trash2 size={16} />
          </button>
          <button 
            type="button"
            onClick={stopRecording}
            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm"
            title="Send Voice Note"
          >
            <Send size={16} className="translate-x-0.5 -translate-y-0.5" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <input
            type="text"
            autoFocus
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type your message..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
          />
          <div className="flex items-center gap-1">
            <button 
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingMedia}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-colors shrink-0 bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
              title="Upload Photos"
            >
              <ImagePlus size={18} />
            </button>
            <button 
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploadingMedia}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-colors shrink-0 bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
              title="Upload Videos"
            >
              {uploadingMedia ? <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div> : <Video size={18} />}
            </button>
          </div>
          <input 
            type="file" 
            ref={photoInputRef} 
            onChange={(e) => handleFileUpload(e, 'image')} 
            className="hidden" 
            accept="image/*" 
            multiple
          />
          <input 
            type="file" 
            ref={videoInputRef} 
            onChange={(e) => handleFileUpload(e, 'video')} 
            className="hidden" 
            accept="video/*" 
            multiple
          />
          <button 
            type="button"
            onClick={startRecording}
            className={\`w-11 h-11 rounded-full flex items-center justify-center transition-colors shrink-0 \${
              newMessage.trim() ? 'hidden' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }\`}
            title="Record Voice Note"
          >
            <Mic size={18} />
          </button>
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className={\`w-11 h-11 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 shrink-0 shadow-sm \${
              !newMessage.trim() ? 'hidden' : 'block'
            }\`}
          >
            <Send size={16} className="translate-x-0.5 -translate-y-0.5" />
          </button>
        </form>
      )}
    </div>
  );
}
`;

fs.writeFileSync(chatInputPath, chatInputCode);
