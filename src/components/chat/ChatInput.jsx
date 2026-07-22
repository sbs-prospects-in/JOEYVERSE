import React from 'react';
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
    return `${m}:${s}`;
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
  );
}
