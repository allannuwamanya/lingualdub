import React from 'react';
import { Radio, Zap, Sparkles, StopCircle } from 'lucide-react';

interface AgentHeaderBannerProps {
  latencyMs: number | null;
  agentSpeaking: boolean;
  isInferring: boolean;
  isListening: boolean;
  bargeInTriggered: boolean;
}

export default function AgentHeaderBanner({
  latencyMs,
  agentSpeaking,
  isInferring,
  isListening,
  bargeInTriggered,
}: AgentHeaderBannerProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-7 sm:p-8 bg-[#101726] rounded-3xl shadow-xl">
      <div className="flex items-start sm:items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Radio className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Conversational Voice Agent
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 tracking-wide">
              Duplex Dialogue
            </span>
            {latencyMs && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/[0.05] text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                {latencyMs}ms roundtrip
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-slate-300 mt-1.5 leading-relaxed">
            Low-latency bidirectional dialogue loop with barge-in interruption and authentic African phonetics.
          </p>
        </div>
      </div>

      {/* Live System Status Pill */}
      <div className="flex items-center gap-2 shrink-0">
        {bargeInTriggered ? (
          <span className="px-4 py-2.5 bg-rose-500/15 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
            <StopCircle className="w-4 h-4 text-rose-400" />
            <span>Interrupted!</span>
          </span>
        ) : isInferring ? (
          <span className="px-4 py-2.5 bg-indigo-500/15 text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>Thinking...</span>
          </span>
        ) : agentSpeaking ? (
          <span className="px-4 py-2.5 bg-indigo-500/20 text-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-sm">
            <span className="flex items-center gap-0.5">
              <span className="w-1 h-3 bg-indigo-400 rounded-full animate-pulse" />
              <span className="w-1 h-4 bg-indigo-400 rounded-full animate-pulse delay-75" />
              <span className="w-1 h-2 bg-indigo-400 rounded-full animate-pulse delay-150" />
            </span>
            <span>Agent Speaking</span>
          </span>
        ) : isListening ? (
          <span className="px-4 py-2.5 bg-amber-500/15 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>Listening...</span>
          </span>
        ) : (
          <span className="px-4 py-2.5 bg-white/[0.04] text-slate-400 rounded-xl text-xs font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Ready for Voice</span>
          </span>
        )}
      </div>
    </header>
  );
}
