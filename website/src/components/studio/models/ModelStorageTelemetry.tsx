import React from 'react';
import { Cpu, Database, Layers } from 'lucide-react';
import type { HardwareInfo } from '../../../types/studio';

interface ModelStorageTelemetryProps {
  hardware: HardwareInfo | null;
  totalDiskUsedMb: number;
  downloadedCount: number;
  totalModelsCount: number;
}

export default function ModelStorageTelemetry({
  hardware,
  totalDiskUsedMb,
  downloadedCount,
  totalModelsCount,
}: ModelStorageTelemetryProps) {
  return (
    <section
      aria-label="Compute and Storage Telemetry"
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {/* Host Compute Card */}
      <div className="p-6 bg-[#101726] rounded-3xl shadow-xl flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Cpu className="w-7 h-7" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-mono text-slate-400 font-medium">Host Compute Accelerator</div>
          <div className="text-base font-extrabold text-white truncate mt-1">
            {hardware
              ? `${hardware.device_name} (${hardware.accelerator.toUpperCase()})`
              : 'Detecting accelerator...'}
          </div>
          <div className="text-sm text-indigo-300 font-mono mt-1 font-semibold">
            Quant: {hardware?.recommended_gguf_quant || 'Q4_K_M (Fastest)'}
          </div>
        </div>
      </div>

      {/* Local Storage Footprint Card */}
      <div className="p-6 bg-[#101726] rounded-3xl shadow-xl flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Database className="w-7 h-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-center text-sm font-mono text-slate-300 mb-2 font-medium">
            <span>Local Model Footprint</span>
            <span className="text-white font-bold">{totalDiskUsedMb} MB</span>
          </div>
          <div className="w-full h-3 bg-[#070b14] rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (totalDiskUsedMb / 2048) * 100)}%` }}
            />
          </div>
          <div className="text-sm text-slate-400 font-mono mt-1.5 font-medium">
            ~2.0 GB Allocated Edge Cache
          </div>
        </div>
      </div>

      {/* Cached Pipelines Counter Card */}
      <div className="p-6 bg-[#101726] rounded-3xl shadow-xl flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Layers className="w-7 h-7" />
        </div>
        <div>
          <div className="text-sm font-mono text-slate-400 font-medium">Cached Pipelines</div>
          <div className="text-base font-extrabold text-white mt-1">
            {downloadedCount} of {totalModelsCount} Weights Ready
          </div>
          <div className="text-sm text-emerald-400 font-mono mt-1 font-semibold">
            Zero-latency offline ready
          </div>
        </div>
      </div>
    </section>
  );
}
