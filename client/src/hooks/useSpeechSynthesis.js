import { useState, useRef, useEffect, useCallback } from 'react';

export const useSpeechSynthesis = (language = 'en-US') => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = window.speechSynthesis;

  const speak = useCallback((text) => {
    if (!synth) return;
    
    // Cancel currently speaking
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  }, [language, synth]);

  const stopSpeaking = useCallback(() => {
    if (synth) {
        synth.cancel();
        setIsSpeaking(false);
    }
  }, [synth]);

  return { isSpeaking, speak, stopSpeaking, hasSupport: !!synth };
};
