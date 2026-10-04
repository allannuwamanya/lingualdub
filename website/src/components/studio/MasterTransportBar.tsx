import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Volume2,
  VolumeX,
  Download,
} from 'lucide-react';
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

  const flagEmoji =
    audioTrackLang === 'lug' || audioTrackLang === 'nyn' || audioTrackLang === 'ach'
      ? '🇺🇬'
      : audioTrackLang === 'swa'
      ? '🇰🇪'
      : audioTrackLang === 'yor' || audioTrackLang === 'ibo' || audioTrackLang === 'hau'
      ? '🇳🇬'
      : audioTrackLang === 'zul' || audioTrackLang === 'xho'
      ? '🇿🇦'
      : audioTrackLang === 'amh'
      ? '🇪🇹'
      : audioTrackLang === 'kin'
      ? '🇷🇼'
      : '🌍';

  return (
    <div
      role="region"
      aria-label="Master Audio Transport"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#070b14]/95 backdrop-blur-2xl border-t border-white/[0.06] shadow-dock px-4 sm:px-6 py-3"
    >
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Track Info & Equalizer */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center text-slate-200 shrink-0 font-bold text-lg">
              {flagEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold text-white tracking-tight truncate max-w-[200px] sm:max-w-none">
                  {audioTrackName}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/[0.06] text-slate-300">
                  {audioTrackEngine}
                </span>
              </div>
              <div className="text-xs sm:text-sm font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                <span>
                  {formatTime(currentTime)} / {formatTime(duration || 3.0)}
                </span>
                <span>•</span>
                <span>16 kHz Mono PCM</span>
              </div>
            </div>
          </div>

          {/* Waveform Equalizer Animation */}
          <div className="flex items-end gap-1.5 h-6 px-3" aria-hidden="true">
            {[45, 85, 60, 95, 75, 90, 50, 80].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
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
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 transition-colors cursor-pointer"
            title="Replay from start"
            aria-label="Replay audio track"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            disabled={!audioUrl}
            className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause audio track' : 'Play audio track'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={stopAudio}
            disabled={!audioUrl && !isPlaying}
            className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/[0.06] disabled:opacity-30 transition-colors cursor-pointer"
            title="Stop audio"
            aria-label="Stop audio track"
          >
            <Square className="w-4 h-4" />
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
              className="w-full h-2 bg-[#070b14] rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-30"
            />
          </div>
        </div>

        {/* Speed, Volume & Save WAV Cluster */}
        <div className="hidden lg:flex items-center gap-5">
          {/* Speed Selector */}
          <div className="flex items-center bg-[#070b14] rounded-xl p-1 text-xs font-semibold">
            {[0.8, 1.0, 1.25, 1.5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => changeSpeed(s)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  speed === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2.5 text-slate-400">
            <button
              type="button"
              onClick={() => changeVolume(volume === 0 ? 1 : 0)}
              className="p-1.5 hover:text-white transition-colors cursor-pointer"
              aria-label={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              aria-label="Playback volume"
              className="w-20 h-1.5 bg-[#070b14] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>

          {/* Download WAV button */}
          {audioUrl ? (
            <a
              href={audioUrl}
              download={`${audioTrackName.replace(/\s+/g, '_')}_${audioTrackLang}.wav`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.12] text-slate-200 transition-all cursor-pointer shadow-sm"
              title="Download WAV track"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Save WAV</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 bg-white/[0.02] cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>Save WAV</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
