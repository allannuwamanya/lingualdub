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
      className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-5"
    >
      <h2 className="text-base font-bold text-white flex items-center gap-2.5">
        <Cpu className="w-5 h-5 text-indigo-400" />
        <span>Host Hardware Accelerator Telemetry</span>
      </h2>

      {hardware ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 bg-[#070b14] rounded-2xl shadow-sm">
            <div className="text-slate-400 mb-1 font-sans text-xs">Accelerator</div>
            <div className="text-base font-bold text-emerald-400">
              {hardware.accelerator.toUpperCase()}
            </div>
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
            <div className="text-base font-bold text-amber-400">
              {hardware.recommended_gguf_quant}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-slate-400 text-sm py-4">Checking hardware probe...</div>
      )}
    </section>
  );
}
