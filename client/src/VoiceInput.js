const VoiceInput = ({ onResponse, language }) => {
  const handleClick = async () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = language;
    recognition.start();

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("You said:", transcript);

      try {
        const res = await fetch('http://localhost:8000/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: transcript, language })
        });

        const data = await res.json();
        onResponse(transcript, data.response);
      } catch (error) {
        console.error("Failed to fetch:", error);
      }
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
