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
      className="flex items-center gap-3 pt-1"
    >
      {/* Live Mic Button */}
      <button
        type="button"
        onClick={onToggleMic}
        className={`w-13 h-13 min-w-[52px] rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          isListening
            ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
            : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white'
        }`}
        title={isListening ? 'Stop listening' : 'Start speaking with microphone'}
        aria-label={isListening ? 'Stop microphone speech input' : 'Start microphone speech input'}
      >
        {isListening ? (
          <MicOff className="w-5 h-5 text-white" />
        ) : (
          <Mic className="w-5 h-5 text-indigo-400" />
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
        className="flex-1 min-w-0 bg-[#070b14] focus:ring-2 focus:ring-indigo-500/50 rounded-xl px-5 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors h-13"
        aria-label="Agent speech or message input"
      />

      {/* Send Button */}
      <button
        type="button"
        onClick={onSendMessage}
        disabled={!input.trim() || isInferring}
        className="h-13 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-base flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label="Send message to agent"
      >
        <Send className="w-4 h-4" />
        <span className="hidden sm:inline">Send</span>
      </button>

      {/* Barge-In Immediate Interruption Button */}
      <button
        type="button"
        onClick={onBargeIn}
        className={`h-13 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-rose-500 ${
          agentSpeaking
            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 ring-1 ring-rose-500/40'
            : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white'
        }`}
        title="Immediately interrupt agent speech (Barge In)"
        aria-label="Barge-in interrupt assistant speech"
      >
        <StopCircle className="w-4 h-4 text-rose-400" />
        <span className="hidden md:inline">Barge In</span>
      </button>
    </div>
  );
}
