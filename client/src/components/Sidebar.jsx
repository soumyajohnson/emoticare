import React from 'react';
import { Plus, MessageSquare, Menu, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar = ({ 
  isOpen, 
  setIsOpen, 
  conversations, 
  activeId, 
  onSelect, 
  onCreateNew 
}) => {
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // If today, show time, else show date
    if (new Date().toDateString() === date.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        className={`fixed md:relative top-0 left-0 h-full z-50 flex flex-col
          w-64 bg-[#0f172a]/95 backdrop-blur-xl border-r border-white/10
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/90">
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
            <span className="font-bold tracking-widest text-sm">HISTORY</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="md:hidden text-white/50 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => {
              onCreateNew();
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {conversations.length === 0 ? (
            <div className="text-center mt-10 text-white/20 text-xs px-6">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-20" />
              <p>No conversations yet.</p>
              <p>Start a new chat to begin.</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-2 text-[10px] font-bold text-white/30 uppercase tracking-wider">
                Your Chats
              </div>
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelect(conv.id);
                    if (window.innerWidth < 768) setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all relative overflow-hidden group
                    ${activeId === conv.id 
                      ? 'bg-white/10 text-white shadow-inner border border-white/5' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <MessageSquare size={16} className={`${activeId === conv.id ? 'text-purple-400' : 'text-white/30 group-hover:text-purple-400/70'}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">
                      {/* We use ID if title is generic, or derived title if we had one */}
                      {conv.title || `Chat ${conv.id.substring(0, 6)}...`}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-white/30 mt-0.5">
                      <Clock size={10} />
                      <span>{formatDate(conv.lastActivity || conv.createdAt)}</span>
                    </div>
                  </div>

                  {activeId === conv.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-r-full" />
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer info (optional) */}
        <div className="p-4 border-t border-white/10 text-[10px] text-white/20 text-center">
          EmotiCare v1.0
        </div>
      </motion.aside>
    </>
  );
};
