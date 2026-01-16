import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000';

export const useSocketChat = (token, conversationId) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('disconnected'); // disconnected, connected, error
  const [streamingResponse, setStreamingResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket');
      setStatus('connected');
      if (conversationId) {
        newSocket.emit('join_session', { token, conversation_id: conversationId });
      }
    });

    newSocket.on('error', (err) => {
      console.error('Socket error:', err);
      setStatus('error');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected');
      setStatus('disconnected');
    });

    return () => newSocket.close();
  }, [token, conversationId]);

  // useEffect(() => {
  //   if (!socket) return;

  //   const handleToken = (data) => {
  //     setIsGenerating(true);
  //     const { chunk } = data;
  //     setStreamingResponse((prev) => prev + chunk);
  //   };

  //   const handleDone = () => {
  //     setIsGenerating(false);
  //     setMessages((prev) => [
  //       ...prev,
  //       { role: 'assistant', text: streamingResponse, timestamp: new Date() } // We'll update this in the effect below effectively
  //     ]);
  //     // We don't append to messages here directly because streamingResponse is state. 
  //     // Actually, better pattern: 
  //     // We will expose streamingResponse to the UI. 
  //     // When done, we commit it to history? 
  //     // Or we just keep it in history as "streaming" message.
  //   };

  //   // To cleanly handle the "commit to history" logic:
  //   // We'll rely on the UI rendering the "last" message as the streaming one if isGenerating is true.
    
  //   socket.on('assistant_token', handleToken);
  //   socket.on('assistant_done', handleDone);

  //   return () => {
  //     socket.off('assistant_token', handleToken);
  //     socket.off('assistant_done', handleDone);
  //   };
  // }, [socket, streamingResponse]); // Dependency on streamingResponse is tricky for closures.

  // Better implementation for handleToken/Done to avoid closure staleness:
  useEffect(() => {
    if (!socket) return;

    socket.on('assistant_token', (data) => {
      setIsGenerating(true);
      setStreamingResponse((prev) => prev + data.chunk);
    });

    socket.on('assistant_done', () => {
      setIsGenerating(false);
      setStreamingResponse(finalText => {
        setMessages(prev => [...prev, { role: 'assistant', text: finalText, timestamp: new Date() }]);
        return '';
      });
    });
    
    // Note: We need to cleanup listeners
    return () => {
      socket.off('assistant_token');
      socket.off('assistant_done');
    };
  }, [socket]);


  const sendMessage = (text, language) => {
    if (!socket || status !== 'connected') return;
    
    // Optimistic update
    setMessages((prev) => [...prev, { role: 'user', text, timestamp: new Date() }]);
    
    socket.emit('user_message', {
      token,
      conversation_id: conversationId,
      text,
      language
    });
  };

  const cancelGeneration = () => {
    if (socket && isGenerating) {
        // Implement cancel_response if backend supports it, for now just stop listening
        // socket.emit('cancel_response', ...);
        setIsGenerating(false);
        // Commit what we have
        setMessages(prev => [...prev, { role: 'assistant', text: streamingResponse + " [Stopped]", timestamp: new Date() }]);
        setStreamingResponse('');
    }
  };

  return {
    socket,
    status,
    messages,
    streamingResponse,
    isGenerating,
    sendMessage,
    cancelGeneration
  };
};
