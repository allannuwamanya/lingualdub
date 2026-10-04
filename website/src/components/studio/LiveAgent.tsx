import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Radio,
  Send,
  StopCircle,
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  Sparkles,
  Zap,
  Globe,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { useStudioAudio } from '../../context/StudioAudioContext';
import type { ChatMessage } from '../../types/studio';
import { NATIVE_LANG_NAMES } from '../../types/studio';

const SUPPORTED_AGENT_LANGS = [
  { code: 'lug', label: 'Oluganda', flag: '🇺🇬', bcp47: 'lg-UG' },
  { code: 'swa', label: 'Kiswahili', flag: '🇰🇪', bcp47: 'sw-KE' },
  { code: 'eng', label: 'English (African)', flag: '🌍', bcp47: 'en-US' },
  { code: 'nyn', label: 'Runyankore', flag: '🇺🇬', bcp47: 'en-UG' },
  { code: 'ach', label: 'Leb Acoli', flag: '🇺🇬', bcp47: 'en-UG' },
  { code: 'yor', label: 'Èdè Yorùbá', flag: '🇳🇬', bcp47: 'yo-NG' },
];

export default function LiveAgent() {
  const { sunbirdApiKey, speakBrowserVoice } = useStudioAudio();

  const [selectedLang, setSelectedLang] = useState('lug');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Oli otya nnyabo/ssebo! Ndi mubeezi wo ow'ekisa mu LingualDub. Nkuyambe ntya leero ku nsonga z'amaloboozi oba okukyusa ennimi?",
      time: '12:00 PM',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [isInferring, setIsInferring] = useState(false);
  const [bargeInTriggered, setBargeInTriggered] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(184);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isInferring]);

  // Handle Speech Recognition setup
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

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [selectedLang]);

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
        const responses: Record<string, string> = {
          lug: `Ntegedde bulungi nnyabo/ssebo: "${userText}". Ndi mwetegefu okukuyamba mu lulimi Oluganda n'amagezi ag'eby'obulimi, eddembe ly'amaloboozi, oba eby'obusuubuzi.`,
          swa: `Nimekuelewa vyema: "${userText}". Niko hapa kukusaidia na mifumo ya sauti ya Kiswahili, tafsiri, na huduma za kiteknolojia.`,
          eng: `Understood: "${userText}". LingualDub African Duplex Voice Agent is active with low-latency acoustic turn-taking.`,
          nyn: `Nyakukwatira kimwe: "${userText}". Ndi omubeezi wawe omu Runyankore n'okuhindura ebirikugambwa.`,
          ach: `Aniang maber: "${userText}". Abino konyi i leb Acoli kede tic me yotkom ki kwan.`,
          yor: `Mo gbọ ọ daradara: "${userText}". Mo wa nibi lati ran ọ lọwọ pẹlu ohun ede Yorùbá ati itumọ to peye.`,
        };
        replyText = responses[selectedLang] || responses.lug;
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
      speakBrowserVoice(replyText, selectedLang, 'Female', 1.0);

      if (audioB64) {
        const audio = new Audio(`data:audio/wav;base64,${audioB64}`);
        audio.play().catch(() => {});
        audio.onended = () => setAgentSpeaking(false);
      } else {
        const duration = Math.min(Math.max(replyText.length * 65, 2000), 8000);
        setTimeout(() => setAgentSpeaking(false), duration);
      }
    } catch {
      setIsInferring(false);
      setAgentSpeaking(false);
    }
  }, [chatInput, isInferring, isListening, selectedLang, sunbirdApiKey, speakBrowserVoice]);

  const handleBargeIn = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setAgentSpeaking(false);
    setIsInferring(false);
    setBargeInTriggered(true);
    setTimeout(() => setBargeInTriggered(false), 3000);
  };

  const handleReplayMessage = (text: string, lang: string) => {
    speakBrowserVoice(text, lang, 'Female', 1.0);
    setAgentSpeaking(true);
    setTimeout(() => setAgentSpeaking(false), Math.min(text.length * 65, 6000));
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearSession = () => {
    handleBargeIn();
    setChatHistory([
      {
        id: Date.now().toString(),
        sender: 'assistant',
        text: `Session reset. Ready in ${NATIVE_LANG_NAMES[selectedLang] || selectedLang}. How can I assist you?`,
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
    a.download = `lingualdub-session-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto page-fade-in" role="region" aria-label="Conversational Voice Agent">
      {/* Header Banner - Calm, Cohesive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-7 sm:p-8 bg-[#101726] rounded-3xl shadow-xl">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Radio className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Conversational Voice Agent</h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 tracking-wide">
                Duplex Dialogue
              </span>
              {latencyMs && (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/[0.05] text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  {latencyMs}ms
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base text-slate-300 mt-1.5 leading-relaxed">
              Low-latency acoustic dialogue loop with barge-in interruption and authentic African phonetics.
            </p>
          </div>
        </div>

        {/* Live System Status */}
        <div className="flex items-center gap-2 shrink-0">
          {bargeInTriggered ? (
            <span className="px-4 py-2 bg-rose-500/15 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
              <StopCircle className="w-4 h-4 text-rose-400" /> Interrupted!
            </span>
          ) : isInferring ? (
            <span className="px-4 py-2 bg-indigo-500/15 text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              Thinking...
            </span>
          ) : agentSpeaking ? (
            <span className="px-4 py-2 bg-indigo-500/15 text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
              Speaking...
            </span>
          ) : isListening ? (
            <span className="px-4 py-2 bg-amber-500/15 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              Listening...
            </span>
          ) : (
            <span className="px-4 py-2 bg-white/[0.04] text-slate-400 rounded-xl text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              Ready
            </span>
          )}
        </div>
      </div>

      {/* Language Selector & Session Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4.5 bg-[#101726] rounded-2xl shadow-md">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
            <Globe className="w-4 h-4 text-indigo-400" /> Dialect:
          </span>
          {SUPPORTED_AGENT_LANGS.map((lang) => {
            const active = selectedLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelectedLang(lang.code)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25'
                    : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportTranscript}
            className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download conversation as text"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button
            type="button"
            onClick={handleClearSession}
            className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-rose-400 bg-white/[0.06] hover:bg-white/[0.1] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Clear and reset chat session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Chat Workstation */}
      <div className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-5">
        {/* Transcript Window */}
        <div
          className="h-[460px] overflow-y-auto bg-[#070b14] rounded-2xl p-5 space-y-5 scrollbar-thin"
          role="log"
          aria-live="polite"
        >
          {chatHistory.map((msg) => {
            const isUser = msg.sender === 'user';
            const isCopied = copiedId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
              >
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-xs font-semibold text-slate-400">
                    {isUser ? 'You' : 'LingualDub Agent'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{msg.time}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 text-base leading-relaxed shadow-sm relative ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-[#111728] text-slate-100 rounded-bl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Actions for Assistant replies */}
                  {!isUser && (
                    <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-white/[0.05] text-xs text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleReplayMessage(msg.text, selectedLang)}
                        className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors cursor-pointer"
                        title="Replay spoken audio"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Replay</span>
                      </button>
                      <span className="text-slate-700">•</span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-pointer"
                        title="Copy message"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isInferring && (
            <div className="flex flex-col items-start">
              <span className="text-xs font-semibold text-slate-400 mb-1 px-1">LingualDub Agent</span>
              <div className="bg-[#111728] text-slate-300 rounded-2xl rounded-bl-none px-5 py-3.5 text-sm flex items-center gap-2.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-slate-400">Synthesizing acoustic response...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Starters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Starters:
          </span>
          {[
            'Oli otya? Nsasula ntya emitendezo?',
            'Hujambo! Nisaidie na huduma ya kilimo na bei za mazao.',
            'Ndani ya LingualDub, niwezeshe kurekodi sauti ya redio.',
            'Clinical triage: What are the emergency steps for severe fever?',
          ].map((starter, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setChatInput(starter)}
              className="px-3.5 py-2 rounded-xl text-xs bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer min-h-[36px]"
            >
              {starter}
            </button>
          ))}
        </div>

        {/* Input Bar with Mic, Send, and Barge-In Button */}
        <div className="flex items-center gap-3">
          {/* Live Mic Button */}
          <button
            type="button"
            onClick={toggleMic}
            className={`w-13 h-13 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white'
            }`}
            title={isListening ? 'Stop listening' : 'Start speaking with microphone'}
            aria-label={isListening ? 'Stop listening' : 'Start microphone speech input'}
          >
            {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-indigo-400" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
            placeholder={
              isListening
                ? 'Listening to your voice now...'
                : `Type or speak in ${NATIVE_LANG_NAMES[selectedLang] || selectedLang}...`
            }
            className="flex-1 min-w-0 bg-[#070b14] focus:ring-2 focus:ring-indigo-500/40 rounded-xl px-5 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors h-13"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSendChatMessage}
            disabled={!chatInput.trim() || isInferring}
            className="h-13 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-base flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>

          {/* Barge-In Button */}
          <button
            type="button"
            onClick={handleBargeIn}
            className={`h-13 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              agentSpeaking
                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white'
            }`}
            title="Immediately interrupt agent speech (Barge In)"
            aria-label="Barge-in interrupt assistant speech"
          >
            <StopCircle className="w-4 h-4 text-rose-400" />
            <span className="hidden md:inline">Barge In</span>
          </button>
        </div>
      </div>
    </div>
  );
}
