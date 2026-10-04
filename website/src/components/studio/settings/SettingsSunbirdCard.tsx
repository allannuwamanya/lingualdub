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
      className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-5"
    >
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-indigo-400" />
          <span>Sunbird AI Regional Cloud Credentials</span>
        </h2>
        <span
          className={`text-xs font-mono font-semibold px-3 py-1 rounded-full ${
            activeToken
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-slate-400 bg-white/[0.05]'
          }`}
        >
          {activeToken ? 'Bearer Token Active' : 'No Token'}
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed">
        Enables production neural TTS, ASR, and Translation across 51+ African languages via api.sunbird.ai cloud infrastructure.
      </p>

      {saveMessage && (
        <div className="p-4 bg-emerald-500/15 rounded-2xl text-sm text-emerald-300 flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      <div className="space-y-3">
        <label htmlFor="sunbird-jwt-token" className="text-xs font-semibold text-slate-300 block">
          Bearer Token (JWT)
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              id="sunbird-jwt-token"
              type={showToken ? 'text' : 'password'}
              value={tokenInput}
              onChange={(e) => onTokenInputChange(e.target.value)}
              placeholder="Paste Sunbird JWT Token..."
              className="w-full bg-[#070b14] rounded-xl p-3.5 pr-11 text-sm text-slate-100 font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all h-12"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1 rounded focus-visible:ring-2 focus-visible:ring-indigo-500"
              title={showToken ? 'Hide Token' : 'Show Token'}
              aria-label={showToken ? 'Hide token' : 'Show token'}
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="button"
            onClick={onSaveToken}
            className="h-12 px-7 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shrink-0 cursor-pointer shadow-lg shadow-indigo-600/25 focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Save Credentials
          </button>

          <button
            type="button"
            onClick={onTestSunbird}
            disabled={isTesting}
            className="h-12 px-5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 rounded-xl text-sm font-semibold transition-colors shrink-0 cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Test Connection</span>
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-2xl text-sm flex items-center gap-2.5 mt-2 ${
              testResult.ok
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-rose-500/15 text-rose-300'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="text-xs text-slate-400 pt-1">
          {activeToken ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Token active & configured in local browser storage
            </span>
          ) : (
            <span>No token configured. Local edge models and Web Speech API remain active fallback engines.</span>
          )}
        </div>
      </div>
    </section>
  );
}
