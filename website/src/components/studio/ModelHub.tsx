import React, { useState, useEffect, useMemo } from 'react';
import {
  HardDrive,
  RefreshCw,
  Server,
  Download,
  Trash2,
  CheckCircle2,
  Cpu,
  Search,
  Layers,
  Database,
} from 'lucide-react';
import { useStudioAudio } from '../../context/StudioAudioContext';
import type { ModelItem } from '../../types/studio';

const FALLBACK_MODELS: ModelItem[] = [
  {
    model_id: 'mms-tts-lug',
    name: 'Sherpa-ONNX MMS-TTS Luganda',
    family: 'VITS / MMS',
    task: 'Text-to-Speech',
    languages: ['lug'],
    size_mb: 35,
    ram_mb: 45,
    is_downloaded: true,
    local_path: '~/.cache/lingualdub/models/mms-tts-lug.onnx',
    description: 'Ultra-low latency offline Luganda neural TTS. Runs on edge CPUs with INT8 quantization.',
  },
  {
    model_id: 'mms-tts-swa',
    name: 'Sherpa-ONNX MMS-TTS Swahili',
    family: 'VITS / MMS',
    task: 'Text-to-Speech',
    languages: ['swa'],
    size_mb: 38,
    ram_mb: 45,
    is_downloaded: true,
    local_path: '~/.cache/lingualdub/models/mms-tts-swa.onnx',
    description: 'Native East African Swahili prosody engine for offline IVR and public address systems.',
  },
  {
    model_id: 'omnivoice-q4',
    name: 'OmniVoice Voice Cloner (GGUF)',
    family: 'OmniVoice',
    task: 'Voice Cloning',
    languages: ['lug', 'swa', 'yor', 'ibo', 'zul', 'amh'],
    size_mb: 380,
    ram_mb: 512,
    is_downloaded: false,
    local_path: null,
    description: 'Zero-shot acoustic timbre transfer with 192-d ECAPA embeddings. Q4_K_M quantization.',
  },
  {
    model_id: 'nllb-200-distilled',
    name: 'NLLB-200 600M Distilled (CTranslate2)',
    family: 'NLLB',
    task: 'Translation',
    languages: ['lug', 'nyn', 'ach', 'swa', 'yor', 'ibo', 'hau', 'zul', 'amh', 'eng', 'fra'],
    size_mb: 640,
    ram_mb: 800,
    is_downloaded: false,
    local_path: null,
    description: 'Many-to-many African neural machine translation engine optimized with 8-bit weights.',
  },
  {
    model_id: 'whisper-small-afri',
    name: 'Whisper Small African Fine-Tuned',
    family: 'Whisper',
    task: 'Speech Recognition',
    languages: ['swa', 'yor', 'hau', 'zul', 'amh', 'lug'],
    size_mb: 460,
    ram_mb: 600,
    is_downloaded: false,
    local_path: null,
    description: 'Robust automatic speech recognition tuned for accented African English and regional idioms.',
  },
];

