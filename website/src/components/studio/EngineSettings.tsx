import React, { useState } from 'react';
import {
  Cpu,
  Globe,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Server,
  HardDrive,
  Clock,
  ShieldCheck,
  Zap,
  Activity,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useStudioAudio } from '../../context/StudioAudioContext';
import { SUNBIRD_KEY_STORAGE, SUNBIRD_KEY_EVENT } from '../../lib/config';

export default function EngineSettings() {
  const { hardware, sunbirdApiKey, isLocalServerRunning } = useStudioAudio();

  const [tokenInput, setTokenInput] = useState(sunbirdApiKey);
  const [showToken, setShowToken] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Connection testing states
  const [isTestingSunbird, setIsTestingSunbird] = useState(false);
  const [sunbirdTestResult, setSunbirdTestResult] = useState<{
    ok: boolean;
    latencyMs: number;
    message: string;
  } | null>(null);

  const [isProbingBackend, setIsProbingBackend] = useState(false);
  const [backendProbeResult, setBackendProbeResult] = useState<{
    ok: boolean;
    version?: string;
    latencyMs: number;
    message: string;
  } | null>(null);

  const handleSaveToken = () => {
    const trimmed = tokenInput.trim();
    if (trimmed) {
      localStorage.setItem(SUNBIRD_KEY_STORAGE, trimmed);
    } else {
      localStorage.removeItem(SUNBIRD_KEY_STORAGE);
    }
    window.dispatchEvent(new Event(SUNBIRD_KEY_EVENT));
    setSaveMessage('Sunbird AI credentials saved and active.');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleTestSunbird = async () => {
    const token = tokenInput.trim() || sunbirdApiKey;
    if (!token) {
      setSunbirdTestResult({
        ok: false,
        latencyMs: 0,
        message: 'No Sunbird JWT token entered.',
      });
      return;
    }

    setIsTestingSunbird(true);
    setSunbirdTestResult(null);
    const start = performance.now();

    try {
      const res = await fetch('https://api.sunbird.ai/tasks/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          source_language: 'eng',
          target_language: 'lug',
          text: 'Hello world',
        }),
      });

      const latency = Math.round(performance.now() - start);

      if (res.ok) {
        setSunbirdTestResult({
          ok: true,
          latencyMs: latency,
          message: `Sunbird Cloud API active & responsive (${latency}ms roundtrip).`,
        });
      } else {
        const text = await res.text().catch(() => '');
        setSunbirdTestResult({
          ok: false,
          latencyMs: latency,
          message: `Sunbird returned HTTP ${res.status}: ${text.slice(0, 100) || 'Unauthorized/Quota exceeded'}`,
        });
      }
    } catch (err: any) {
      const latency = Math.round(performance.now() - start);
      setSunbirdTestResult({
        ok: false,
        latencyMs: latency,
        message: `Network probe failed: ${err.message || 'CORS / Offline'}. Verify connection.`,
      });
    } finally {
      setIsTestingSunbird(false);
    }
  };

  const handleProbeBackend = async () => {
    setIsProbingBackend(true);
    setBackendProbeResult(null);
    const start = performance.now();

    try {
      const res = await fetch('/v1/health');
      const latency = Math.round(performance.now() - start);

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setBackendProbeResult({
          ok: true,
          latencyMs: latency,
          version: data.version || '0.1.0',
          message: `Local LingualDub Python Daemon on :8000 is healthy (${latency}ms).`,
        });
      } else {
        setBackendProbeResult({
          ok: false,
          latencyMs: latency,
          message: `Local server returned HTTP ${res.status}.`,
        });
      }
    } catch {
      const latency = Math.round(performance.now() - start);
      setBackendProbeResult({
        ok: false,
        latencyMs: latency,
        message: 'Local server not reached on :8000. Running in client-side fallback mode.',
      });
    } finally {
      setIsProbingBackend(false);
    }
  };

  const handleClearCache = () => {
    if (confirm('Clear local audio cache and reset audio preferences?')) {
      localStorage.removeItem('lingualdub_cached_takes');
      setSaveMessage('Local audio session cache cleared.');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto page-fade-in" role="region" aria-label="Engine Settings & System Diagnostics">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-7 bg-[#101726] rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Engine & Hardware Diagnostics</h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300">
                Inference Stack
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1">
              Configure inference backend endpoints, hardware compute thresholds, and API authentication credentials.
            </p>
          </div>
        </div>

        {/* Quick Diagnostics Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleProbeBackend}
            disabled={isProbingBackend}
            className="px-5 py-3 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer h-11 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProbingBackend ? 'animate-spin' : ''}`} />
            <span>Probe Local Daemon</span>
          </button>
        </div>
      </div>

      {/* Backend Probe Result Banner */}
      {backendProbeResult && (
        <div
          className={`p-5 rounded-2xl text-sm flex items-start gap-3.5 transition-all shadow-md ${
            backendProbeResult.ok
              ? 'bg-emerald-500/15 text-emerald-300'
              : 'bg-amber-500/15 text-amber-300'
          }`}
        >
          {backendProbeResult.ok ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>
            <strong className="block font-bold text-white">{backendProbeResult.message}</strong>
            <span className="text-xs text-slate-300 font-mono mt-1 block">
              Roundtrip: {backendProbeResult.latencyMs}ms • Endpoint: http://127.0.0.1:8000/v1/health
            </span>
          </div>
        </div>
      )}

      {/* Sunbird AI Regional Cloud Token */}
      <div className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-indigo-400" />
            <span>Sunbird AI Regional Cloud Credentials</span>
          </h2>
          <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full">
            {sunbirdApiKey ? 'Bearer Token Active' : 'No Token'}
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
          <label className="text-xs font-semibold text-slate-300 block">Bearer Token (JWT)</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type={showToken ? 'text' : 'password'}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste Sunbird JWT Token..."
                className="w-full bg-[#070b14] rounded-xl p-3.5 pr-11 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40 h-12"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                title={showToken ? 'Hide Token' : 'Show Token'}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveToken}
              className="h-12 px-7 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shrink-0 cursor-pointer shadow-lg shadow-indigo-600/25"
            >
              Save Credentials
            </button>

            <button
              type="button"
              onClick={handleTestSunbird}
              disabled={isTestingSunbird}
              className="h-12 px-5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 rounded-xl text-sm font-semibold transition-colors shrink-0 cursor-pointer flex items-center gap-2"
            >
              {isTestingSunbird ? (
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

          {sunbirdTestResult && (
            <div
              className={`p-4 rounded-2xl text-sm flex items-center gap-2.5 mt-2 ${
                sunbirdTestResult.ok
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'bg-rose-500/15 text-rose-300'
              }`}
            >
              {sunbirdTestResult.ok ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>{sunbirdTestResult.message}</span>
            </div>
          )}

          <div className="text-xs text-slate-400 pt-1">
            {sunbirdApiKey ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Token active & configured in local browser storage
              </span>
            ) : (
              <span>No token configured. Local edge models and Web Speech API remain active fallback engines.</span>
            )}
          </div>
        </div>
      </div>

      {/* Hardware Telemetry Card */}
      <div className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <span>Host Hardware Accelerator Telemetry</span>
        </h2>
        {hardware ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-[#070b14] rounded-2xl shadow-sm">
              <div className="text-slate-400 mb-1 font-sans text-xs">Accelerator</div>
              <div className="text-base font-bold text-emerald-400">{hardware.accelerator.toUpperCase()}</div>
            </div>
            <div className="p-4 bg-[#070b14] rounded-2xl shadow-sm">
              <div className="text-slate-400 mb-1 font-sans text-xs">Compute Tier</div>
              <div className="text-base font-bold text-indigo-400">{hardware.compute_class}</div>
            </div>
            <div className="p-4 bg-[#070b14] rounded-2xl shadow-sm">
              <div className="text-slate-400 mb-1 font-sans text-xs">Host Device</div>
              <div className="text-base font-bold text-white truncate">{hardware.device_name}</div>
            </div>
            <div className="p-4 bg-[#070b14] rounded-2xl shadow-sm">
              <div className="text-slate-400 mb-1 font-sans text-xs">Host RAM Available</div>
              <div className="text-base font-bold text-white">{hardware.system_ram_mb} MB</div>
            </div>
            <div className="p-4 bg-[#070b14] rounded-2xl shadow-sm">
              <div className="text-slate-400 mb-1 font-sans text-xs">VRAM Allocation</div>
              <div className="text-base font-bold text-white">{hardware.vram_mb} MB</div>
            </div>
            <div className="p-4 bg-[#070b14] rounded-2xl shadow-sm">
              <div className="text-slate-400 mb-1 font-sans text-xs">Optimal Quantization</div>
              <div className="text-base font-bold text-amber-400">{hardware.recommended_gguf_quant}</div>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-sm py-4">Checking hardware probe...</div>
        )}
      </div>

      {/* Edge Latency & Cache Thresholds */}
      <div className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>Acoustic Latency & Storage Buffers</span>
          </h2>
          <button
            type="button"
            onClick={handleClearCache}
            className="text-xs text-rose-400 hover:text-rose-300 font-sans flex items-center gap-1.5 cursor-pointer bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Flush Cache</span>
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-white/[0.05]">
            <span className="text-slate-300">Model Cache Directory:</span>
            <span className="text-slate-100 font-mono">~/.cache/lingualdub/models</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/[0.05]">
            <span className="text-slate-300">Duplex Barge-In Interruption Window:</span>
            <span className="text-emerald-400 font-bold font-mono">&lt; 250 ms</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/[0.05]">
            <span className="text-slate-300">Audio Sampling Standard:</span>
            <span className="text-slate-100 font-mono">16,000 Hz Mono PCM</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-300">Speaker Embedding Dimensions:</span>
            <span className="text-indigo-400 font-bold font-mono">192-d ECAPA-TDNN</span>
          </div>
        </div>
      </div>
    </div>
  );
}
