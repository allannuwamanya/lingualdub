import React from 'react';
import { Sparkles } from 'lucide-react';
import { PROMPT_STARTERS } from './agentData';

interface AgentPromptStartersProps {
  selectedLang: string;
  onSelectStarter: (text: string) => void;
}

export default function AgentPromptStarters({
  selectedLang,
  onSelectStarter,
}: AgentPromptStartersProps) {
  const starters = PROMPT_STARTERS[selectedLang] || PROMPT_STARTERS.default;

  return (
    <div
      aria-label="Conversation Starter Prompts"
      className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
    >
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Prompts:</span>
      </span>
      {starters.map((starter, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelectStarter(starter)}
          className="px-3.5 py-2 rounded-xl text-xs bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer min-h-[38px] focus-visible:ring-2 focus-visible:ring-indigo-500 whitespace-nowrap"
        >
          {starter}
        </button>
      ))}
    </div>
  );
}
