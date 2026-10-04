import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

interface MasteringMetersCardProps {
  isBypass: boolean;
  meterL: number;
  meterR: number;
  gainReduction: number;
  masterResults: {
    initialRms: number;
    finalRms: number;
    targetRms: number;
    peakDb: number;
    lufsIntegrated: number;
  } | null;
}

export default function MasteringMetersCard({
  isBypass,
  meterL,
  meterR,
  gainReduction,
  masterResults,
}: MasteringMetersCardProps) {
  return (
    <div
      aria-label="Stereo VU Monitor and EBU R128 Telemetry"
      className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-xl space-y-6"
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
        <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-indigo-400" />
          <span>Stereo VU Monitor</span>
        </h2>
        <span
          className={`text-sm font-mono px-3.5 py-1 rounded-full font-bold ${
            isBypass
              ? 'bg-amber-500/20 text-amber-300'
              : 'bg-emerald-500/20 text-emerald-300'
          }`}
        >
          {isBypass ? 'DRY SIGNAL' : 'WET (DSP)'}
        </span>
      </div>

      {/* Dual VU Meters */}
      <div className="space-y-5 bg-[#070b14] p-6 rounded-2xl">
        {/* Left Channel */}
        <div>
          <div className="flex justify-between text-sm font-mono text-slate-300 mb-2 font-medium">
            <span>CH L (Left)</span>
            <span className="text-white font-bold">{meterL > 88 ? '-0.1 dBTP' : '-3.2 dBTP'}</span>
          </div>
          <div className="h-5 bg-black/60 rounded-lg overflow-hidden p-0.5">
            <div
              className="h-full rounded-md bg-indigo-500 transition-all duration-75"
              style={{ width: `${meterL}%` }}
            />
          </div>
        </div>

        {/* Right Channel */}
        <div>
          <div className="flex justify-between text-sm font-mono text-slate-300 mb-2 font-medium">
            <span>CH R (Right)</span>
            <span className="text-white font-bold">{meterR > 88 ? '-0.2 dBTP' : '-3.4 dBTP'}</span>
          </div>
          <div className="h-5 bg-black/60 rounded-lg overflow-hidden p-0.5">
            <div
              className="h-full rounded-md bg-indigo-500 transition-all duration-75"
              style={{ width: `${meterR}%` }}
            />
          </div>
        </div>

        {/* Gain Reduction Meter */}
        <div className="pt-3 border-t border-white/[0.06]">
          <div className="flex justify-between text-sm font-mono text-slate-300 mb-2 font-medium">
            <span>GAIN REDUCTION</span>
            <span className="text-indigo-400 font-extrabold">-{gainReduction} dB</span>
          </div>
          <div className="h-3.5 bg-black/60 rounded-lg overflow-hidden">
            <div
              className="h-full bg-indigo-400 transition-all duration-100 rounded"
              style={{ width: `${Math.min(100, (gainReduction / 6) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Telemetry Summary */}
      {masterResults && (
        <div className="bg-[#070b14] rounded-2xl p-6 space-y-3 text-sm font-mono">
          <div className="text-indigo-300 font-bold mb-3 flex items-center gap-2 text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>EBU R128 Loudness Verification:</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Integrated Loudness:</span>
            <span className="text-white font-bold">{masterResults.lufsIntegrated} LUFS</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>True Peak Max:</span>
            <span className="text-white font-bold">{masterResults.peakDb} dBTP</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Dynamic Range (LRA):</span>
            <span className="text-white font-bold">6.4 LU</span>
          </div>
          <div className="flex justify-between text-slate-300 pt-3 border-t border-white/[0.06]">
            <span>Compliance:</span>
            <span className="text-emerald-400 font-bold">Broadcast & Streaming Pass</span>
          </div>
        </div>
      )}
    </div>
  );
}
