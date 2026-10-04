import React from 'react';
import { Mic, MicOff, Send, StopCircle } from 'lucide-react';
import { NATIVE_LANG_NAMES } from '../../../types/studio';

interface AgentInputDockProps {
  input: string;
  onInputChange: (val: string) => void;
  onSendMessage: () => void;
  isInferring: boolean;
  isListening: boolean;
  onToggleMic: () => void;
  agentSpeaking: boolean;
  onBargeIn: () => void;
  selectedLang: string;
}

export default function AgentInputDock({
  input,
  onInputChange,
  onSendMessage,
  isInferring,
  isListening,
  onToggleMic,
  agentSpeaking,
  onBargeIn,
  selectedLang,
}: AgentInputDockProps) {
  const nativeName = NATIVE_LANG_NAMES[selectedLang] || selectedLang;

  return (
    <div
      aria-label="Agent Input Dock"
      className="flex items-center gap-3.5 pt-2"
    >
      {/* Live Mic Button */}
      <button
        type="button"
        onClick={onToggleMic}
        className={`w-14 h-14 min-w-[56px] rounded-2xl flex items-center justify-center shrink-0 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          isListening
            ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/35'
            : 'bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 hover:text-white'
        }`}
        title={isListening ? 'Stop listening' : 'Start speaking with microphone'}
        aria-label={isListening ? 'Stop microphone speech input' : 'Start microphone speech input'}
      >
        {isListening ? (
          <MicOff className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-indigo-400" />
        )}
      </button>

      {/* Spoken/Typed Text Input */}
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
        placeholder={
          isListening
            ? 'Listening to your voice now...'
            : `Type or speak in ${nativeName}...`
        }
        className="flex-1 min-w-0 bg-[#070b14] focus:ring-2 focus:ring-indigo-500/50 rounded-2xl px-6 py-3.5 text-base sm:text-lg text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors h-14"
        aria-label="Agent speech or message input"
      />

      {/* Send Button */}
      <button
        type="button"
        onClick={onSendMessage}
        disabled={!input.trim() || isInferring}
        className="h-14 px-7 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-base flex items-center gap-2.5 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label="Send message to agent"
      >
        <Send className="w-5 h-5" />
        <span className="hidden sm:inline">Send</span>
      </button>

      {/* Barge-In Immediate Interruption Button */}
      <button
        type="button"
        onClick={onBargeIn}
        className={`h-14 px-5 rounded-2xl text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-rose-500 ${
          agentSpeaking
            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 ring-1 ring-rose-500/40'
            : 'bg-white/[0.08] hover:bg-white/[0.14] text-slate-300 hover:text-white'
        }`}
        title="Immediately interrupt agent speech (Barge In)"
        aria-label="Interrupt agent speech"
      >
        <StopCircle className={`w-5 h-5 ${agentSpeaking ? 'text-rose-400' : 'text-slate-400'}`} />
        <span className="hidden md:inline">Interrupt</span>
      </button>
    </div>
  );
}
