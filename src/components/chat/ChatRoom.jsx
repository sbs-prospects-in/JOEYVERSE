import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../features/auth/api/supabase';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../features/auth/store/authStore';
import { Send, ShieldCheck, CheckCircle, Phone, PhoneCall, PhoneOff, Mic, MicOff, Trash2, StopCircle, Paperclip, Play, Pause, Image as ImageIcon, X } from 'lucide-react';

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
    return `${m}:${s}`;
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
          <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all ease-linear" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="text-[10px] text-slate-500 font-medium mt-1">
          {isPlaying ? formatTime(currentTime) : formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default function ChatRoom({ consultation, currentUserId, otherPersonName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecordingIndicator, setIsRecordingIndicator] = useState(false);
  // Billing state
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [consultationStatus, setConsultationStatus] = useState(consultation.status);
  const [endTime, setEndTime] = useState(consultation.ended_at);
  const { role: userRole, user } = useAuthStore();
  
  useEffect(() => {
    if (consultation.status !== consultationStatus) {
      setConsultationStatus(consultation.status);
    }
    if (consultation.ended_at !== endTime) {
      setEndTime(consultation.ended_at);
    }
  }, [consultation.status, consultation.ended_at]);

  // WebRTC Call State
  const [callStatus, setCallStatus] = useState('idle'); // 'idle' | 'calling' | 'receiving' | 'active'
  const [isMuted, setIsMuted] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);

  // Voice Note State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const isCancelledRef = useRef(false);

  const typingChannelRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);

  // WebRTC Refs
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const webrtcChannelRef = useRef(null);
  const feeDeductedRef = useRef(false);

  const callStatusRef = useRef(callStatus);
  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  // -------------------------------------------------------------
  // WebRTC Signaling and Initialization
  // -------------------------------------------------------------
  useEffect(() => {
    // Only run once per consultation
    const channel = supabase.channel(`webrtc:consultation_${consultation.id}`, {
      config: { broadcast: { self: false } }
    });

    channel
      .on('broadcast', { event: 'call-offer' }, (payload) => {
        // Auto-reject if already in a call
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
           // Queue the candidate if remote description isn't set yet
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
        // Must explicitly play on some browsers
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

      // Process any queued ICE candidates that arrived before the remote description was set
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

  const endCallLocal = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    setCallStatus('idle');
    setIsMuted(false);
    setIncomingCallData(null);
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


  // -------------------------------------------------------------
  // Billing, Messages, and existing logic
  // -------------------------------------------------------------
  useEffect(() => {
    if (consultationStatus === 'COMPLETED' && userRole === 'petOwner' && user?.id && !feeDeductedRef.current) {
      feeDeductedRef.current = true;
      const deductFinalFee = async () => {
        try {
          const desc = `Consultation Fee - ${consultation.id}`;
          const start = new Date(consultation.started_at || consultation.created_at).getTime();
          const end = new Date(endTime || consultation.ended_at || new Date()).getTime();
          const seconds = Math.floor((end - start) / 1000);
          const intervals = Math.ceil(Math.max(seconds, 0) / 60);
          const fee = intervals * consultation.per_minute_rate;

          if (fee > 0) {
            try {
              const response = await fetch('/api/wallet/deduct', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  userId: user.id,
                  amount: fee,
                  description: desc
                })
              });
              
              if (!response.ok) {
                console.error("Failed to deduct fee on server");
              }
            } catch (err) {
              console.error("Deduct fee error:", err);
              feeDeductedRef.current = false;
            }
          }
        } catch (err) {
          console.error("Billing error:", err);
          feeDeductedRef.current = false;
        }
      };
      deductFinalFee();
    }
  }, [consultationStatus, userRole, consultation, endTime, user?.id]);

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
      scrollToBottom();
    };

    fetchMessages();

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

    const roomChannel = supabase
      .channel(`room_consultation_${consultation.id}`, {
        config: { broadcast: { self: false } }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `consultation_id=eq.${consultation.id}`
      }, (payload) => {
        if (payload.new.sender_id !== currentUserId) {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
          setIsTyping(false);
          setIsRecordingIndicator(false);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'consultations',
        filter: `id=eq.${consultation.id}`
      }, (payload) => {
         if (payload.new.status === 'COMPLETED') {
           setConsultationStatus('COMPLETED');
           setEndTime(payload.new.ended_at || new Date().toISOString());
           endCallLocal();
         }
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        setIsTyping(payload.payload.isTyping && !payload.payload.isRecording);
        setIsRecordingIndicator(!!payload.payload.isRecording);
        if (payload.payload.isTyping || payload.payload.isRecording) {
          scrollToBottom();
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          typingChannelRef.current = roomChannel;
        }
      });
        
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
        if (walletChannel) supabase.removeChannel(walletChannel);
        supabase.removeChannel(roomChannel);
        clearInterval(fallbackMsgInterval);
        clearInterval(fallbackConsInterval);
      };
  }, [consultation.id, consultation.per_minute_rate, currentUserId, userRole]);

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

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (typingChannelRef.current) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { isTyping: true }
      });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      if (typingChannelRef.current) {
        typingChannelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { isTyping: false }
        });
      }
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    
    // Clear typing indicator immediately
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (typingChannelRef.current) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { isTyping: false }
      });
    }
    
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
      message_text: messageText,
      message_type: 'text'
    }]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setMediaPreview({ file, previewUrl, type });
    e.target.value = ''; // Clear input
  };

  const cancelMediaPreview = () => {
    if (mediaPreview?.previewUrl) URL.revokeObjectURL(mediaPreview.previewUrl);
    setMediaPreview(null);
  };

  const confirmAndUploadMedia = async () => {
    if (!mediaPreview) return;
    const { file, type } = mediaPreview;

    setUploadingMedia(true);
    setMediaPreview(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${consultation.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('chat-media')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;

      const tempMessage = {
        id: Math.random().toString(),
        consultation_id: consultation.id,
        sender_id: currentUserId,
        message_text: '',
        message_type: type,
        file_url: fileUrl,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, tempMessage]);
      scrollToBottom();

      const receiverId = currentUserId === consultation.doctor_id ? consultation.owner_id : consultation.doctor_id;

      await supabase.from('messages').insert([{
        consultation_id: consultation.id,
        sender_id: currentUserId,
        receiver_id: receiverId,
        message_text: '',
        message_type: type,
        file_url: fileUrl
      }]);
      
    } catch (err) {
      console.error('Error uploading media:', err);
      toast.error('Failed to upload file');
    } finally {
      setUploadingMedia(false);
      if (mediaPreview?.previewUrl) URL.revokeObjectURL(mediaPreview.previewUrl);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Safely stop the microphone tracks after we finish recording
        mediaRecorder.stream.getTracks().forEach(track => track.stop());

        if (!isCancelledRef.current && audioChunksRef.current.length > 0) {
          const audioType = mediaRecorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: audioType });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64AudioMessage = reader.result;
            sendVoiceMessage(base64AudioMessage);
          };
        }
      };

      if (typingChannelRef.current) {
        typingChannelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { isTyping: true, isRecording: true }
        });
      }

      // Start recording without timeslice for more reliable cross-browser Blob generation
      isCancelledRef.current = false;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone for voice note:", err);
      toast.error("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.requestData();
      } catch (e) {}
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      
      if (typingChannelRef.current) {
        typingChannelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { isTyping: false, isRecording: false }
        });
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      isCancelledRef.current = true;
      audioChunksRef.current = []; // Clear chunks so onstop ignores it
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
      
      if (typingChannelRef.current) {
        typingChannelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { isTyping: false, isRecording: false }
        });
      }
    }
  };

  const sendVoiceMessage = async (base64String) => {
    const audioPayload = `${base64String}|${recordingTime}`;
    const tempMessage = {
      id: Math.random().toString(),
      consultation_id: consultation.id,
      sender_id: currentUserId,
      message_text: audioPayload,
      message_type: 'voice',
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    const receiverId = currentUserId === consultation.doctor_id ? consultation.owner_id : consultation.doctor_id;

    await supabase.from('messages').insert([{
      consultation_id: consultation.id,
      sender_id: currentUserId,
      receiver_id: receiverId,
      message_text: audioPayload,
      message_type: 'voice'
    }]);
  };

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-[#f2687c] rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 text-sm font-medium">Loading messages...</p>
    </div>
  );

  const formatTime = (totalSeconds) => {
    if (totalSeconds < 0) totalSeconds = 0;
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="h-full flex flex-col bg-white relative">
      
      {/* Hidden Audio element for WebRTC incoming stream */}
      <audio ref={remoteAudioRef} autoPlay />

      {/* Voice Call Floating UI Overlay - REMOVED FOR NOW */}

      {/* Clean Modern Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <span className="text-slate-700 font-bold text-sm">{otherPersonName.charAt(0)}</span>
          </div>
          <div>
            <h3 className="text-slate-900 font-bold">{otherPersonName}</h3>
            {consultationStatus === 'ACTIVE' ? (
              <span className="text-emerald-500 text-xs font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                {formatTime(activeSeconds)}
              </span>
            ) : (
              <span className="text-slate-400 text-xs font-semibold">
                Ended
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* WebRTC Start Call Button - REMOVED FOR NOW */}

          {userRole === 'petOwner' && (
            <div className="hidden sm:flex items-center gap-4 text-sm border-l border-slate-100 pl-4">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rate</p>
                <p className="font-bold text-slate-900">₹{consultation.per_minute_rate}/min</p>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance</p>
                <p className={`font-bold ${walletBalance < consultation.per_minute_rate ? 'text-rose-500' : 'text-slate-900'}`}>
                  ₹{walletBalance}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {mediaPreview && (
        <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center p-6 backdrop-blur-sm lg:rounded-r-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-4 max-w-sm w-full relative">
            <button 
              onClick={cancelMediaPreview}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white text-slate-600 rounded-full shadow hover:bg-slate-50 flex items-center justify-center border border-slate-200"
            >
              <X size={16} />
            </button>
            <div className="mb-4 flex justify-center bg-slate-100 rounded-xl overflow-hidden aspect-square items-center">
              {mediaPreview.type === 'video' ? (
                <video src={mediaPreview.previewUrl} controls className="max-w-full max-h-full" />
              ) : (
                <img src={mediaPreview.previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
              )}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={cancelMediaPreview}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAndUploadMedia}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                disabled={uploadingMedia}
              >
                {uploadingMedia ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Send size={18} />}
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area - Crisp and Clear */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <ShieldCheck size={32} className="text-slate-300 mb-3" />
            <p className="font-medium text-slate-500">End-to-end encrypted room</p>
            <p className="text-sm">Say hello to start the consultation.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === currentUserId;
            const showTail = index === messages.length - 1 || messages[index + 1]?.sender_id !== msg.sender_id;
            const isAudioMessage = msg.message_text.startsWith('data:audio/');
            
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%]`}>
                  {/* Avatar for incoming message */}
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
                    className={`px-4 py-2.5 shadow-sm text-sm ${
                      isMe 
                        ? isAudioMessage ? 'bg-slate-100 p-2 border border-slate-200' : 'bg-slate-800 text-white' 
                        : 'bg-white border border-slate-200 text-slate-800'
                    } ${
                      isMe 
                        ? showTail ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl'
                        : showTail ? 'rounded-2xl rounded-bl-sm' : 'rounded-2xl'
                    }`}
                  >
                    {isAudioMessage ? (
                      <VoiceMessagePlayer 
                        src={msg.message_text.split('|')[0]} 
                        duration={parseInt(msg.message_text.split('|')[1] || '0', 10)} 
                      />
                    ) : msg.message_type === 'image' || (msg.file_url && msg.file_url.match(/\.(jpeg|jpg|gif|png)$/i)) ? (
                      <img src={msg.file_url} alt="Attachment" className="max-w-[200px] sm:max-w-[250px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.file_url, '_blank')} />
                    ) : msg.message_type === 'video' || (msg.file_url && msg.file_url.match(/\.(mp4|webm|ogg)$/i)) ? (
                      <video controls src={msg.file_url} className="max-w-[200px] sm:max-w-[250px] rounded-xl bg-black" />
                    ) : (
                      <p className="leading-relaxed">{msg.message_text}</p>
                    )}
                    <div className={`text-[10px] mt-1 text-right ${isMe ? (isAudioMessage ? 'text-slate-500' : 'text-white/80') : 'text-slate-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicator */}
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

      {/* Clean Input Area */}
      {consultationStatus === 'ACTIVE' ? (
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
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingMedia}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-colors shrink-0 bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                title="Attach Photo/Video"
              >
                {uploadingMedia ? <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div> : <Paperclip size={18} />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*,video/*" 
              />
              <button 
                type="button"
                onClick={startRecording}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  newMessage.trim() ? 'hidden' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title="Record Voice Note"
              >
                <Mic size={18} />
              </button>
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className={`w-11 h-11 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 shrink-0 shadow-sm ${
                  !newMessage.trim() ? 'hidden' : 'block'
                }`}
              >
                <Send size={16} className="translate-x-0.5 -translate-y-0.5" />
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="p-8 bg-slate-50 border-t border-slate-200 flex flex-col items-center justify-center shrink-0">
           <CheckCircle size={32} className="text-slate-400 mb-3" />
           <h3 className="text-lg font-bold text-slate-800 mb-1">Consultation Ended</h3>
           
           <div className="flex items-center gap-6 mt-4">
             <div className="text-center">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</p>
               <p className="text-xl font-black text-slate-900">
                 {(() => {
                    const start = new Date(consultation.started_at || consultation.created_at).getTime();
                    const end = new Date(endTime || consultation.ended_at || new Date()).getTime();
                    let seconds = Math.floor((end - start) / 1000);
                    return formatTime(seconds);
                 })()}
               </p>
             </div>
             
             <div className="w-px h-10 bg-slate-200" />
             
             {userRole === 'petOwner' ? (
               <div className="text-center">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Final Fee</p>
                 <p className="text-xl font-black text-blue-600">
                   ₹{(() => {
                      const start = new Date(consultation.started_at || consultation.created_at).getTime();
                      const end = new Date(endTime || consultation.ended_at || new Date()).getTime();
                      let seconds = Math.floor((end - start) / 1000);
                      const intervals = Math.ceil(Math.max(seconds, 0) / 60);
                      return intervals * consultation.per_minute_rate;
                   })()}
                 </p>
               </div>
             ) : (
               <div className="text-center">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Earned</p>
                 <p className="text-xl font-black text-emerald-500">
                   ₹{(() => {
                      const start = new Date(consultation.started_at || consultation.created_at).getTime();
                      const end = new Date(endTime || consultation.ended_at || new Date()).getTime();
                      let seconds = Math.floor((end - start) / 1000);
                      const intervals = Math.ceil(Math.max(seconds, 0) / 60);
                      return intervals * consultation.per_minute_rate;
                   })()}
                 </p>
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
}
