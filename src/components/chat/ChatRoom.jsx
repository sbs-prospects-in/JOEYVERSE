import React, { useState, useRef } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';
import { supabase } from '../../features/auth/api/supabase';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../features/auth/store/authStore';
import { Send, ShieldCheck, CheckCircle, Phone, PhoneCall, PhoneOff, Mic, MicOff, Trash2, StopCircle, Paperclip, Play, Pause, Image as ImageIcon, X, Star, Video, ImagePlus, DollarSign } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

import { useChatSession } from './hooks/useChatSession';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

export default function ChatRoom({ consultation, currentUserId, otherPersonName }) {
  const navigate = useNavigate();
  const { role: userRole, user } = useAuthStore();
  
  const {
    messages, setMessages, loading, isTyping, setIsTyping,
    isRecordingIndicator, setIsRecordingIndicator,
    activeSeconds, walletBalance,
    consultationStatus, setConsultationStatus,
    endTime, setEndTime,
    showWalletWarning, setShowWalletWarning,
    callStatus, isMuted, incomingCallData, remoteAudioRef,
    typingChannelRef, typingTimeoutRef,
    endCall, startCall, acceptCall, rejectCall, hangUp, toggleMute
  } = useChatSession({ consultation, currentUserId, userRole, user, navigate });

  const [newMessage, setNewMessage] = useState('');
  
  // Rating state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [hasRated, setHasRated] = useState(!!consultation.rating);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  
  const ratingModalShownRef = useRef(false);
  
  // Media Viewer state
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // Navigation guard
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      consultationStatus === 'ACTIVE' && currentLocation.pathname !== nextLocation.pathname
  );

  React.useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm("You have an active consultation. Are you sure you want to leave? It will NOT end the consultation automatically.");
      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  // Voice Note State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const isCancelledRef = useRef(false);

  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  React.useEffect(() => {
    if (consultationStatus === 'COMPLETED' && userRole === 'petOwner' && !hasRated && !ratingModalShownRef.current) {
      ratingModalShownRef.current = true;
      const timer = setTimeout(() => setShowRatingModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [consultationStatus, userRole, hasRated]);

  const lastTypedAtRef = useRef(0);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    const now = Date.now();
    if (now - lastTypedAtRef.current > 2000) {
      if (typingChannelRef.current) {
        typingChannelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: { isTyping: true }
        });
      }
      lastTypedAtRef.current = now;
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
      lastTypedAtRef.current = 0;
    }, 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (typingChannelRef.current) {
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { isTyping: false }
      });
    }
    
    const receiverId = currentUserId === consultation.doctor_id ? consultation.owner_id : consultation.doctor_id;

    await supabase.from('messages').insert([{
      consultation_id: consultation.id,
      sender_id: currentUserId,
      receiver_id: receiverId,
      message_text: messageText,
      message_type: 'text'
    }]);
  };

  const compressVideo = async (file) => {
    try {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: await fetchFile('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js'),
        wasmURL: await fetchFile('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm'),
      });
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));
      await ffmpeg.exec(['-i', 'input.mp4', '-vf', 'scale=-2:720', '-b:v', '1M', 'output.mp4']);
      const data = await ffmpeg.readFile('output.mp4');
      return new File([data.buffer], file.name.replace(/\.[^/.]+$/, "") + "_compressed.mp4", { type: 'video/mp4' });
    } catch (err) {
      console.warn("FFmpeg compression failed, falling back to original:", err);
      return file;
    }
  };

  const handleFileUpload = async (e, expectedType) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (files.length > 5) {
      toast.error('You can only upload up to 5 files at once');
      return;
    }

    setUploadingMedia(true);
    toast("Processing media...", { icon: '⏳' });

    const processedFiles = [];
    
    for (const f of files) {
      if (expectedType === 'image' && f.type.startsWith('image/')) {
        try {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: 'image/webp'
          };
          const compressedFile = await imageCompression(f, options);
          processedFiles.push({
            file: compressedFile,
            previewUrl: URL.createObjectURL(compressedFile),
            type: 'image'
          });
        } catch (err) {
          console.error("Image compression error:", err);
          processedFiles.push({ file: f, previewUrl: URL.createObjectURL(f), type: 'image' });
        }
      } else if (expectedType === 'video' && f.type.startsWith('video/')) {
        if (f.size > 50 * 1024 * 1024) {
          toast.error(`Video ${f.name} is too large (max 50MB)`);
          continue;
        }
        const compressedFile = await compressVideo(f);
        processedFiles.push({
          file: compressedFile,
          previewUrl: URL.createObjectURL(compressedFile),
          type: 'video'
        });
      } else {
        toast.error(`File ${f.name} is not a valid ${expectedType}.`);
      }
    }

    setMediaPreviews(prev => [...prev, ...processedFiles].slice(0, 5));
    e.target.value = '';
    setUploadingMedia(false);
  };

  const cancelMediaPreview = (indexToCancel) => {
    if (indexToCancel !== undefined) {
      const removed = mediaPreviews[indexToCancel];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      setMediaPreviews(prev => prev.filter((_, i) => i !== indexToCancel));
    } else {
      mediaPreviews.forEach(p => URL.revokeObjectURL(p.previewUrl));
      setMediaPreviews([]);
    }
  };

  const confirmAndUploadMedia = async () => {
    if (!mediaPreviews.length) return;
    
    setUploadingMedia(true);
    const filesToUpload = [...mediaPreviews];
    setMediaPreviews([]);

    for (const { file, type } of filesToUpload) {
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
        
        await supabase.from('messages').insert([{
          consultation_id: consultation.id,
          sender_id: currentUserId,
          receiver_id: currentUserId === consultation.doctor_id ? consultation.owner_id : consultation.doctor_id,
          message_text: '',
          message_type: type,
          file_url: fileUrl
        }]);
      } catch (err) {
        console.error('Error uploading media', err);
        toast.error('Failed to upload ' + file.name);
      }
    }
    
    setUploadingMedia(false);
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
      audioChunksRef.current = []; 
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
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <span className="text-slate-700 font-bold text-sm">{otherPersonName.charAt(0)}</span>
          </div>
          <div>
            <h3 className="text-slate-900 font-bold text-sm md:text-base">Live Consultation with {otherPersonName}</h3>
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

      {mediaPreviews.length > 0 && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Send {mediaPreviews.length} Media {mediaPreviews.length > 1 ? 'Files' : 'File'}</h3>
              <button onClick={() => cancelMediaPreview()} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-4">
              {mediaPreviews.map((preview, i) => (
                <div key={i} className="relative w-32 h-32 rounded-xl bg-slate-100 shrink-0 overflow-hidden group">
                  {preview.type === 'video' ? (
                    <video src={preview.previewUrl} className="w-full h-full object-cover" />
                  ) : (
                    <img src={preview.previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  )}
                  <button 
                    onClick={() => cancelMediaPreview(i)} 
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => cancelMediaPreview()}
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

      {showRatingModal && (
        <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => { setShowRatingModal(false); navigate('/pet-owner/dashboard'); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-500">
                <Star size={32} className="fill-current" />
              </div>
              <h3 className="font-black text-xl text-slate-900">Rate Consultation</h3>
              <p className="text-sm text-slate-500 font-medium mt-2">How was your experience with {otherPersonName}?</p>
            </div>
            
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)} 
                  className="text-4xl hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star size={40} className={rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} />
                </button>
              ))}
            </div>
            
            <textarea 
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write a brief review (optional)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm mb-6 resize-none h-28 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
            />
            
            <button 
              onClick={async () => {
                if (rating === 0) { toast.error("Please select a star rating"); return; }
                setIsSubmittingRating(true);
                try {
                  const { error: ratingError } = await supabase.from('consultations').update({
                    rating: rating,
                    feedback: reviewText || null,
                  }).eq('id', consultation.id);
                  
                  if (ratingError) {
                    const { error: fallbackError } = await supabase.from('consultations').update({
                      rating: rating,
                      review_text: reviewText || null,
                    }).eq('id', consultation.id);
                    
                    if (fallbackError) {
                      const { error: onlyRatingError } = await supabase.from('consultations').update({
                        rating: rating
                      }).eq('id', consultation.id);
                      
                      if (onlyRatingError) throw onlyRatingError;
                    }
                  }

                  toast.success("Thank you for your feedback! 🐾");
                  setShowRatingModal(false);
                  setHasRated(true);
                  setTimeout(() => navigate('/pet-owner/dashboard'), 500);
                } catch (err) {
                  console.error("Feedback error:", err);
                  toast.error("Could not submit feedback. Please try again.");
                } finally {
                  setIsSubmittingRating(false);
                }
              }}
              disabled={rating === 0 || isSubmittingRating}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmittingRating ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {showWalletWarning && (
        <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200 relative text-center border-t-4 border-rose-500">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-500">
              <DollarSign size={32} className="fill-current opacity-20" />
              <DollarSign size={32} className="absolute" />
            </div>
            <h3 className="font-black text-xl text-slate-900 mb-2">Low Balance Warning</h3>
            <p className="text-sm text-slate-500 font-medium mb-8">
              You have less than 1 minute of consultation time remaining based on your wallet balance. Please recharge or the consultation will automatically end.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setShowWalletWarning(false);
                  window.open('/pet-owner/dashboard', '_blank');
                }}
                className="w-full bg-rose-600 text-white font-bold py-4 rounded-xl hover:bg-rose-700 transition-colors"
              >
                Recharge & Continue
              </button>
              <button 
                onClick={() => {
                  setShowWalletWarning(false);
                  endCall();
                }}
                className="w-full bg-slate-100 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors"
              >
                End Conversation
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatMessages 
        messages={messages} 
        currentUserId={currentUserId}
        otherPersonName={otherPersonName}
        isTyping={isTyping}
        isRecordingIndicator={isRecordingIndicator}
        setSelectedMedia={setSelectedMedia}
      />

      {consultationStatus === 'ACTIVE' ? (
        <ChatInput 
          consultationStatus={consultationStatus}
          isRecording={isRecording}
          recordingTime={recordingTime}
          cancelRecording={cancelRecording}
          stopRecording={stopRecording}
          handleSendMessage={handleSendMessage}
          newMessage={newMessage}
          handleTyping={handleTyping}
          uploadingMedia={uploadingMedia}
          photoInputRef={photoInputRef}
          videoInputRef={videoInputRef}
          handleFileUpload={handleFileUpload}
          startRecording={startRecording}
        />
      ) : (
        <div className="p-8 bg-slate-50 border-t border-slate-200 flex flex-col items-center justify-center shrink-0">
           <CheckCircle size={32} className="text-slate-400 mb-3" />
           <h3 className="text-lg font-bold text-slate-800 mb-1">Consultation Ended</h3>
           
           <div className="flex items-center gap-6 mt-4">
             <div className="text-center">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</p>
               <p className="text-xl font-black text-slate-900">
                 {(() => {
                    if (consultation.status === 'CANCELLED' || consultation.status === 'REJECTED') return '00:00';
                    const start = new Date(consultation.started_at || consultation.created_at).getTime();
                    const end = new Date(endTime || consultation.ended_at || new Date()).getTime();
                    let seconds = Math.floor((end - start) / 1000);
                    if (seconds < 0) seconds = 0;
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
                      if (consultation.status === 'CANCELLED' || consultation.status === 'REJECTED') return 0;
                      const start = new Date(consultation.started_at || consultation.created_at).getTime();
                      const end = new Date(endTime || consultation.ended_at || new Date()).getTime();
                      let seconds = Math.floor((end - start) / 1000);
                      if (seconds < 0) seconds = 0;
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
                      if (consultation.status === 'CANCELLED' || consultation.status === 'REJECTED') return 0;
                      const start = new Date(consultation.started_at || consultation.created_at).getTime();
                      const end = new Date(endTime || consultation.ended_at || new Date()).getTime();
                      let seconds = Math.floor((end - start) / 1000);
                      if (seconds < 0) seconds = 0;
                      const intervals = Math.ceil(Math.max(seconds, 0) / 60);
                      return intervals * consultation.per_minute_rate * 0.7;
                   })()}
                 </p>
               </div>
             )}
           </div>
         </div>
      )}

      {selectedMedia && (
        <div 
          className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden rounded-3xl"
          onClick={() => setSelectedMedia(null)}
        >
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedMedia(null); }}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-[110] p-2 bg-black/50 rounded-full cursor-pointer"
          >
            <X size={20} />
          </button>
          
          <div className="relative z-50 w-full h-full flex items-center justify-center animate-in zoom-in-95 duration-200 pointer-events-none">
            {selectedMedia.type === 'image' ? (
              <img 
                src={selectedMedia.url} 
                alt="Enlarged media" 
                className="max-w-full max-h-full object-contain shadow-2xl select-none pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <video 
                src={selectedMedia.url} 
                controls
                autoPlay
                className="max-w-full max-h-full shadow-2xl bg-black pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
