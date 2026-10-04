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
      className="h-[520px] overflow-y-auto bg-[#070b14] rounded-3xl p-6 space-y-6 scrollbar-thin"
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
          <span className="text-sm font-bold text-slate-400 mb-1.5 px-1">
            LingualDub Agent
          </span>
          <div className="bg-[#111728] text-slate-200 rounded-3xl rounded-bl-none px-6 py-4 text-base font-medium flex items-center gap-3 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>Synthesizing acoustic response...</span>
          </div>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  );
}
