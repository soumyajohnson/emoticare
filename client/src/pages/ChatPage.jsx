import React, { useState, useEffect } from 'react';
import { useSocketChat } from '../hooks/useSocketChat';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { VoiceOrb } from '../components/VoiceOrb';
import { TranscriptPanel } from '../components/TranscriptPanel';
import { ControlDock } from '../components/ControlDock';
import { useAuth } from '../auth/AuthProvider'; // Import Auth
import { LogOut, User } from 'lucide-react';
import api from '../lib/api'; // Use the configured api

export const ChatPage = () => {
  const { user, logout } = useAuth(); // Get user and logout from context
  const [conversationId, setConversationId] = useState(null);
  const [language, setLanguage] = useState('en-US'); 
  const [isMuted, setIsMuted] = useState(false);
  const [appState, setAppState] = useState('IDLE');

  // Token is managed by AuthProvider/sessionStorage, but socket hook might need it directly
  // or we can pass it.
  const token = sessionStorage.getItem('access_token');

  // Hooks
  const { 
    socket, status, messages, streamingResponse, isGenerating, sendMessage, cancelGeneration 
  } = useSocketChat(token, conversationId);

  const { 
    isListening, transcript, startListening, stopListening, hasSupport: sttSupport 
  } = useSpeechRecognition(language);

  const { 
    isSpeaking, speak, stopSpeaking, hasSupport: ttsSupport 
  } = useSpeechSynthesis(language);

  // --- Session Init ---
  useEffect(() => {
    const initSession = async () => {
      if (!conversationId && token) {
        try {
          // Use the api helper which attaches the token automatically
          const res = await api.post('/conversations');
          if (res.data.conversation_id) setConversationId(res.data.conversation_id);
        } catch (e) {
          console.error("Failed to init conversation", e);
        }
      }
    };
    initSession();
  }, [token, conversationId]);


  // --- State Synchronization (Same as before) ---
  useEffect(() => {
    if (isListening) {
      setAppState('LISTENING');
    } else if (appState === 'LISTENING' && !isListening) {
      if (transcript.trim()) {
        setAppState('THINKING');
        sendMessage(transcript, language === 'hi-IN' ? 'hi' : 'en');
      } else {
        setAppState('IDLE');
      }
    }
  }, [isListening, transcript]); 

  useEffect(() => {
    if (isGenerating) {
      setAppState('THINKING');
    }
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating && appState === 'THINKING' && messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        console.log(messages)
        if (lastMsg.role === 'assistant') {
            if (!isMuted) {
                speak(lastMsg.text);
            } else {
                setAppState('IDLE');
            }
        }
    }
  }, [isGenerating, appState, messages, isMuted, speak]);

  useEffect(() => {
    if (isSpeaking) {
      setAppState('SPEAKING');
    } else if (appState === 'SPEAKING' && !isSpeaking) {
      setAppState('IDLE');
    }
  }, [isSpeaking, appState]);


  // --- Event Handlers ---
  const handleStartListening = () => {
    if (appState === 'SPEAKING') stopSpeaking();
    startListening();
  };

  const handleStopListening = () => {
    stopListening();
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setAppState('IDLE');
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white font-sans selection:bg-purple-500/30 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 z-0" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />

      <div className="relative z-10 flex flex-col  max-w-4xl mx-auto">
        
        {/* Header with User Profile */}
        <header className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
            <span className="font-bold text-lg tracking-widest text-white/80">EMOTICARE</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className={`text-xs px-3 py-1 rounded-full border hidden sm:block ${status === 'connected' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400'}`}>
                {status === 'connected' ? 'ONLINE' : 'OFFLINE'}
             </div>

             <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="flex items-center gap-2 text-white/70 text-sm">
                    <User size={16} />
                    <span className="hidden sm:inline">{user?.email}</span>
                </div>
                <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors" title="Sign Out">
                    <LogOut size={18} />
                </button>
             </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center relative">
          <div className={`transition-all duration-700 ease-in-out ${messages.length > 0 ? 'scale-75 -translate-y-4' : 'scale-100'}`}>
            <VoiceOrb state={appState} />
          </div>

          <div className="h-8 mt-4 mb-2 text-center">
            <p className="text-indigo-200/60 text-sm font-medium tracking-widest uppercase animate-fade-in">
              {appState === 'IDLE' ? 'Ready' : appState}
            </p>
          </div>
          <TranscriptPanel 
            messages={messages} 
            streamingResponse={streamingResponse} 
            isGenerating={isGenerating} 
          />
        </main>

        <footer className="px-6 pb-6 pt-2">
          <ControlDock 
            state={appState}
            language={language}
            setLanguage={setLanguage}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            onStopSpeaking={handleStopSpeaking}
            isMuted={isMuted}
            toggleMute={() => setIsMuted(!isMuted)}
          />
          
          <div className="text-center">
            <p className="text-[10px] text-white/20 flex items-center justify-center gap-2">
              <span>🔒 Encrypted End-to-End</span>
              <span>•</span>
              <span>Auto-deletes in 30 days</span>
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
};