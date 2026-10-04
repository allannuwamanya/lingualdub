import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '../../../types/studio';
import AgentMessageBubble from './AgentMessageBubble';

interface AgentTranscriptViewProps {
  chatHistory: ChatMessage[];
  isInferring: boolean;
  onReplayAudio: (text: string) => void;
}

export default function AgentTranscriptView({
  chatHistory,
  isInferring,
  onReplayAudio,
}: AgentTranscriptViewProps) {
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isInferring]);

  return (
    <div
      className="h-[460px] overflow-y-auto bg-[#070b14] rounded-2xl p-5 space-y-5 scrollbar-thin"
      role="log"
      aria-live="polite"
      aria-label="Conversation Transcript Feed"
    >
      {chatHistory.map((msg) => (
        <AgentMessageBubble
          key={msg.id}
          message={msg}
          onReplayAudio={onReplayAudio}
        />
      ))}

      {isInferring && (
        <div className="flex flex-col items-start">
          <span className="text-xs font-semibold text-slate-400 mb-1 px-1">
            LingualDub Agent
          </span>
          <div className="bg-[#111728] text-slate-300 rounded-2xl rounded-bl-none px-5 py-3.5 text-sm flex items-center gap-2.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-slate-300">Synthesizing acoustic response...</span>
          </div>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  );
}
