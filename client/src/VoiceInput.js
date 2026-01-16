import React from 'react';

const VoiceInput = ({ onMessage, language }) => {
  const handleClick = () => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser does not support Speech Recognition");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("You said:", transcript);
      
      // Send text to parent instead of fetch
      onMessage(transcript);
    };

    recognition.onerror = (err) => {
      console.error("Speech recognition error:", err);
    };
  };

  return (
    <button onClick={handleClick} className="talk-button">
      🎤 Talk to EmotiCare
    </button>
  );
};

export default VoiceInput;