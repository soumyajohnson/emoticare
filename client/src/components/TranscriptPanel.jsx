import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot } from 'lucide-react';

export const TranscriptPanel = ({ messages, streamingResponse, isGenerating }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingResponse]);

  return (
    <div className="flex-1 w-full max-w-2xl overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent" ref={scrollRef}>
      <AnimatePresence>
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col mb-6 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1 text-xs text-white/50 uppercase tracking-widest">
              {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
              <span>{msg.role}</span>
              <span>•</span>
              <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className={`p-4 rounded-2xl backdrop-blur-md max-w-[85%] leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-white/10 text-white rounded-tr-none border border-white/10' 
                : 'bg-black/30 text-indigo-100 rounded-tl-none border border-indigo-500/20'
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}

        {/* Streaming Message Placeholder */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col mb-6 items-start"
          >
            <div className="flex items-center gap-2 mb-1 text-xs text-purple-300/50 uppercase tracking-widest animate-pulse">
              <Bot size={12} />
              <span>EmotiCare is typing...</span>
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-black/30 backdrop-blur-md max-w-[85%] text-indigo-100 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              {streamingResponse}
              <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-blink" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
