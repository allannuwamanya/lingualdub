import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import type { HardwareInfo, VoiceOption } from '../types/studio';
import { PRESET_VOICES, LANGUAGE_SAMPLES } from '../types/studio';
import { readSunbirdKey, SUNBIRD_KEY_EVENT } from '../lib/config';

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
  audioRef: React.RefObject<HTMLAudioElement>;

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
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [voices, setVoices] = useState<VoiceOption[]>(PRESET_VOICES);

  // Persistent Cloned Voices
  const [clonedVoices, setClonedVoices] = useState<VoiceOption[]>(() => {
    try {
      const stored = localStorage.getItem('lingualdub_cloned_voices');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addClonedVoice = (voice: VoiceOption) => {
    setClonedVoices((prev) => {
      const filtered = prev.filter((v) => v.voice_id !== voice.voice_id);
      const next = [{ ...voice, isCloned: true }, ...filtered];
      try {
        localStorage.setItem('lingualdub_cloned_voices', JSON.stringify(next));
      } catch {}
      return next;
    });
    setVoices((prev) => {
      const filtered = prev.filter((v) => v.voice_id !== voice.voice_id);
      return [{ ...voice, isCloned: true }, ...filtered];
    });
  };

  const removeClonedVoice = (voiceId: string) => {
    setClonedVoices((prev) => {
      const next = prev.filter((v) => v.voice_id !== voiceId);
      try {
        localStorage.setItem('lingualdub_cloned_voices', JSON.stringify(next));
      } catch {}
      return next;
    });
    setVoices((prev) => prev.filter((v) => v.voice_id !== voiceId));
  };

  // Active track state
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

  // Sunbird API token from config
  const [sunbirdApiKey, setSunbirdApiKey] = useState<string>(() => readSunbirdKey());

  useEffect(() => {
    const handleKeyUpdated = () => setSunbirdApiKey(readSunbirdKey());
    window.addEventListener(SUNBIRD_KEY_EVENT, handleKeyUpdated);
    return () => window.removeEventListener(SUNBIRD_KEY_EVENT, handleKeyUpdated);
  }, []);

  // Fetch backend hardware probe & voices
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

    fetch('/v1/voices')
      .then((res) => {
        const cType = res.headers.get('content-type') || '';
        return res.ok && cType.includes('json') ? res.json() : Promise.reject();
      })
      .then((data) => {
        if (data.voices && data.voices.length > 0) {
          const merged = data.voices.map((v: any) => ({
            voice_id: v.voice_id,
            name: v.name,
            language: v.language,
            gender: v.gender || 'Speaker',
            dialect: v.dialect || 'Native Dialect',
            country: v.country || 'Africa',
            flag: v.language === 'lug' || v.language === 'nyn' || v.language === 'ach' ? '🇺🇬' :
                  v.language === 'swa' ? '🇰🇪' :
                  v.language === 'yor' || v.language === 'ibo' || v.language === 'hau' ? '🇳🇬' :
                  v.language === 'zul' || v.language === 'xho' ? '🇿🇦' :
                  v.language === 'amh' ? '🇪🇹' :
                  v.language === 'som' ? '🇸🇴' :
                  v.language === 'kin' ? '🇷🇼' :
                  v.language === 'wol' ? '🇸🇳' : '🌍',
          }));
          setVoices(merged);
        }
      })
      .catch(() => {});
  }, []);

  const speakBrowserVoice = (
    text: string,
    lang: string = 'sw',
    gender: string = 'Male',
    playbackSpeed: number = 1.0
  ) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/\[.*?\]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const allVoices = window.speechSynthesis.getVoices();

      const voice =
        allVoices.find((v) => v.lang.toLowerCase().startsWith(lang)) ||
        allVoices.find((v) => v.lang.includes('KE') || v.lang.includes('ZA') || v.lang.includes('NG')) ||
        allVoices.find((v) => v.lang.startsWith('en')) ||
        allVoices[0];

      if (voice) utterance.voice = voice;
      utterance.rate = playbackSpeed;
      utterance.pitch = gender.toLowerCase() === 'female' ? 1.2 : 0.9;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

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

  const auditionVoice = async (voice: VoiceOption) => {
    const sampleText = LANGUAGE_SAMPLES[voice.language] || `Hello, my name is ${voice.name}.`;
    const trackEngine = sunbirdApiKey ? 'Sunbird AI (Uganda)' : 'Sherpa MMS-TTS';
    let playedDirect = false;

    // 1. Try local backend
    try {
      const res = await fetch('/v1/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: sampleText,
          voice: voice.voice_id,
          language: voice.language,
          model: sunbirdApiKey ? 'sunbird' : 'sherpa_mms',
          api_key: sunbirdApiKey,
        }),
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && (cType.includes('audio') || cType.includes('octet-stream'))) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        playTrack(url, `${voice.name} (${voice.dialect || voice.language})`, voice.language, trackEngine);
        playedDirect = true;
      }
    } catch {}

    // 2. Direct Sunbird API
    if (!playedDirect && sunbirdApiKey) {
      try {
        const sRes = await fetch('https://api.sunbird.ai/tasks/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sunbirdApiKey.trim()}`,
            'Accept': 'audio/wav, audio/mpeg, application/octet-stream',
          },
          body: JSON.stringify({
            text: sampleText,
            language: voice.language,
            voice_id: voice.voice_id,
          }),
        });
        const sCType = sRes.headers.get('content-type') || '';
        if (sRes.ok && sCType.includes('json')) {
          const sData = await sRes.json();
          const directUrl = sData.audio_url || sData.output?.audio_url;
          if (directUrl) {
            playTrack(directUrl, `${voice.name} (${voice.dialect || voice.language})`, voice.language, 'Sunbird Cloud');
            playedDirect = true;
          }
        } else if (sRes.ok && (sCType.includes('audio') || sCType.includes('octet-stream'))) {
          const blob = await sRes.blob();
          const url = URL.createObjectURL(blob);
          playTrack(url, `${voice.name} (${voice.dialect || voice.language})`, voice.language, 'Sunbird Cloud');
          playedDirect = true;
        }
      } catch {}
    }

    // 3. Fallback to Web Speech API
    if (!playedDirect) {
      setAudioTrackName(`${voice.name} (${voice.dialect || voice.language})`);
      setAudioTrackLang(voice.language);
      setAudioTrackEngine('Browser Voice');
      speakBrowserVoice(sampleText, voice.language, voice.gender, 1.0);
    }
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
    if (!text.trim()) return { success: false, error: 'Empty script' };
    setNotice(null);
    const activeVoice = voices.find((v) => v.voice_id === voiceId);
    const displayName = `${activeVoice?.name || voiceId} (${activeVoice?.dialect || language})`;
    const engineName =
      engine === 'sunbird' ? 'Sunbird AI' : engine === 'sherpa_mms' ? 'Sherpa MMS-TTS' : 'OmniVoice GGUF';

    let playedDirect = false;
    let finalUrl: string | undefined = undefined;

    // 1. Try local server
    try {
      const res = await fetch('/v1/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: text,
          voice: voiceId,
          language,
          model: engine,
          speed: pacingSpeed,
          api_key: sunbirdApiKey,
        }),
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && (cType.includes('audio') || cType.includes('octet-stream'))) {
        const blob = await res.blob();
        finalUrl = URL.createObjectURL(blob);
        playTrack(finalUrl, displayName, language, engineName);
        playedDirect = true;
        return { success: true, url: finalUrl };
      }
    } catch {}

    // 2. Direct Sunbird AI Cloud API
    if (!playedDirect && sunbirdApiKey && engine === 'sunbird') {
      try {
        const sRes = await fetch('https://api.sunbird.ai/tasks/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sunbirdApiKey.trim()}`,
            'Accept': 'audio/wav, audio/mpeg, application/octet-stream',
          },
          body: JSON.stringify({
            text,
            language,
            voice_id: voiceId,
          }),
        });
        const sCType = sRes.headers.get('content-type') || '';
        if (sRes.ok && sCType.includes('json')) {
          const sData = await sRes.json();
          const directUrl = sData.audio_url || sData.output?.audio_url;
          if (directUrl) {
            playTrack(directUrl, displayName, language, 'Sunbird Cloud');
            return { success: true, url: directUrl };
          }
        } else if (sRes.ok && (sCType.includes('audio') || sCType.includes('octet-stream'))) {
          const blob = await sRes.blob();
          finalUrl = URL.createObjectURL(blob);
          playTrack(finalUrl, displayName, language, 'Sunbird Cloud');
          return { success: true, url: finalUrl };
        }
      } catch (err) {
        console.warn('Sunbird API direct error:', err);
      }
    }

    // 3. Fallback: Browser voice
    setAudioTrackName(displayName);
    setAudioTrackLang(language);
    setAudioTrackEngine('Browser Voice');
    setNotice(
      engine === 'sunbird' && !sunbirdApiKey
        ? 'No Sunbird API key configured. Browser voice used as fallback. Add a key (top right) for native Luganda, Runyankore and Acholi.'
        : engine === 'browser'
        ? 'Generated with your browser’s speech engine.'
        : 'The selected engine was offline, so your browser’s speech engine was used instead.'
    );
    speakBrowserVoice(text, language, activeVoice?.gender || 'Male', pacingSpeed);
    return { success: true, fallback: true };
  };

  return (
    <StudioAudioContext.Provider
      value={{
        audioUrl,
        isPlaying,
        currentTime,
        duration,
        volume,
        speed,
        audioTrackName,
        audioTrackLang,
        audioTrackEngine,
        audioRef,
        hardware,
        backendOnline,
        sunbirdApiKey,
        voices,
        clonedVoices,
        notice,
        setNotice,
        addClonedVoice,
        removeClonedVoice,
        playTrack,
        togglePlayPause,
        replayAudio,
        stopAudio,
        seekAudio,
        changeVolume,
        changeSpeed,
        speakBrowserVoice,
        auditionVoice,
        synthesizeAudioTrack,
      }}
    >
      {children}
      {/* Global Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={() => setIsPlaying(false)}
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
