import React, { useEffect, useState, useRef } from 'react';
import { ShieldCheck, Play, Pause, Mic } from 'lucide-react';

const VoiceMessagePlayer = ({ src, duration: initialDuration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [actualDuration, setActualDuration] = useState(initialDuration || 0);
  const audioRef = useRef(null);
  const duration = actualDuration > 0 ? actualDuration : (initialDuration || 0);

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
    const handleLoadedMetadata = () => {
      if (!initialDuration || initialDuration === 0) {
        setActualDuration(audio.duration);
      }
    };
    
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [initialDuration]);

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

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
      <div className="flex flex-col flex-1 min-w-[80px]">
        <input 
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-medium mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
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
          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%]`}>
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
                  <img 
                    src={msg.file_url} 
                    alt="Attachment" 
                    className="max-w-[200px] sm:max-w-[250px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity shadow-sm" 
                    onClick={() => setSelectedMedia({ type: 'image', url: msg.file_url })} 
                  />
                ) : msg.message_type === 'video' || (msg.file_url && msg.file_url.match(/\.(mp4|webm|ogg)$/i)) ? (
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
                <div className={`text-[10px] mt-1 text-right ${isMe ? (isAudioMessage ? 'text-slate-500' : 'text-white/80') : 'text-slate-400'}`}>
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
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{otherPersonName} is typing</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
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
