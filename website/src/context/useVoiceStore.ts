import { useState, useEffect } from 'react';
import type { VoiceOption } from '../types/studio';
import { PRESET_VOICES } from '../types/studio';

export function useVoiceStore() {
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

  // Sync with backend voices API
  useEffect(() => {
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

  return {
    voices,
    clonedVoices,
    addClonedVoice,
    removeClonedVoice,
  };
}
