import React from 'react';
import { Play, Pause, RotateCcw, Square, Volume2, VolumeX, Download } from 'lucide-react';
import { useStudioAudio } from '../../context/StudioAudioContext';
import { formatTime } from '../../types/studio';

export default function MasterTransportBar() {
  const {
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    volume,
    speed,
    audioTrackName,
    audioTrackLang,
    audioTrackEngine,
    togglePlayPause,
    replayAudio,
    stopAudio,
    seekAudio,
    changeVolume,
    changeSpeed,
  } = useStudioAudio();

  const FLAG_MAP: Record<string, string> = {
    lug: '🇺🇬', nyn: '🇺🇬', ach: '🇺🇬',
    swa: '🇰🇪', kin: '🇷🇼', som: '🇸🇴',
    yor: '🇳🇬', ibo: '🇳🇬', hau: '🇳🇬', wol: '🇸🇳',
    zul: '🇿🇦', xho: '🇿🇦',
    amh: '🇪🇹', lin: '🇨🇩',
  };
  const flagEmoji = FLAG_MAP[audioTrackLang] || '🌍';

  return (
    <div
      role="region"
      aria-label="Master Audio Transport"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#070b14]/95 backdrop-blur-2xl border-t border-white/[0.08] shadow-dock px-5 sm:px-8 py-3.5"
    >
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Track Info & Equalizer */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white/[0.08] flex items-center justify-center text-slate-200 shrink-0 font-extrabold text-xl">
              {flagEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-base font-extrabold text-white tracking-tight truncate max-w-[200px] sm:max-w-none">
                  {audioTrackName}
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white/[0.08] text-slate-200">
                  {audioTrackEngine}
                </span>
              </div>
              <div className="text-sm font-mono text-slate-300 flex items-center gap-2 mt-0.5 font-medium">
                <span>
                  {formatTime(currentTime)} / {formatTime(duration || 3.0)}
                </span>
                <span className="text-slate-600">•</span>
                <span>16 kHz Mono PCM</span>
              </div>
            </div>
          </div>

          {/* Waveform Equalizer Animation */}
          <div className="flex items-end gap-1.5 h-7 px-3" aria-hidden="true">
            {[45, 85, 60, 95, 75, 90, 50, 80].map((h, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isPlaying ? 'bg-indigo-400' : 'bg-slate-700'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(25, (h * ((i % 3) + 1)) % 100)}%` : '25%',
                }}
              />
            ))}
          </div>
        </div>

        {/* Transport Controls & Timeline Scrubber */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-center">
          <button
            type="button"
            onClick={replayAudio}
            disabled={!audioUrl}
            className="w-12 h-12 rounded-2xl text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
            title="Replay from start"
            aria-label="Replay audio track"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            disabled={!audioUrl}
            className="w-14 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/35 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause audio track' : 'Play audio track'}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 ml-0.5 fill-current" />}
          </button>

          <button
            type="button"
            onClick={stopAudio}
            disabled={!audioUrl && !isPlaying}
            className="w-12 h-12 rounded-2xl text-slate-300 hover:text-rose-400 bg-white/[0.06] hover:bg-rose-500/15 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
            title="Stop audio"
            aria-label="Stop audio track"
          >
            <Square className="w-5 h-5" />
          </button>

          {/* Timeline Scrubber */}
          <div className="flex items-center gap-3 w-40 sm:w-64 lg:w-80">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekAudio(parseFloat(e.target.value))}
              disabled={!audioUrl}
              aria-label="Audio scrubber timeline"
              className="w-full h-2.5 bg-[#070b14] rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-30"
            />
          </div>
        </div>

        {/* Speed, Volume & Save WAV Cluster */}
        <div className="hidden lg:flex items-center gap-5">
          {/* Speed Selector */}
          <div className="flex items-center bg-[#070b14] rounded-2xl p-1 text-sm font-bold">
            {[0.8, 1.0, 1.25, 1.5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => changeSpeed(s)}
                className={`h-9 px-3 rounded-xl transition-colors cursor-pointer ${
                  speed === s ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 text-slate-300">
            <button
              type="button"
              onClick={() => changeVolume(volume === 0 ? 1 : 0)}
              className="p-1.5 hover:text-white transition-colors cursor-pointer"
              aria-label={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              aria-label="Playback volume"
              className="w-24 h-2 bg-[#070b14] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>

          {/* Download WAV button */}
          <button
            type="button"
            onClick={() => {
              if (!audioUrl) return;
              const a = document.createElement('a');
              a.href = audioUrl;
              a.download = `${audioTrackName.replace(/\s+/g, '_')}_${audioTrackLang}.wav`;
              a.click();
            }}
            disabled={!audioUrl}
            className="flex items-center gap-2.5 h-12 px-5 rounded-2xl text-sm font-bold bg-white/[0.08] hover:bg-white/[0.14] disabled:bg-white/[0.02] text-slate-100 disabled:text-slate-600 transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm"
            title="Download WAV track"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Save WAV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
