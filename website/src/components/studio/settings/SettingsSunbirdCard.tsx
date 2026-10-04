import React, { useState } from 'react';
import { Globe, Eye, EyeOff, CheckCircle2, XCircle, Zap, RefreshCw } from 'lucide-react';

interface SettingsSunbirdCardProps {
  tokenInput: string;
  onTokenInputChange: (val: string) => void;
  activeToken: string;
  onSaveToken: () => void;
  saveMessage: string | null;
  onTestSunbird: () => void;
  isTesting: boolean;
  testResult: {
    ok: boolean;
    latencyMs: number;
    message: string;
  } | null;
}

export default function SettingsSunbirdCard({
  tokenInput,
  onTokenInputChange,
  activeToken,
  onSaveToken,
  saveMessage,
  onTestSunbird,
  isTesting,
  testResult,
}: SettingsSunbirdCardProps) {
  const [showToken, setShowToken] = useState(false);

  return (
    <section
      aria-label="Sunbird AI Cloud Credentials"
      className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-xl space-y-6"
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
          <Globe className="w-6 h-6 text-indigo-400" />
          <span>Sunbird AI Regional Cloud Credentials</span>
        </h2>
        <span
          className={`text-sm font-mono font-bold px-3.5 py-1 rounded-full ${
            activeToken
              ? 'text-emerald-300 bg-emerald-500/20'
              : 'text-slate-400 bg-white/[0.08]'
          }`}
        >
          {activeToken ? 'Bearer Token Active' : 'No Token'}
        </span>
      </div>

      <p className="text-base text-slate-300 leading-relaxed">
        Enables production neural TTS, ASR, and Translation across 51+ African languages via api.sunbird.ai cloud infrastructure.
      </p>

      {saveMessage && (
        <div className="p-5 bg-emerald-500/20 rounded-2xl text-base text-emerald-200 flex items-center gap-3 shadow-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Input Group */}
      <div className="space-y-3">
        <label htmlFor="sunbird-token-input" className="text-base font-bold text-slate-200 block">
          Bearer Authentication API Key
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              id="sunbird-token-input"
              type={showToken ? 'text' : 'password'}
              value={tokenInput}
              onChange={(e) => onTokenInputChange(e.target.value)}
              placeholder="Paste your sb_... or JWT token here"
              className="w-full bg-[#070b14] rounded-2xl pl-5 pr-12 py-3.5 text-base sm:text-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 font-mono h-14"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-2 rounded-xl transition-colors cursor-pointer"
              aria-label={showToken ? 'Hide token' : 'Show token'}
            >
              {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="button"
            onClick={onSaveToken}
            className="h-14 px-7 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/25 shrink-0"
          >
            <span>Save Key</span>
          </button>
        </div>
      </div>

      {/* Test Connection Button & Result */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          type="button"
          onClick={onTestSunbird}
          disabled={isTesting}
          className="h-13 px-6 bg-white/[0.08] hover:bg-white/[0.14] text-slate-100 hover:text-white font-bold rounded-2xl text-base flex items-center gap-2.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0"
        >
          {isTesting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Verifying Connection...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 text-indigo-400" />
              <span>Test Connection</span>
            </>
          )}
        </button>

        {testResult && (
          <div
            className={`flex items-center gap-2.5 text-base font-medium px-4 py-2.5 rounded-xl ${
              testResult.ok ? 'text-emerald-300 bg-emerald-500/15' : 'text-rose-300 bg-rose-500/15'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{testResult.message} ({testResult.latencyMs}ms)</span>
          </div>
        )}
      </div>
    </section>
  );
}
