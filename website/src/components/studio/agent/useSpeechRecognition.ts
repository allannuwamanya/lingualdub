import { useState, useRef, useEffect } from 'react';
import { SUPPORTED_AGENT_LANGS } from './agentData';

interface UseSpeechRecognitionOptions {
  selectedLang: string;
  onTranscript: (transcript: string) => void;
  onBeforeStart?: () => void;
}

export function useSpeechRecognition({
  selectedLang,
  onTranscript,
  onBeforeStart,
}: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        const currentLangObj = SUPPORTED_AGENT_LANGS.find((l) => l.code === selectedLang);
        recognition.lang = currentLangObj?.bcp47 || 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          onTranscript(transcript);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }
  }, [selectedLang, onTranscript]);

  const toggleMic = (isSpeaking: boolean) => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not natively supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (isSpeaking && onBeforeStart) {
        onBeforeStart();
      }
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic start error:', err);
      }
    }
  };

  const stopMic = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    toggleMic,
    stopMic,
  };
}
