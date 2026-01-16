import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export const useConversations = (isAuthenticated) => {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.get('/conversations');
      // res.data is expected to be an array based on requirements
      // Sort by lastActivity or createdAt descending
      const sorted = res.data.sort((a, b) => {
        const dateA = new Date(a.lastActivity || a.createdAt);
        const dateB = new Date(b.lastActivity || b.createdAt);
        return dateB - dateA;
      });
      setConversations(sorted);
      
      // If we have an activeId but it's not in the list (rare), handle it? 
      // Or if no activeId, maybe select none (welcome screen) or the first one?
      // Requirement says: "Clicking 'New chat' ... Set this as active conversation"
      // "Clicking a conversation in history... Set active conversationId"
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createConversation = async () => {
    try {
      const res = await api.post('/conversations');
      if (res.data.conversation_id) {
        const newConv = {
          id: res.data.conversation_id,
          createdAt: new Date().toISOString(),
          messageCount: 0,
          // We can add a temporary title
          title: "New conversation" 
        };
        setConversations(prev => [newConv, ...prev]);
        setActiveId(res.data.conversation_id);
        return res.data.conversation_id;
      }
    } catch (err) {
      console.error("Failed to create conversation", err);
    }
    return null;
  };

  const selectConversation = (id) => {
    setActiveId(id);
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    activeId,
    loading,
    createConversation,
    selectConversation,
    fetchConversations
  };
};
