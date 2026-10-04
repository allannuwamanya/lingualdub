import type { VoiceOption } from '../types/studio';
import { LANGUAGE_SAMPLES } from '../types/studio';

export function speakBrowserVoice(
  text: string,
  lang: string = 'sw',
  gender: string = 'Male',
  playbackSpeed: number = 1.0,
  onStateChange?: (playing: boolean) => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
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
  utterance.onstart = () => onStateChange?.(true);
  utterance.onend = () => onStateChange?.(false);
  utterance.onerror = () => onStateChange?.(false);
  window.speechSynthesis.speak(utterance);
}

async function callSunbirdDirectTts(text: string, language: string, voiceId: string, apiKey: string): Promise<string | null> {
  try {
    const sRes = await fetch('https://api.sunbird.ai/tasks/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
        Accept: 'audio/wav, audio/mpeg, application/octet-stream',
      },
      body: JSON.stringify({ text, language, voice_id: voiceId }),
    });
    const sCType = sRes.headers.get('content-type') || '';
    if (sRes.ok && sCType.includes('json')) {
      const sData = await sRes.json();
      return sData.audio_url || sData.output?.audio_url || null;
    }
    if (sRes.ok && (sCType.includes('audio') || sCType.includes('octet-stream'))) {
      const blob = await sRes.blob();
      return URL.createObjectURL(blob);
    }
  } catch {}
  return null;
}

export async function auditionVoiceService({
  voice,
  sunbirdApiKey,
  playTrack,
  speakFallback,
}: {
  voice: VoiceOption;
  sunbirdApiKey: string;
  playTrack: (url: string, name: string, lang: string, engine: string) => void;
  speakFallback: () => void;
}) {
  const sampleText = LANGUAGE_SAMPLES[voice.language] || `Hello, my name is ${voice.name}.`;
  const trackEngine = sunbirdApiKey ? 'Sunbird AI (Uganda)' : 'Sherpa MMS-TTS';

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
      playTrack(URL.createObjectURL(blob), `${voice.name} (${voice.dialect || voice.language})`, voice.language, trackEngine);
      return;
    }
  } catch {}

  // 2. Direct Sunbird API
  if (sunbirdApiKey) {
    const directUrl = await callSunbirdDirectTts(sampleText, voice.language, voice.voice_id, sunbirdApiKey);
    if (directUrl) {
      playTrack(directUrl, `${voice.name} (${voice.dialect || voice.language})`, voice.language, 'Sunbird Cloud');
      return;
    }
  }

  // 3. Fallback to Web Speech API
  speakFallback();
}

export async function synthesizeAudioTrackService({
  text,
  voiceId,
  language,
  engine,
  speed: pacingSpeed,
  sunbirdApiKey,
  voices,
  playTrack,
  onFallback,
}: {
  text: string;
  voiceId: string;
  language: string;
  engine: string;
  speed: number;
  sunbirdApiKey: string;
  voices: VoiceOption[];
  playTrack: (url: string, name: string, lang: string, engine: string) => void;
  onFallback: (displayName: string) => void;
}): Promise<{ success: boolean; url?: string; fallback?: boolean; error?: string }> {
  if (!text.trim()) return { success: false, error: 'Empty script' };
  const activeVoice = voices.find((v) => v.voice_id === voiceId);
  const displayName = `${activeVoice?.name || voiceId} (${activeVoice?.dialect || language})`;
  const engineName =
    engine === 'sunbird' ? 'Sunbird AI' : engine === 'sherpa_mms' ? 'Sherpa MMS-TTS' : 'OmniVoice GGUF';

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
      const finalUrl = URL.createObjectURL(blob);
      playTrack(finalUrl, displayName, language, engineName);
      return { success: true, url: finalUrl };
    }
  } catch {}

  // 2. Direct Sunbird AI Cloud API
  if (sunbirdApiKey && engine === 'sunbird') {
    const directUrl = await callSunbirdDirectTts(text, language, voiceId, sunbirdApiKey);
    if (directUrl) {
      playTrack(directUrl, displayName, language, 'Sunbird Cloud');
      return { success: true, url: directUrl };
    }
  }

  // 3. Fallback: Browser voice
  onFallback(displayName);
  return { success: true, fallback: true };
}
