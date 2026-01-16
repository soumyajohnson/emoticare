import React from 'react';
import { Mic, Square, Volume2, VolumeX, Languages } from 'lucide-react';

export const ControlDock = ({ 
  state, 
  language, 
  setLanguage, 
  onStartListening, 
  onStopListening,
  onStopSpeaking,
  isMuted, 
  toggleMute 
}) => {
  // state: 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'

  const handleMainAction = () => {
    if (state === 'LISTENING') {
      onStopListening();
    } else if (state === 'SPEAKING') {
        onStopSpeaking();
    } else {
      onStartListening();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-8 p-4 rounded-3xl justify-center bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-between gap-4">
      
      {/* Language Toggle */}
      <div className="flex bg-black/20 rounded-full p-1 border border-white/5">
        <button 
          onClick={() => setLanguage('en-US')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${language === 'en-US' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}`}
        >
          EN
        </button>
        <button 
          onClick={() => setLanguage('hi-IN')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${language === 'hi-IN' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}`}
        >
          HI
        </button>
      </div>

      {/* Main Mic Button */}
      <button 
        onClick={handleMainAction}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all transform active:scale-95 ${
          state === 'LISTENING' ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' :
          state === 'SPEAKING' ? 'bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.5)]' :
          state === 'THINKING' ? 'bg-purple-500/50 cursor-not-allowed' :
          'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.4)]'
        }`}
        disabled={state === 'THINKING'}
      >
        {state === 'LISTENING' ? <Square fill="currentColor" size={24} className="text-white" /> :
         state === 'SPEAKING' ? <Square fill="currentColor" size={24} className="text-white" /> :
         state === 'THINKING' ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
         <Mic size={28} className="text-white" />}
      </button>

      {/* Mute Toggle */}
      <button 
        onClick={toggleMute}
        className={`p-3 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors ${isMuted ? 'text-red-400' : 'text-white/70'}`}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

    </div>
  );
};
