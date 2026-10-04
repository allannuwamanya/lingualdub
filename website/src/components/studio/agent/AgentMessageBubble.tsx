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
      <div className="flex items-center gap-2 mb-1.5 px-1">
        <span className="text-xs font-semibold text-slate-400">
          {isUser ? 'You' : 'LingualDub Agent'}
        </span>
        <span className="text-xs text-slate-500 font-mono">{message.time}</span>
      </div>

      <div
        className={`max-w-[85%] rounded-2xl px-5 py-4 text-base leading-relaxed shadow-sm relative ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-[#111728] text-slate-100 rounded-bl-none shadow-md'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>

        {/* Action buttons for Agent replies */}
        {!isUser && (
          <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-white/[0.05] text-xs text-slate-400">
            <button
              type="button"
              onClick={() => onReplayAudio(message.text)}
              className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 rounded p-1"
              title="Replay spoken audio response"
            >
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span>Replay Audio</span>
            </button>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 rounded p-1"
              title="Copy message to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied</span>
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
