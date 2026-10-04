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
      className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none py-1"
    >
      <span className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider shrink-0 flex items-center gap-2 mr-1">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span>Prompts:</span>
      </span>
      {starters.map((starter, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelectStarter(starter)}
          className="h-10 px-4 rounded-xl text-sm font-medium bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white transition-colors shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 whitespace-nowrap"
        >
          {starter}
        </button>
      ))}
    </div>
  );
}
