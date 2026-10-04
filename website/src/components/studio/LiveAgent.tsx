import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStudioAudio } from '../../context/StudioAudioContext';
import type { ChatMessage } from '../../types/studio';
import { SUPPORTED_AGENT_LANGS } from './agent/agentData';
import AgentHeaderBanner from './agent/AgentHeaderBanner';
import AgentDialectBar from './agent/AgentDialectBar';
import AgentTranscriptView from './agent/AgentTranscriptView';
import AgentPromptStarters from './agent/AgentPromptStarters';
import AgentInputDock from './agent/AgentInputDock';

export default function LiveAgent() {
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
  const [isListening, setIsListening] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(184);

  const recognitionRef = useRef<any>(null);
  const currentAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Configure Speech Recognition
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
          setChatInput(transcript);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }
  }, [selectedLang]);

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

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not natively supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (agentSpeaking) {
        handleBargeIn();
      }
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic start error:', err);
      }
    }
  };

  const handleSendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || isInferring) return;
    const userText = chatInput.trim();
    setChatInput('');

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, newMsg]);
    setIsInferring(true);
    setBargeInTriggered(false);

    const startTime = performance.now();

    try {
      const res = await fetch('/v1/agent/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: userText,
          language: selectedLang,
          api_key: sunbirdApiKey,
        }),
      });

      const roundtrip = Math.round(performance.now() - startTime);
      setLatencyMs(roundtrip);

      const cType = res.headers.get('content-type') || '';
      let replyText = '';
      let audioB64: string | undefined = undefined;

      if (res.ok && cType.includes('json')) {
        const data = await res.json();
        replyText = data.reply_text;
        audioB64 = data.audio_base64;
      } else {
        const langConfig = SUPPORTED_AGENT_LANGS.find((l) => l.code === selectedLang);
        replyText = langConfig
          ? langConfig.fallbackReply(userText)
          : `Understood: "${userText}". How else can I assist you?`;
      }

      setIsInferring(false);
      setAgentSpeaking(true);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        audioBase64: audioB64,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatHistory((prev) => [...prev, assistantMsg]);

      if (audioB64) {
        const audio = new Audio(`data:audio/wav;base64,${audioB64}`);
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
  }, [chatInput, isInferring, isListening, selectedLang, sunbirdApiKey, speakBrowserVoice]);

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

  return (
    <div
      className="space-y-8 max-w-5xl mx-auto page-fade-in"
      role="region"
      aria-label="Conversational Voice Agent"
    >
      <AgentHeaderBanner
        latencyMs={latencyMs}
        agentSpeaking={agentSpeaking}
        isInferring={isInferring}
        isListening={isListening}
        bargeInTriggered={bargeInTriggered}
      />

      <AgentDialectBar
        selectedLang={selectedLang}
        onSelectLang={handleSelectLang}
        onExportTranscript={handleExportTranscript}
        onResetSession={handleResetSession}
      />

      <div className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-5">
        <AgentTranscriptView
          chatHistory={chatHistory}
          isInferring={isInferring}
          onReplayAudio={handleReplayAudio}
        />

        <AgentPromptStarters
          selectedLang={selectedLang}
          onSelectStarter={(text) => setChatInput(text)}
        />

        <AgentInputDock
          input={chatInput}
          onInputChange={setChatInput}
          onSendMessage={handleSendChatMessage}
          isInferring={isInferring}
          isListening={isListening}
          onToggleMic={toggleMic}
          agentSpeaking={agentSpeaking}
          onBargeIn={handleBargeIn}
          selectedLang={selectedLang}
        />
      </div>
    </div>
  );
}
