import React, { useState, useEffect } from 'react';
import { useSocketChat } from '../hooks/useSocketChat';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useConversations } from '../hooks/useConversations';
import { useAuth } from '../auth/AuthProvider';
import { VoiceOrb } from '../components/VoiceOrb';
import { TranscriptPanel } from '../components/TranscriptPanel';
import { ControlDock } from '../components/ControlDock';
import { Sidebar } from '../components/Sidebar';
import { LogOut, User, Menu } from 'lucide-react';
import api from '../lib/api';

export const ChatPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [language, setLanguage] = useState('en-US'); 
  const [isMuted, setIsMuted] = useState(false);
  const [appState, setAppState] = useState('IDLE');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Conversations Logic ---
  const { 
    conversations, 
    activeId, 
    createConversation, 
    selectConversation,
    fetchConversations
  } = useConversations(isAuthenticated);

  // Token for socket
  const token = sessionStorage.getItem('access_token');

  // --- Socket Chat Logic ---
  const { 
    socket, status, messages, streamingResponse, isGenerating, sendMessage, cancelGeneration, setMessages 
  } = useSocketChat(token, activeId); // Pass activeId (conversationId)

  // --- Speech Logic ---
  const { 
    isListening, transcript, startListening, stopListening 
  } = useSpeechRecognition(language);

  const { 
    isSpeaking, speak, stopSpeaking 
  } = useSpeechSynthesis(language);

  // --- Effect: Fetch Messages when Active Conversation Changes ---
  useEffect(() => {
    const loadMessages = async () => {
      if (activeId && isAuthenticated) {
        try {
          const res = await api.get(`/conversations/${activeId}`);
          // The socket hook expects messages in a specific format?
          // useSocketChat uses { role, text, timestamp }
          // Backend returns: [{ role, content, language, created_at }] based on routes/chat.py
          // Let's map it.
          const mapped = (res.data || []).map(m => ({
            role: m.role,
            text: m.content,
            timestamp: new Date(m.created_at)
          }));
          setMessages(mapped);
        } catch (e) {
          console.error("Failed to load messages", e);
        }
      } else {
        setMessages([]); // Clear if no active ID
      }
    };
    loadMessages();
  }, [activeId, isAuthenticated, setMessages]); // setMessages needs to be stable or exposed by hook

  // --- Effect: Create initial conversation if list is empty on load ---
  useEffect(() => {
    // If we have loaded conversations, but none active, and list is empty => create new
    // If list is not empty, maybe select the first one?
    // Let's rely on user action mostly, but good UX is to have one ready.
    if (isAuthenticated && conversations.length === 0 && !activeId) {
        // Only create if we are sure we fetched. 
        // We can add a 'loading' check from useConversations if we export it.
        // For now let's just leave it empty or user clicks "New Chat". 
        // Actually the previous logic auto-created one. Let's keep that behavior but via the hook.
        // createConversation(); // This might cause double create on mount due to React.StrictMode.
        // Let's show "No chats" state instead.
    } else if (isAuthenticated && conversations.length > 0 && !activeId) {
        // Select the most recent one automatically
        selectConversation(conversations[0].id);
    }
  }, [isAuthenticated, conversations, activeId, createConversation, selectConversation]);


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
        if (lastMsg.role === 'assistant') {
            if (!isMuted) {
                speak(lastMsg.text);
            } else {
                setAppState('IDLE');
            }
            // Also refresh conversation list to update timestamps/order
            fetchConversations();
        }
    }
  }, [isGenerating, appState, messages, isMuted, speak, fetchConversations]);

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

  const handleCreateNewChat = async () => {
    if (isGenerating) cancelGeneration();
    stopSpeaking();
    stopListening();
    setAppState('IDLE');
    await createConversation();
  };

  return (
    <div className="flex h-screen w-full bg-slate-900 text-white font-sans selection:bg-purple-500/30 overflow-hidden relative">
      
      {/* Background Ambience (Global) */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 z-0 pointer-events-none" />
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        conversations={conversations} 
        activeId={activeId} 
        onSelect={(id) => {
            if (isGenerating) cancelGeneration();
            selectConversation(id);
        }}
        onCreateNew={handleCreateNewChat}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 h-full">
        
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-white/70 hover:text-white p-1"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="font-bold text-lg tracking-widest text-white/80">AURALIS</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className={`text-[10px] px-2 py-0.5 rounded-full border hidden sm:block ${status === 'connected' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400'}`}>
                {status === 'connected' ? 'ONLINE' : 'OFFLINE'}
             </div>

             <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="flex items-center gap-2 text-white/70 text-sm">
                    <User size={16} />
                    <span className="hidden sm:inline max-w-[100px] truncate">{user?.email}</span>
                </div>
                <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors" title="Sign Out">
                    <LogOut size={18} />
                </button>
             </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* Ambient Orbs for Main Area */}
          <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

          {activeId ? (
            <>
                <div className={`transition-all duration-700 ease-in-out ${messages.length > 0 ? 'scale-75 -translate-y-4' : 'scale-100'} mt-4`}>
                    <VoiceOrb state={appState} />
                </div>

                <div className="h-6 mb-2 text-center">
                    <p className="text-indigo-200/60 text-sm font-medium tracking-widest uppercase animate-fade-in">
                    {appState === 'IDLE' ? 'Ready' : appState}
                    </p>
                </div>

                <TranscriptPanel 
                    messages={messages} 
                    streamingResponse={streamingResponse} 
                    isGenerating={isGenerating} 
                />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-4">
                <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center">
                    <MessageSquare size={32} />
                </div>
                <p>Select a conversation or start a new one.</p>
                <button 
                    onClick={handleCreateNewChat}
                    className="px-6 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-full text-sm font-medium transition-colors"
                >
                    Start New Chat
                </button>
            </div>
          )}
        </main>

        {/* Footer Controls */}
        <footer className="px-6 pb-6 pt-2 z-20">
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
        </footer>

      </div>
    </div>
  );
};

// Helper for empty state icon
import { MessageSquare } from 'lucide-react';