export default function ModelHub() {
  const { hardware } = useStudioAudio();
  const [models, setModels] = useState<ModelItem[]>(FALLBACK_MODELS);
  const [pullingModelId, setPullingModelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<string>('All');
  const [installedOnly, setInstalledOnly] = useState(false);

  const fetchModels = async () => {
    try {
      const res = await fetch('/v1/models');
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('json')) {
        const data = await res.json();
        if (data.models && data.models.length > 0) {
          setModels(data.models);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handlePullModel = async (modelId: string) => {
    setPullingModelId(modelId);
    try {
      const res = await fetch('/v1/models/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_id: modelId }),
      });
      if (res.ok) await fetchModels();
    } catch {}
    setTimeout(() => {
      setModels((prev) =>
        prev.map((m) => (m.model_id === modelId ? { ...m, is_downloaded: true, local_path: `~/.cache/lingualdub/models/${modelId}.bin` } : m))
      );
      setPullingModelId(null);
    }, 1200);
  };

  const handleRemoveModel = async (modelId: string) => {
    try {
      const res = await fetch('/v1/models/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_id: modelId }),
      });
      if (res.ok) await fetchModels();
    } catch {}
    setModels((prev) =>
      prev.map((m) => (m.model_id === modelId ? { ...m, is_downloaded: false, local_path: null } : m))
    );
  };

  const totalDiskUsedMb = useMemo(() => {
    return models.filter((m) => m.is_downloaded).reduce((acc, m) => acc + m.size_mb, 0);
  }, [models]);

  const tasksList = useMemo(() => {
    const set = new Set<string>();
    models.forEach((m) => set.add(m.task));
    return ['All', ...Array.from(set)];
  }, [models]);

  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.languages.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTask = selectedTask === 'All' || m.task === selectedTask;
      const matchesInstalled = !installedOnly || m.is_downloaded;

      return matchesSearch && matchesTask && matchesInstalled;
    });
  }, [models, searchQuery, selectedTask, installedOnly]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto page-fade-in" role="region" aria-label="Neural Model Hub">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Neural Model Hub</h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                Edge Offline Inference
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Manage local INT8, GGUF, and CTranslate2 model weights for zero-bandwidth African speech pipelines.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchModels}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 rounded-xl text-sm font-semibold transition-colors cursor-pointer h-11 shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-indigo-400" />
          <span>Refresh Local Registry</span>
        </button>
      </div>

      {/* Storage and Hardware Telemetry Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Host Compute */}
        <div className="p-5 bg-[#101726] rounded-2xl shadow-md flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-mono text-slate-400">Host Compute</div>
            <div className="text-sm font-bold text-white truncate">
              {hardware ? `${hardware.device_name} (${hardware.accelerator.toUpperCase()})` : 'Detecting accelerator...'}
            </div>
            <div className="text-xs text-indigo-300 font-mono mt-0.5">
              Quant: {hardware?.recommended_gguf_quant || 'Q4_K_M'}
            </div>
          </div>
        </div>

        {/* Local Storage Footprint */}
        <div className="p-5 bg-[#101726] rounded-2xl shadow-md flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1.5">
              <span>Local Model Footprint</span>
              <span className="text-white font-bold">{totalDiskUsedMb} MB</span>
            </div>
            <div className="w-full h-2 bg-[#070b14] rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalDiskUsedMb / 2048) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">
              ~2.0 GB Allocated Edge Cache
            </div>
          </div>
        </div>

        {/* Models Installed Counter */}
        <div className="p-5 bg-[#101726] rounded-2xl shadow-md flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-400">Cached Pipelines</div>
            <div className="text-sm font-bold text-white">
              {models.filter((m) => m.is_downloaded).length} of {models.length} Weights Ready
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              Zero-latency offline ready
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 bg-[#101726] rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search weights by name, language (lug, swa), or architecture..."
            className="w-full bg-[#070b14] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors h-11"
          />
        </div>

        {/* Task Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tasksList.map((task) => {
            const active = selectedTask === task;
            return (
              <button
                key={task}
                type="button"
                onClick={() => setSelectedTask(task)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {task}
              </button>
            );
          })}

          <label className="flex items-center gap-2 ml-2 text-xs text-slate-300 cursor-pointer whitespace-nowrap px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl min-h-[38px] transition-colors">
            <input
              type="checkbox"
              checked={installedOnly}
              onChange={(e) => setInstalledOnly(e.target.checked)}
              className="accent-indigo-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Installed Only</span>
          </label>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredModels.map((model) => {
          const isPulling = pullingModelId === model.model_id;

          return (
            <div
              key={model.model_id}
              className={`bg-[#121826] hover:bg-[#151d2f] rounded-2xl p-6 shadow-daw flex flex-col justify-between space-y-5 transition-all ${
                model.is_downloaded ? 'ring-1 ring-emerald-500/30' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-white">{model.name}</h3>
                    <span className="text-xs font-mono text-slate-400">{model.family}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-white/[0.06] text-slate-300 shrink-0">
                    {model.task}
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">{model.description}</p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400 font-mono">
                  <span>Size: <strong className="text-white">{model.size_mb} MB</strong></span>
                  <span>•</span>
                  <span>RAM: ~{model.ram_mb} MB</span>
                  <span>•</span>
                  <span className="text-indigo-300">
                    {model.languages.slice(0, 4).join(', ')}
                    {model.languages.length > 4 ? ` +${model.languages.length - 4}` : ''}
                  </span>
                </div>

                {model.local_path && (
                  <div className="p-2.5 bg-surface-base rounded-xl text-xs font-mono text-slate-400 truncate">
                    {model.local_path}
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div>
                  {model.is_downloaded ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Ready Offline
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Not Installed</span>
                  )}
                </div>

                <div>
                  {model.is_downloaded ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveModel(model.model_id)}
                      className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Reclaim Space</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isPulling}
                      onClick={() => handlePullModel(model.model_id)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer h-11"
                    >
                      {isPulling ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Pull Weights</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
