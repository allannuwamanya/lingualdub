import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { HardwareInfo, VoiceOption } from '../types/studio';
import { readSunbirdKey, SUNBIRD_KEY_EVENT } from '../lib/config';
import { useAudioPlayback } from './useAudioPlayback';
import { useVoiceStore } from './useVoiceStore';
import {
  speakBrowserVoice as speakBrowserVoiceService,
  auditionVoiceService,
  synthesizeAudioTrackService,
} from './audioSynthesisService';

interface StudioAudioContextType {
  // Audio state
  audioUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  speed: number;
  audioTrackName: string;
  audioTrackLang: string;
  audioTrackEngine: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;

  // System & Backend state
  hardware: HardwareInfo | null;
  backendOnline: boolean;
  sunbirdApiKey: string;
  voices: VoiceOption[];
  clonedVoices: VoiceOption[];
  notice: string | null;
  setNotice: (notice: string | null) => void;

  // Actions
  addClonedVoice: (voice: VoiceOption) => void;
  removeClonedVoice: (voiceId: string) => void;
  playTrack: (url: string, name: string, lang: string, engine: string) => void;
  togglePlayPause: () => void;
  replayAudio: () => void;
  stopAudio: () => void;
  seekAudio: (time: number) => void;
  changeVolume: (vol: number) => void;
  changeSpeed: (spd: number) => void;
  speakBrowserVoice: (text: string, lang?: string, gender?: string, rate?: number) => void;
  auditionVoice: (voice: VoiceOption) => Promise<void>;
  synthesizeAudioTrack: (params: {
    text: string;
    voiceId: string;
    language: string;
    engine: string;
    speed: number;
  }) => Promise<{ success: boolean; url?: string; fallback?: boolean; error?: string }>;
}

const StudioAudioContext = createContext<StudioAudioContextType | undefined>(undefined);

export function StudioAudioProvider({ children }: { children: ReactNode }) {
  const playback = useAudioPlayback();
  const voiceStore = useVoiceStore();

  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [sunbirdApiKey, setSunbirdApiKey] = useState<string>(() => readSunbirdKey());

  useEffect(() => {
    const handleKeyUpdated = () => setSunbirdApiKey(readSunbirdKey());
    window.addEventListener(SUNBIRD_KEY_EVENT, handleKeyUpdated);
    return () => window.removeEventListener(SUNBIRD_KEY_EVENT, handleKeyUpdated);
  }, []);

  useEffect(() => {
    fetch('/v1/system/probe')
      .then((res) => {
        const cType = res.headers.get('content-type') || '';
        return res.ok && cType.includes('json') ? res.json() : Promise.reject();
      })
      .then((data: HardwareInfo) => {
        setHardware(data);
        setBackendOnline(true);
      })
      .catch(() => {
        setHardware(null);
        setBackendOnline(false);
      });
  }, []);

  const speakBrowserVoice = (
    text: string,
    lang: string = 'sw',
    gender: string = 'Male',
    playbackSpeed: number = 1.0
  ) => {
    speakBrowserVoiceService(text, lang, gender, playbackSpeed, playback.setIsPlaying);
  };

  const auditionVoice = async (voice: VoiceOption) => {
    await auditionVoiceService({
      voice,
      sunbirdApiKey,
      playTrack: playback.playTrack,
      speakFallback: () => {
        playback.setAudioTrackName(`${voice.name} (${voice.dialect || voice.language})`);
        playback.setAudioTrackLang(voice.language);
        playback.setAudioTrackEngine('Browser Voice');
        speakBrowserVoice(voice.language, voice.gender, 1.0);
      },
    });
  };

  const synthesizeAudioTrack = async ({
    text,
    voiceId,
    language,
    engine,
    speed: pacingSpeed,
  }: {
    text: string;
    voiceId: string;
    language: string;
    engine: string;
    speed: number;
  }) => {
    setNotice(null);
    const activeVoice = voiceStore.voices.find((v) => v.voice_id === voiceId);
    return synthesizeAudioTrackService({
      text,
      voiceId,
      language,
      engine,
      speed: pacingSpeed,
      sunbirdApiKey,
      voices: voiceStore.voices,
      playTrack: playback.playTrack,
      onFallback: (displayName) => {
        playback.setAudioTrackName(displayName);
        playback.setAudioTrackLang(language);
        playback.setAudioTrackEngine('Browser Voice');
        setNotice(
          engine === 'sunbird' && !sunbirdApiKey
            ? 'No Sunbird API key configured. Browser voice used as fallback. Add a key (top right) for native Luganda, Runyankore and Acholi.'
            : engine === 'browser'
            ? 'Generated with your browser’s speech engine.'
            : 'The selected engine was offline, so your browser’s speech engine was used instead.'
        );
        speakBrowserVoice(text, language, activeVoice?.gender || 'Male', pacingSpeed);
      },
    });
  };

  return (
    <StudioAudioContext.Provider
      value={{
        ...playback,
        hardware,
        backendOnline,
        sunbirdApiKey,
        voices: voiceStore.voices,
        clonedVoices: voiceStore.clonedVoices,
        notice,
        setNotice,
        addClonedVoice: voiceStore.addClonedVoice,
        removeClonedVoice: voiceStore.removeClonedVoice,
        speakBrowserVoice,
        auditionVoice,
        synthesizeAudioTrack,
      }}
    >
      {children}
      <audio
        ref={playback.audioRef}
        onTimeUpdate={() => {
          if (playback.audioRef.current) playback.setCurrentTime(playback.audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (playback.audioRef.current) playback.setDuration(playback.audioRef.current.duration);
        }}
        onEnded={() => {
          playback.setIsPlaying(false);
          playback.setCurrentTime(0);
        }}
        onError={() => playback.setIsPlaying(false)}
        className="hidden"
      />
    </StudioAudioContext.Provider>
  );
}

export function useStudioAudio() {
  const context = useContext(StudioAudioContext);
  if (!context) {
    throw new Error('useStudioAudio must be used within a StudioAudioProvider');
  }
  return context;
}
