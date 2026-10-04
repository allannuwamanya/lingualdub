import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface SettingsBackendStatusCardProps {
  result: {
    ok: boolean;
    version?: string;
    latencyMs: number;
    message: string;
  };
}

export default function SettingsBackendStatusCard({
  result,
}: SettingsBackendStatusCardProps) {
  return (
    <div
      role="status"
      className={`p-5 rounded-2xl text-sm flex items-start gap-3.5 transition-all shadow-md ${
        result.ok
          ? 'bg-emerald-500/15 text-emerald-300'
          : 'bg-amber-500/15 text-amber-300'
      }`}
    >
      {result.ok ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      )}
      <div>
        <strong className="block font-bold text-white">{result.message}</strong>
        <span className="text-xs text-slate-300 font-mono mt-1 block">
          Roundtrip: {result.latencyMs}ms • Endpoint: http://127.0.0.1:8000/v1/health
        </span>
      </div>
    </div>
  );
}
