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
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-7 sm:p-9 bg-[#101726] rounded-3xl shadow-xl">
      <div className="flex items-start sm:items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Radio className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-3.5 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Conversational Voice Agent
            </h1>
            <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-indigo-500/15 text-indigo-300 uppercase tracking-wider">
              Duplex Dialogue
            </span>
            {latencyMs && (
              <span className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-mono font-bold bg-white/[0.06] text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                {latencyMs}ms roundtrip
              </span>
            )}
          </div>
          <p className="text-base sm:text-lg text-slate-300 mt-2 leading-relaxed max-w-3xl">
            Low-latency bidirectional dialogue loop with real-time barge-in interruption and authentic African phonetics.
          </p>
        </div>
      </div>

      {/* Live System Status Pill */}
      <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
        {bargeInTriggered ? (
          <span className="px-5 py-3 bg-rose-500/20 text-rose-200 rounded-2xl text-sm font-bold flex items-center gap-2.5 shadow-md">
            <StopCircle className="w-5 h-5 text-rose-400" />
            <span>Interrupted!</span>
          </span>
        ) : isInferring ? (
          <span className="px-5 py-3 bg-indigo-500/20 text-indigo-200 rounded-2xl text-sm font-bold flex items-center gap-2.5 shadow-md">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
            <span>Thinking...</span>
          </span>
        ) : agentSpeaking ? (
          <span className="px-5 py-3 bg-indigo-500/25 text-indigo-100 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-md">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-4 bg-indigo-400 rounded-full animate-pulse" />
              <span className="w-1.5 h-5 bg-indigo-400 rounded-full animate-pulse delay-75" />
              <span className="w-1.5 h-3 bg-indigo-400 rounded-full animate-pulse delay-150" />
            </span>
            <span>Agent Speaking</span>
          </span>
        ) : isListening ? (
          <span className="px-5 py-3 bg-amber-500/20 text-amber-200 rounded-2xl text-sm font-bold flex items-center gap-2.5 shadow-md">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <span>Listening...</span>
          </span>
        ) : (
          <span className="px-5 py-3 bg-[#070b14] text-slate-300 rounded-2xl text-sm font-semibold flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Ready for Voice</span>
          </span>
        )}
      </div>
    </header>
  );
}
