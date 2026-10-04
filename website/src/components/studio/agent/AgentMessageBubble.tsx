import React, { useState } from 'react';
import { Volume2, Copy, Check } from 'lucide-react';
import type { ChatMessage } from '../../../types/studio';

interface AgentMessageBubbleProps {
  message: ChatMessage;
  onReplayAudio: (text: string) => void;
}

export default function AgentMessageBubble({
  message,
  onReplayAudio,
}: AgentMessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}>
      <div className="flex items-center gap-2.5 mb-2 px-1">
        <span className="text-sm font-bold text-slate-300">
          {isUser ? 'You' : 'LingualDub Agent'}
        </span>
        <span className="text-xs text-slate-400 font-mono">{message.time}</span>
      </div>

      <div
        className={`max-w-[85%] rounded-3xl px-6 py-5 text-base sm:text-lg leading-relaxed shadow-sm relative ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-[#070b14] text-slate-100 rounded-bl-none shadow-md'
        }`}
      >
        <p className="whitespace-pre-wrap font-medium">{message.text}</p>

        {/* Action buttons for Agent replies */}
        {!isUser && (
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.06] text-sm text-slate-300 font-medium">
            <button
              type="button"
              onClick={() => onReplayAudio(message.text)}
              className="flex items-center gap-2 hover:text-indigo-400 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 rounded p-1"
              title="Replay spoken audio response"
            >
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span>Replay Audio</span>
            </button>
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 rounded p-1"
              title="Copy message to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
