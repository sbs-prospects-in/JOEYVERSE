import { useState, useEffect, useRef } from 'react';
import { supabase } from "../../../features/auth/api/supabase";
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
    const channel = supabase.channel(`webrtc:consultation_${consultation.id}`, {
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
    
    if (consultationStatus === 'COMPLETED') {
      const timer = setTimeout(() => {
        navigate(`/${userRole === 'doctor' ? 'doctor' : 'pet-owner'}/dashboard`);
      }, 3000);
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
