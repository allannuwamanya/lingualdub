import { useState, useRef } from 'react';

export function useAudioPlayback() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [speed, setSpeed] = useState(1.0);
  const [audioTrackName, setAudioTrackName] = useState<string>('Kigozi (Central Luganda)');
  const [audioTrackLang, setAudioTrackLang] = useState<string>('lug');
  const [audioTrackEngine, setAudioTrackEngine] = useState<string>('Sunbird AI');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTrack = (url: string, name: string, lang: string, engine: string) => {
    setAudioUrl(url);
    setAudioTrackName(name);
    setAudioTrackLang(lang);
    setAudioTrackEngine(engine);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.playbackRate = speed;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const replayAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const seekAudio = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const changeVolume = (newVol: number) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const changeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  return {
    audioUrl,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    speed,
    audioTrackName,
    setAudioTrackName,
    audioTrackLang,
    setAudioTrackLang,
    audioTrackEngine,
    setAudioTrackEngine,
    audioRef,
    playTrack,
    togglePlayPause,
    replayAudio,
    stopAudio,
    seekAudio,
    changeVolume,
    changeSpeed,
  };
}
