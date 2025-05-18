import React, { useState } from 'react';
import VoiceInput from './VoiceInput';
import './App.css';

function App() {
  const [chat, setChat] = useState([]);
  const [language, setLanguage] = useState('en-US');

  const handleResponse = (userText, botReply) => {
    const newMessages = [
      { sender: 'user', text: userText },
      { sender: 'bot', text: botReply }
    ];
    setChat(prev => [...prev, ...newMessages]);

    // Speak the bot's reply aloud
    const utterance = new SpeechSynthesisUtterance(botReply);
    utterance.lang = language;
    speechSynthesis.speak(utterance);
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

      <VoiceInput onResponse={handleResponse} language={language} />
    </div>
  );
}

export default App;
