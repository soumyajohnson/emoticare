import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import VoiceInput from './VoiceInput';
import './App.css';

const SOCKET_URL = 'http://localhost:8000';

function App() {
  const [chat, setChat] = useState([]);
  const [language, setLanguage] = useState('en-US');
  const [socket, setSocket] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const currentResponseRef = useRef("");

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
        console.log('Connected to socket');
        if (conversationId && token) {
            newSocket.emit('join_session', { token, conversation_id: conversationId });
        }
    });
    newSocket.on('error', (err) => console.error('Socket error:', err));

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket && conversationId && token) {
        socket.emit('join_session', { token, conversation_id: conversationId });
    }
  }, [socket, conversationId, token]);

  useEffect(() => {
    if (!socket) return;

    const handleToken = (data) => {
      const { chunk } = data;
      currentResponseRef.current += chunk;

      setChat(prev => {
        const last = prev[prev.length - 1];
        if (last && last.sender === 'bot' && !last.isFinal) {
          return [...prev.slice(0, -1), { ...last, text: last.text + chunk }];
        } else {
          return [...prev, { sender: 'bot', text: chunk, isFinal: false }];
        }
      });
    };

    const handleDone = () => {
      setChat(prev => {
        const last = prev[prev.length - 1];
        if (last && last.sender === 'bot') {
          return [...prev.slice(0, -1), { ...last, isFinal: true }];
        }
        return prev;
      });

      // Speak result
      const utterance = new SpeechSynthesisUtterance(currentResponseRef.current);
      utterance.lang = language;
      window.speechSynthesis.speak(utterance);
      currentResponseRef.current = "";
    };

    socket.on('assistant_token', handleToken);
    socket.on('assistant_done', handleDone);

    return () => {
      socket.off('assistant_token', handleToken);
      socket.off('assistant_done', handleDone);
    };
  }, [socket, language]);

  const handleMessage = async (userText) => {
    if (!token) {
        alert("Please login first (Token missing in localStorage)");
        return;
    }

    setChat(prev => [...prev, { sender: 'user', text: userText }]);
    currentResponseRef.current = "";

    let activeConvId = conversationId;

    if (!activeConvId) {
      try {
        const res = await fetch('http://localhost:8000/conversations', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.conversation_id) {
            activeConvId = data.conversation_id;
            setConversationId(activeConvId);
            socket.emit('join_session', { token, conversation_id: activeConvId });
        } else {
            console.error("Failed to create conversation");
            return;
        }
      } catch (e) {
        console.error("Error creating conversation", e);
        return;
      }
    }

    socket.emit('user_message', {
      token,
      conversation_id: activeConvId,
      text: userText,
      language: language === 'hi-IN' ? 'hi' : 'en'
    });
  };

  return (
    <div className="App">
      <h1>🧠 EmotiCare: AI Wellness Companion</h1>

      <div className="language-select">
        🌐 Language:
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en-US">English</option>
          <option value="hi-IN">Hindi</option>
        </select>
      </div>

      <div className="chat-box">
        {chat.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>

      <VoiceInput onMessage={handleMessage} language={language} />
    </div>
  );
}

export default App;