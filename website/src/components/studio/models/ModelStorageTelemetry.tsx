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
      className="grid grid-cols-1 md:grid-cols-3 gap-5"
    >
      {/* Host Compute Card */}
      <div className="p-5 bg-[#101726] rounded-2xl shadow-md flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Cpu className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-mono text-slate-400">Host Compute Accelerator</div>
          <div className="text-sm font-bold text-white truncate mt-0.5">
            {hardware
              ? `${hardware.device_name} (${hardware.accelerator.toUpperCase()})`
              : 'Detecting accelerator...'}
          </div>
          <div className="text-xs text-indigo-300 font-mono mt-0.5">
            Quant: {hardware?.recommended_gguf_quant || 'Q4_K_M (Fastest)'}
          </div>
        </div>
      </div>

      {/* Local Storage Footprint Card */}
      <div className="p-5 bg-[#101726] rounded-2xl shadow-md flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
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

      {/* Cached Pipelines Counter Card */}
      <div className="p-5 bg-[#101726] rounded-2xl shadow-md flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs font-mono text-slate-400">Cached Pipelines</div>
          <div className="text-sm font-bold text-white mt-0.5">
            {downloadedCount} of {totalModelsCount} Weights Ready
          </div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">
            Zero-latency offline ready
          </div>
        </div>
      </div>
    </section>
  );
}
