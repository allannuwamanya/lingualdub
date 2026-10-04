import React, { useState } from 'react';
import { useStudioAudio } from '../../context/StudioAudioContext';
import { SUNBIRD_KEY_STORAGE, SUNBIRD_KEY_EVENT } from '../../lib/config';
import SettingsHeaderBanner from './settings/SettingsHeaderBanner';
import SettingsBackendStatusCard from './settings/SettingsBackendStatusCard';
import SettingsSunbirdCard from './settings/SettingsSunbirdCard';
import SettingsHardwareCard from './settings/SettingsHardwareCard';
import SettingsAcousticBuffersCard from './settings/SettingsAcousticBuffersCard';

export default function EngineSettings() {
  const { hardware, sunbirdApiKey } = useStudioAudio();

  const [tokenInput, setTokenInput] = useState(sunbirdApiKey);
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
    setSaveMessage('Sunbird AI credentials saved and active across studio.');
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
    if (confirm('Clear local audio session cache and reset audio preferences?')) {
      localStorage.removeItem('lingualdub_cached_takes');
      setSaveMessage('Local audio session cache cleared.');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <div
      className="space-y-6 max-w-5xl mx-auto page-fade-in"
      role="region"
      aria-label="Engine Settings & System Diagnostics"
    >
      <SettingsHeaderBanner
        onProbeBackend={handleProbeBackend}
        isProbing={isProbingBackend}
      />

      {backendProbeResult && (
        <SettingsBackendStatusCard result={backendProbeResult} />
      )}

      <SettingsSunbirdCard
        tokenInput={tokenInput}
        onTokenInputChange={setTokenInput}
        activeToken={sunbirdApiKey}
        onSaveToken={handleSaveToken}
        saveMessage={saveMessage}
        onTestSunbird={handleTestSunbird}
        isTesting={isTestingSunbird}
        testResult={sunbirdTestResult}
      />

      <SettingsHardwareCard hardware={hardware} />

      <SettingsAcousticBuffersCard onClearCache={handleClearCache} />
    </div>
  );
}
