export interface MasteringPreset {
  id: string;
  name: string;
  targetLufs: number;
  duckRatio: number;
  highPass: boolean;
  desc: string;
}

export const MASTERING_PRESETS: MasteringPreset[] = [
  {
    id: 'streaming',
    name: 'Streaming (Spotify/Apple)',
    targetLufs: -14,
    duckRatio: -12,
    highPass: true,
    desc: 'Optimal -14 LUFS integrated with -1.0 dBTP true-peak ceiling.',
  },
  {
    id: 'broadcast',
    name: 'EBU R128 Broadcast',
    targetLufs: -23,
    duckRatio: -16,
    highPass: true,
    desc: 'European & African Television broadcast compliance (-23 LUFS ±0.5).',
  },
  {
    id: 'podcast',
    name: 'Podcast & Mobile USSD',
    targetLufs: -16,
    duckRatio: -10,
    highPass: true,
    desc: 'Optimized voice clarity for low-cost phone speakers and earbuds.',
  },
  {
    id: 'loud',
    name: 'Loud Commercial / Club',
    targetLufs: -9,
    duckRatio: -6,
    highPass: false,
    desc: 'Aggressive density with soft-clip saturation for radio ads.',
  },
];
