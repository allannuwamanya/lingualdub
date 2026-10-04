import React from 'react';
import { Globe, Download, RotateCcw } from 'lucide-react';
import { SUPPORTED_AGENT_LANGS } from './agentData';

interface AgentDialectBarProps {
  selectedLang: string;
  onSelectLang: (langCode: string) => void;
  onExportTranscript: () => void;
  onResetSession: () => void;
}

export default function AgentDialectBar({
  selectedLang,
  onSelectLang,
  onExportTranscript,
  onResetSession,
}: AgentDialectBarProps) {
  return (
    <div
      aria-label="Agent Dialect and Session Actions"
      className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 bg-[#101726] rounded-3xl shadow-xl"
    >
      {/* Dialect Buttons Carousel */}
      <div
        role="tablist"
        aria-label="Agent Spoken Dialect"
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none py-1 flex-1"
      >
        <span className="text-sm font-bold text-slate-300 flex items-center gap-2 mr-1 shrink-0">
          <Globe className="w-5 h-5 text-indigo-400" /> Dialect:
        </span>
        {SUPPORTED_AGENT_LANGS.map((lang) => {
          const active = selectedLang === lang.code;
          return (
            <button
              key={lang.code}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => onSelectLang(lang.code)}
              className={`h-11 px-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-[#070b14] text-slate-300 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          );
        })}
      </div>

      {/* Session Export & Reset */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onExportTranscript}
          className="h-11 px-4.5 text-sm font-bold text-slate-200 hover:text-white bg-[#070b14] hover:bg-white/[0.08] rounded-xl flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
          title="Download conversation session transcript"
        >
          <Download className="w-4 h-4 text-indigo-400" />
          <span>Export</span>
        </button>

        <button
          type="button"
          onClick={onResetSession}
          className="h-11 px-4.5 text-sm font-bold text-slate-200 hover:text-rose-400 bg-[#070b14] hover:bg-rose-500/10 rounded-xl flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500"
          title="Clear and reset agent chat session"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
