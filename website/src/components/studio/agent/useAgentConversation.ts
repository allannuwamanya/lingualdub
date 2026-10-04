import { useState, useRef, useCallback } from 'react';
import { useStudioAudio } from '../../../context/StudioAudioContext';
import type { ChatMessage } from '../../../types/studio';
import { SUPPORTED_AGENT_LANGS } from './agentData';
import { queryAgentResponse } from './agentService';
import { useSpeechRecognition } from './useSpeechRecognition';

export function useAgentConversation() {
  const { sunbirdApiKey, speakBrowserVoice } = useStudioAudio();

  const [selectedLang, setSelectedLang] = useState('lug');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const initConfig = SUPPORTED_AGENT_LANGS.find((l) => l.code === 'lug') || SUPPORTED_AGENT_LANGS[0];
    return [
      {
        id: 'init-1',
        sender: 'assistant',
        text: initConfig.initialGreeting,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [chatInput, setChatInput] = useState('');
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [isInferring, setIsInferring] = useState(false);
  const [bargeInTriggered, setBargeInTriggered] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(184);

  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Barge-In Interruption
  const handleBargeIn = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (currentAudioElementRef.current) {
      currentAudioElementRef.current.pause();
      currentAudioElementRef.current = null;
    }
    setAgentSpeaking(false);
    setIsInferring(false);
    setBargeInTriggered(true);
    setTimeout(() => setBargeInTriggered(false), 2500);
  }, []);

  const { isListening, toggleMic: rawToggleMic, stopMic } = useSpeechRecognition({
    selectedLang,
    onTranscript: setChatInput,
    onBeforeStart: handleBargeIn,
  });

  const toggleMic = () => rawToggleMic(agentSpeaking);

  const handleSendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || isInferring) return;
    const userText = chatInput.trim();
    setChatInput('');
    stopMic();

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, newMsg]);
    setIsInferring(true);
    setBargeInTriggered(false);

    try {
      const { replyText, audioBase64, latencyMs: roundtrip } = await queryAgentResponse({
        userText,
        language: selectedLang,
        apiKey: sunbirdApiKey,
      });

      setLatencyMs(roundtrip);
      setIsInferring(false);
      setAgentSpeaking(true);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        audioBase64,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatHistory((prev) => [...prev, assistantMsg]);

      if (audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
        currentAudioElementRef.current = audio;
        audio.play().catch(() => {});
        audio.onended = () => {
          setAgentSpeaking(false);
          currentAudioElementRef.current = null;
        };
      } else {
        speakBrowserVoice(replyText, selectedLang, 'Female', 1.0);
        const duration = Math.min(Math.max(replyText.length * 65, 2000), 8000);
        setTimeout(() => setAgentSpeaking(false), duration);
      }
    } catch {
      setIsInferring(false);
      setAgentSpeaking(false);
    }
  }, [chatInput, isInferring, selectedLang, sunbirdApiKey, speakBrowserVoice, stopMic]);

  const handleReplayAudio = (text: string) => {
    handleBargeIn();
    speakBrowserVoice(text, selectedLang, 'Female', 1.0);
    setAgentSpeaking(true);
    setTimeout(() => setAgentSpeaking(false), Math.min(text.length * 65, 6000));
  };

  const handleSelectLang = (langCode: string) => {
    setSelectedLang(langCode);
    const langConfig = SUPPORTED_AGENT_LANGS.find((l) => l.code === langCode);
    if (langConfig) {
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'assistant',
          text: langConfig.initialGreeting,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleResetSession = () => {
    handleBargeIn();
    const langConfig = SUPPORTED_AGENT_LANGS.find((l) => l.code === selectedLang) || SUPPORTED_AGENT_LANGS[0];
    setChatHistory([
      {
        id: Date.now().toString(),
        sender: 'assistant',
        text: langConfig.initialGreeting,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleExportTranscript = () => {
    const text = chatHistory
      .map((m) => `[${m.time}] ${m.sender === 'user' ? 'USER' : 'AGENT'}: ${m.text}`)
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lingualdub-session-${selectedLang}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    selectedLang,
    chatHistory,
    chatInput,
    setChatInput,
    agentSpeaking,
    isInferring,
    bargeInTriggered,
    isListening,
    latencyMs,
    toggleMic,
    handleBargeIn,
    handleSendChatMessage,
    handleReplayAudio,
    handleSelectLang,
    handleResetSession,
    handleExportTranscript,
  };
}
