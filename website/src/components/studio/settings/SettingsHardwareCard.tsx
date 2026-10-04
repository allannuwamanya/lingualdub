import React from 'react';
import { Cpu } from 'lucide-react';
import type { HardwareInfo } from '../../../types/studio';

interface SettingsHardwareCardProps {
  hardware: HardwareInfo | null;
}

export default function SettingsHardwareCard({
  hardware,
}: SettingsHardwareCardProps) {
  return (
    <section
      aria-label="Host Hardware Accelerator Telemetry"
      className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-xl space-y-6"
    >
      <div className="flex items-center gap-3 border-b border-white/[0.06] pb-5">
        <Cpu className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-black text-white tracking-wide">
          Host Hardware Accelerator Telemetry
        </h2>
      </div>

      {hardware ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 font-mono text-sm">
          <div className="p-5 bg-[#070b14] rounded-2xl shadow-sm">
            <div className="text-slate-400 mb-1.5 font-sans text-sm font-medium">Accelerator</div>
            <div className="text-lg font-bold text-emerald-400">
              {hardware.accelerator.toUpperCase()}
            </div>
          </div>

          <div className="p-5 bg-[#070b14] rounded-2xl shadow-sm">
            <div className="text-slate-400 mb-1.5 font-sans text-sm font-medium">Compute Tier</div>
            <div className="text-lg font-bold text-indigo-300">{hardware.compute_class}</div>
          </div>

          <div className="p-5 bg-[#070b14] rounded-2xl shadow-sm">
            <div className="text-slate-400 mb-1.5 font-sans text-sm font-medium">Host Device</div>
            <div className="text-lg font-bold text-white truncate">{hardware.device_name}</div>
          </div>

          <div className="p-5 bg-[#070b14] rounded-2xl shadow-sm">
            <div className="text-slate-400 mb-1.5 font-sans text-sm font-medium">Host RAM Available</div>
            <div className="text-lg font-bold text-white">{hardware.system_ram_mb} MB</div>
          </div>

          <div className="p-5 bg-[#070b14] rounded-2xl shadow-sm">
            <div className="text-slate-400 mb-1.5 font-sans text-sm font-medium">VRAM Allocation</div>
            <div className="text-lg font-bold text-white">{hardware.vram_mb} MB</div>
          </div>

          <div className="p-5 bg-[#070b14] rounded-2xl shadow-sm">
            <div className="text-slate-400 mb-1.5 font-sans text-sm font-medium">Optimal Quantization</div>
            <div className="text-lg font-bold text-amber-300">
              {hardware.recommended_gguf_quant}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-slate-300 text-base py-4 font-medium">Checking hardware probe...</div>
      )}
    </section>
  );
}
