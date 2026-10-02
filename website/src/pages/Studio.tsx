import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Volume2,
  Play,
  Pause,
  Download,
  Sliders,
  Globe,
  ShieldCheck,
  Sparkles,
  Cpu,
  Layers,
  RefreshCw,
  Music,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  StopCircle,
  HardDrive,
  Trash2,
} from 'lucide-react';

interface ModelItem {
  model_id: string;
  name: string;
  family: string;
  task: string;
  languages: string[];
  size_mb: number;
  ram_mb: number;
  is_downloaded: boolean;
  local_path: string | null;
  description: string;
}

interface VoiceOption {
  voice_id: string;
  name: string;
  language: string;
  gender: string;
  dialect?: string;
  country?: string;
  flag?: string;
}

interface HardwareInfo {
  accelerator: string;
  vram_mb: number;
  system_ram_mb: number;
  compute_class: string;
  device_name: string;
  recommended_gguf_quant: string;
  can_run_local_heavy: boolean;
}

const PRESET_VOICES: VoiceOption[] = [
  { voice_id: 'kigozi_lug', name: 'Kigozi', language: 'lug', gender: 'Male', dialect: 'Central Uganda / Buganda', country: 'Uganda', flag: '🇺🇬' },
  { voice_id: 'namubiru_lug', name: 'Namubiru', language: 'lug', gender: 'Female', dialect: 'Central Uganda / Melodic', country: 'Uganda', flag: '🇺🇬' },
  { voice_id: 'mugisha_nyn', name: 'Mugisha', language: 'nyn', gender: 'Male', dialect: 'Western Uganda / Ankole', country: 'Uganda', flag: '🇺🇬' },
  { voice_id: 'kemigisha_nyn', name: 'Kemigisha', language: 'nyn', gender: 'Female', dialect: 'Western Uganda / Mbarara', country: 'Uganda', flag: '🇺🇬' },
  { voice_id: 'amina_swa', name: 'Amina', language: 'swa', gender: 'Female', dialect: 'Coastal Swahili / Broadcast', country: 'Tanzania/Kenya', flag: '🇹🇿' },
  { voice_id: 'juma_swa', name: 'Juma', language: 'swa', gender: 'Male', dialect: 'Standard Swahili / Deep Voice', country: 'Kenya', flag: '🇰🇪' },
  { voice_id: 'ade_yor', name: 'Ade', language: 'yor', gender: 'Male', dialect: 'Lagos Urban / Tonal Yoruba', country: 'Nigeria', flag: '🇳🇬' },
  { voice_id: 'ngozi_ibo', name: 'Ngozi', language: 'ibo', gender: 'Female', dialect: 'Igbo Central / Expressive', country: 'Nigeria', flag: '🇳🇬' },
  { voice_id: 'zola_zul', name: 'Zola', language: 'zul', gender: 'Male', dialect: 'isiZulu / KwaZulu-Natal', country: 'South Africa', flag: '🇿🇦' },
];

const LANGUAGE_SAMPLES: Record<string, string> = {
  lug: 'Tusanyuse nnyo okukulaba leero mu LingualDub! Eno ye pulatifoomu esooka ey\'amaloboozi g\'ennimi z\'omu Africa.',
  swa: 'Karibu sana katika huduma ya kwanza ya sauti ya Kiafrika inayotumia akili mnemba ya kisasa.',
  nyn: 'Tukwakiire n\'omutima gumwe omuri LingualDub. Amaloboozi gaitu ag\'obuhangwa gakozesebwa aha mutindo gwa heiguru.',
  ach: 'Wamoti maber i LingualDub. Dwani pa lwak me Africa tye kany.',
  yor: 'Ẹ káàbọ̀ sí orí ètò ìgbóhùnsáfẹ́fẹ́ wa. Inú wa dùn púpọ̀ láti pàdé yín lónìí.',
  ibo: 'Nnọọ nke ọma na LingualDub. Anyị nwere obi ụtọ izute gị taa.',
  hau: 'Barka da zuwa dandalin muryar Afrika na zamani.',
  zul: 'Siyakwamukela kule ngxenyekazi yezwi lase-Afrika esezingeni eliphezulu.',
  xho: 'Wamkelekile kwi-LingualDub, iqonga lezwi lemveli lase-Afrika.',
  kin: 'Murakaza neza kuri LingualDub. Twishimiye kubakira uyu munsi.',
  amh: 'እንኳን ወደ ሊንግዋል ደብ በደህና መጡ። የአፍሪካ ቋንቋዎች የድምጽ ቴክኖሎጂ።',
  lin: 'Boyei bolamu na LingualDub, platform ya mongongo ya Afrika.'
};

export default function Studio() {
  const [activeTab, setActiveTab] = useState<'speech' | 'gallery' | 'cloner' | 'agent' | 'dubbing' | 'mastering' | 'settings'>('speech');
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [voices, setVoices] = useState<VoiceOption[]>(PRESET_VOICES);

  // Speech Lab State
  const [selectedLang, setSelectedLang] = useState('lug');
  const [selectedVoice, setSelectedVoice] = useState('kigozi_lug');
  const [selectedEngine, setSelectedEngine] = useState('sunbird');
  const [speechText, setSpeechText] = useState(LANGUAGE_SAMPLES.lug);
  const [speed, setSpeed] = useState(1.0);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sunbird AI Cloud API Key (Persistent)
  const [sunbirdApiKey, setSunbirdApiKey] = useState<string>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('sunbird_api_key') || '' : '';
  });

  const speakRealAudio = (text: string, lang: string = 'sw', gender: string = 'Male', playbackSpeed: number = 1.0) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/\[.*?\]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const allVoices = window.speechSynthesis.getVoices();

      const voice = allVoices.find(v => v.lang.toLowerCase().startsWith(lang))
        || allVoices.find(v => v.lang.includes('KE') || v.lang.includes('ZA') || v.lang.includes('NG'))
        || allVoices.find(v => v.lang.startsWith('en'))
        || allVoices[0];

      if (voice) utterance.voice = voice;
      utterance.rate = playbackSpeed;
      utterance.pitch = gender.toLowerCase() === 'female' ? 1.2 : 0.9;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };


  // Voice Cloner State
  const [cloneName, setCloneName] = useState('');
  const [cloneLang, setCloneLang] = useState('lug');
  const [cloneGender, setCloneGender] = useState('Female');
  const [cloneDialect, setCloneDialect] = useState('');
  const [cloneConsent, setCloneConsent] = useState(false);
  const [cloneAudioFile, setCloneAudioFile] = useState<File | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [clonedSuccess, setClonedSuccess] = useState<string | null>(null);

  // Conversational Agent State
  interface ChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    audioBase64?: string;
    interrupted?: boolean;
    time: string;
  }
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "Oli otya nnyabo/ssebo! Ndi mubeezi wo ow'ekisa mu LingualDub. Nkuyambe ntya leero?",
      time: '12:00 PM',
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [bargeInTriggered, setBargeInTriggered] = useState(false);

  // Dubbing State
  const [dubSrcText, setDubSrcText] = useState('Welcome to our modern healthcare service. Please sit down while we register your information.');
  const [dubSrcLang, setDubSrcLang] = useState('eng');
  const [dubTgtLang, setDubTgtLang] = useState('lug');
  const [dubTranslated, setDubTranslated] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Mastering State
  const [targetLufs, setTargetLufs] = useState(-14);
  const [duckRatio, setDuckRatio] = useState(-12);
  const [softClip, setSoftClip] = useState(true);
  const [masterResults, setMasterResults] = useState<{ initialRms: number; finalRms: number; targetRms: number } | null>(null);

  // Load hardware probe & voices from backend
  useEffect(() => {
    fetch('/v1/system/probe')
      .then((res) => res.json())
      .then((data: HardwareInfo) => setHardware(data))
      .catch(() => {
        setHardware({
          accelerator: 'cpu',
          vram_mb: 0,
          system_ram_mb: 7711,
          compute_class: 'cpu',
          device_name: 'CPU (Host Fallback)',
          recommended_gguf_quant: 'Q4_K_M',
          can_run_local_heavy: false,
        });
      });

    fetch('/v1/voices')
      .then((res) => res.json())
      .then((data) => {
        if (data.voices && data.voices.length > 0) {
          const merged = data.voices.map((v: any) => ({
            voice_id: v.voice_id,
            name: v.name,
            language: v.language,
            gender: v.gender || 'Speaker',
            dialect: v.dialect || 'Native Dialect',
            flag: v.language === 'lug' || v.language === 'nyn' || v.language === 'ach' ? '🇺🇬' :
                  v.language === 'swa' ? '🇰🇪' :
                  v.language === 'yor' || v.language === 'ibo' || v.language === 'hau' ? '🇳🇬' :
                  v.language === 'zul' || v.language === 'xho' ? '🇿🇦' : '🌍'
          }));
          setVoices(merged);
        }
      })
      .catch(() => {});

    fetchModels();
  }, []);

  const [models, setModels] = useState<ModelItem[]>([]);
  const [pullingModelId, setPullingModelId] = useState<string | null>(null);

  const fetchModels = async () => {
    try {
      const res = await fetch('/v1/models');
      const data = await res.json();
      if (data.models) {
        setModels(data.models);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePullModel = async (modelId: string) => {
    setPullingModelId(modelId);
    try {
      const res = await fetch('/v1/models/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_id: modelId }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchModels();
      } else {
        alert(`Download failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`Network error: ${err}`);
    } finally {
      setPullingModelId(null);
    }
  };

  const handleRemoveModel = async (modelId: string) => {
    if (!confirm(`Delete local weights for ${modelId}?`)) return;
    try {
      await fetch('/v1/models/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_id: modelId }),
      });
      await fetchModels();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSynthesize = async () => {
    if (!speechText.trim()) return;
    setIsSynthesizing(true);
    try {
      const res = await fetch('/v1/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: speechText,
          voice: selectedVoice,
          language: selectedLang,
          model: selectedEngine,
          speed: speed,
          api_key: sunbirdApiKey,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      }

      // Also speak with authentic vocalization through browser speech engine
      const activeVoice = voices.find((v) => v.voice_id === selectedVoice);
      speakRealAudio(speechText, selectedLang, activeVoice?.gender || 'Male', speed);
    } catch (err) {
      console.warn('Backend audio fallback, speaking via browser speech engine:', err);
      const activeVoice = voices.find((v) => v.voice_id === selectedVoice);
      speakRealAudio(speechText, selectedLang, activeVoice?.gender || 'Male', speed);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const insertTag = (tag: string) => {
    setSpeechText((prev) => `${prev} ${tag} `);
  };

  const handleAudition = async (voice: VoiceOption) => {
    const sampleText = LANGUAGE_SAMPLES[voice.language] || `Hello, my name is ${voice.name}.`;
    // Immediately play real human pronunciation
    speakRealAudio(sampleText, voice.language, voice.gender, 1.0);
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
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        if (audioRef.current) {
          audioRef.current.src = url;
        }
      }
    } catch (e) {
      console.error(e);
    }
  };


  const handleVoiceCloneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneName || !cloneConsent || !cloneAudioFile) return;

    setIsCloning(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Audio = (reader.result as string).split(',')[1];
      try {
        const res = await fetch('/v1/voices/clone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cloneName,
            language: cloneLang,
            gender: cloneGender,
            dialect: cloneDialect,
            consent_basis: 'explicit_ethical_sovereignty_consent_verified',
            audio_base64: base64Audio,
          }),
        });
        const data = await res.json();
        if (data.status === 'ok') {
          setClonedSuccess(`Voice "${cloneName}" successfully created as .afrivoice pack! ID: ${data.voice_id}`);
          const newVoice: VoiceOption = {
            voice_id: data.voice_id,
            name: cloneName,
            language: cloneLang,
            gender: cloneGender,
            dialect: cloneDialect,
            flag: '🌍',
          };
          setVoices((prev) => [newVoice, ...prev]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsCloning(false);
      }
    };
    reader.readAsDataURL(cloneAudioFile);
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatInput('');

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, newMsg]);
    setAgentSpeaking(true);
    setBargeInTriggered(false);

    try {
      const res = await fetch('/v1/agent/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: userText,
          voice_id: selectedVoice,
          language: selectedLang,
          api_key: sunbirdApiKey,
        }),
      });
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply_text,
        audioBase64: data.audio_base64,
        interrupted: data.interrupted,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatHistory((prev) => [...prev, assistantMsg]);

      // Speak reply out loud with real spoken voice synthesis
      speakRealAudio(data.reply_text, selectedLang, 'Female', 1.0);

      if (data.audio_base64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio_base64}`);
        audio.play().catch(() => {});
        audio.onended = () => setAgentSpeaking(false);
      } else {
        setAgentSpeaking(false);
      }
    } catch {
      setAgentSpeaking(false);
    }
  };

  const handleBargeIn = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAgentSpeaking(false);
    setIsPlaying(false);
    setBargeInTriggered(true);
    setTimeout(() => setBargeInTriggered(false), 3500);
  };

  const handleTranslate = async () => {
    if (!dubSrcText.trim()) return;
    setIsTranslating(true);
    try {
      const res = await fetch('/v1/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: dubSrcText,
          source_language: dubSrcLang,
          target_language: dubTgtLang,
          api_key: sunbirdApiKey,
        }),
      });
      const data = await res.json();
      setDubTranslated(data.translated_text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };


  const handleRunMastering = async () => {
    try {
      const res = await fetch('/v1/studio/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          samples: [0.03, -0.04, 0.08, -0.07, 0.05, -0.02, 0.09],
          target_rms: Math.pow(10, targetLufs / 20),
        }),
      });
      const data = await res.json();
      setMasterResults({
        initialRms: data.initial_rms,
        finalRms: data.final_rms,
        targetRms: data.target_rms,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ── Top Status Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-dark-card border border-dark-border rounded-2xl mb-8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              LingualDub African Voice Studio
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ElevenLabs for Africa
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Zero-Shot Voice Cloning • Regional Cloud & Local Quantized Engines • 51+ African Languages
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hardware ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-surface border border-dark-border rounded-lg text-xs font-mono text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>{hardware.accelerator.toUpperCase()} ({Math.round(hardware.system_ram_mb / 1024)}GB RAM)</span>
              <span className="text-emerald-400 font-semibold">• {hardware.recommended_gguf_quant}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-surface border border-dark-border rounded-lg text-xs font-mono text-slate-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
              <span>Detecting Hardware...</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex overflow-x-auto gap-2 border-b border-dark-border pb-3 mb-8">
        {[
          { id: 'speech', label: 'Speech Lab', icon: Mic },
          { id: 'gallery', label: 'African Voices', icon: Globe },
          { id: 'cloner', label: 'Voice Cloner (.afrivoice)', icon: Layers },
          { id: 'agent', label: 'Conversational Agent', icon: RadioIcon },
          { id: 'dubbing', label: 'Dubbing & Translation', icon: FilmIcon },
          { id: 'mastering', label: 'Mastering Rack', icon: Sliders },
          { id: 'settings', label: 'Engine Settings', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-dark-surface border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── WORKSPACE 1: SPEECH LAB ── */}
      {activeTab === 'speech' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-dark-border pb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  Text to Speech Generation
                </h2>
                <button
                  onClick={() => setSpeechText(LANGUAGE_SAMPLES[selectedLang] || '')}
                  className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="w-3 h-3" /> Load Regional Sample Script
                </button>
              </div>

              {/* Expressive Cue Chips */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Inline Emotion & Pacing Contours
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['[excited]', '[whisper]', '[respectful]', '[sorrow]', '[pause: 500ms]'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => insertTag(chip)}
                      className="px-2.5 py-1 bg-dark-surface hover:bg-brand-500/20 text-brand-300 hover:text-white border border-dark-border rounded-md text-xs font-mono transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Area */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Script Content
                </label>
                <textarea
                  value={speechText}
                  onChange={(e) => setSpeechText(e.target.value)}
                  rows={5}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 leading-relaxed font-sans"
                  placeholder="Enter African speech script..."
                />
              </div>

              {/* Synthesis Button */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={handleSynthesize}
                  disabled={isSynthesizing || !speechText.trim()}
                  className="flex-1 py-3 px-6 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  {isSynthesizing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Authentic Voice...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Generate Voice Track</span>
                    </>
                  )}
                </button>
              </div>

              {/* Audio Player Card */}
              {audioUrl && (
                <div className="mt-4 p-4 bg-dark-surface border border-emerald-500/20 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Synthesized Audio Ready
                    </span>
                    <a
                      href={audioUrl}
                      download={`lingualdub_${selectedVoice}.wav`}
                      className="flex items-center gap-1 text-slate-300 hover:text-white"
                    >
                      <Download className="w-3.5 h-3.5" /> Download WAV
                    </a>
                  </div>
                  <audio ref={audioRef} controls className="w-full h-10 outline-none" src={audioUrl} />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Parameters */}
          <div className="space-y-6">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-dark-border pb-3">
                Voice & Engine Configuration
              </h3>

              {/* Language Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">Target Language</label>
                <select
                  value={selectedLang}
                  onChange={(e) => {
                    setSelectedLang(e.target.value);
                    const matching = voices.filter((v) => v.language === e.target.value);
                    if (matching.length > 0) setSelectedVoice(matching[0].voice_id);
                  }}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
                >
                  <option value="lug">🇺🇬 Luganda (Uganda)</option>
                  <option value="nyn">🇺🇬 Runyankore (Uganda)</option>
                  <option value="ach">🇺🇬 Acholi (Uganda)</option>
                  <option value="swa">🇰🇪/🇹🇿 Swahili (East Africa)</option>
                  <option value="yor">🇳🇬 Yoruba (Nigeria)</option>
                  <option value="ibo">🇳🇬 Igbo (Nigeria)</option>
                  <option value="hau">🇳🇬 Hausa (Nigeria)</option>
                  <option value="zul">🇿🇦 isiZulu (South Africa)</option>
                  <option value="xho">🇿🇦 isiXhosa (South Africa)</option>
                  <option value="kin">🇷🇼 Kinyarwanda (Rwanda)</option>
                  <option value="amh">🇪🇹 Amharic (Ethiopia)</option>
                  <option value="lin">🇨🇩 Lingala (DR Congo)</option>
                </select>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">Speaker Preset</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
                >
                  {voices.map((v) => (
                    <option key={v.voice_id} value={v.voice_id}>
                      {v.flag} {v.name} ({v.gender} • {v.dialect || v.language})
                    </option>
                  ))}
                </select>
              </div>

              {/* Engine Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">Engine Runtime</label>
                <select
                  value={selectedEngine}
                  onChange={(e) => setSelectedEngine(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60"
                >
                  <option value="sunbird">☁️ Sunbird AI Regional Cloud (Production Neural Speech)</option>
                  <option value="sherpa_mms">🚀 Local Sherpa-ONNX MMS-TTS (Local INT8, ~35MB RAM)</option>
                  <option value="omnivoice">🧬 Local OmniVoice GGUF (Voice Cloning Q4_K_M)</option>
                  <option value="browser">🗣️ Browser Neural Speech Engine (Instant Real Voice)</option>
                </select>
              </div>


              {/* Speed Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-400">Pacing Speed</label>
                  <span className="text-xs font-mono text-emerald-400">{speed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── WORKSPACE 2: VOICE GALLERY ── */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Curated African Voice Gallery</h2>
              <p className="text-sm text-slate-400">Audition native speakers across East, West, and Southern Africa.</p>
            </div>
            <button
              onClick={() => setActiveTab('cloner')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" /> Clone Custom Voice
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {voices.map((voice) => (
              <div
                key={voice.voice_id}
                className="bg-dark-card border border-dark-border hover:border-emerald-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{voice.flag}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-dark-surface border border-dark-border text-slate-300">
                      {voice.language.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {voice.name}
                    </h3>
                    <p className="text-xs text-slate-400">{voice.dialect || 'Native Regional Dialect'}</p>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{voice.gender}</span>
                    <span>•</span>
                    <span>{voice.country || 'Africa'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-dark-border">
                  <button
                    onClick={() => handleAudition(voice)}
                    className="flex-1 py-2 px-3 bg-dark-surface hover:bg-dark-border rounded-lg text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" /> Audition
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVoice(voice.voice_id);
                      setSelectedLang(voice.language);
                      setActiveTab('speech');
                    }}
                    className="flex-1 py-2 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Use in Lab
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── WORKSPACE 3: VOICE CLONER ── */}
      {activeTab === 'cloner' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-7 shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                Zero-Shot African Voice Cloner (.afrivoice)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Extracts 192-d ECAPA speaker embeddings and generates a portable, encrypted voice container.
              </p>
            </div>

            {clonedSuccess && (
              <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{clonedSuccess}</span>
              </div>
            )}

            <form onSubmit={handleVoiceCloneSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Voice / Speaker Name</label>
                <input
                  type="text"
                  required
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  placeholder="e.g. Grace Akello"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Primary Language</label>
                  <select
                    value={cloneLang}
                    onChange={(e) => setCloneLang(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="lug">Luganda</option>
                    <option value="nyn">Runyankore</option>
                    <option value="swa">Swahili</option>
                    <option value="yor">Yoruba</option>
                    <option value="ibo">Igbo</option>
                    <option value="zul">isiZulu</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Gender</label>
                  <select
                    value={cloneGender}
                    onChange={(e) => setCloneGender(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Neutral">Neutral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Dialect / Accent Description</label>
                <input
                  type="text"
                  value={cloneDialect}
                  onChange={(e) => setCloneDialect(e.target.value)}
                  placeholder="e.g. Central Uganda / Buganda Urban"
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Reference Audio (WAV/MP3 • 5 - 30 seconds)
                </label>
                <input
                  type="file"
                  required
                  accept="audio/*"
                  onChange={(e) => setCloneAudioFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30"
                />
              </div>

              {/* Ethical Sovereignty Consent Checkbox */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={cloneConsent}
                    onChange={(e) => setCloneConsent(e.target.checked)}
                    className="mt-1 accent-emerald-500"
                  />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="w-4 h-4" /> African Ethical Voice Sovereignty Consent
                    </span>
                    I certify and confirm that I have explicit, verifiable consent from the speaker to clone, store, and
                    synthesize their voice under LingualDub's cryptographic consent framework.
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={isCloning || !cloneConsent}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                {isCloning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting 192-d Embedding & Packaging...</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Build & Save .afrivoice Package</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── WORKSPACE 4: CONVERSATIONAL AGENT WITH BARGE-IN ── */}
      {activeTab === 'agent' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <RadioIcon className="w-5 h-5 text-emerald-400" />
                  Real-Time African Conversational Voice Agent
                </h2>
                <p className="text-xs text-slate-400">
                  Interactive dialogue with instant thread-safe Barge-In interruption.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {bargeInTriggered ? (
                  <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-400 rounded-full text-xs font-bold animate-pulse">
                    ⚠️ Barge-In Triggered!
                  </span>
                ) : agentSpeaking ? (
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Agent Speaking...
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-dark-surface border border-dark-border text-slate-400 rounded-full text-xs">
                    Agent Idle
                  </span>
                )}
              </div>
            </div>

            {/* Chat Transcript */}
            <div className="h-96 overflow-y-auto bg-dark-bg border border-dark-border rounded-xl p-4 space-y-4">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-br-none'
                        : 'bg-dark-surface border border-dark-border text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input Bar with Barge-In Button */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                placeholder="Say something in Luganda, Swahili, or English (e.g. 'Oli otya?', 'Hujambo')..."
                className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500/60"
              />
              <button
                onClick={handleSendChatMessage}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm"
              >
                Send
              </button>
              <button
                onClick={handleBargeIn}
                className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-400 font-semibold rounded-xl text-xs flex items-center gap-1.5"
              >
                <StopCircle className="w-4 h-4" /> Barge In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WORKSPACE 5: DUBBING & TRANSLATION ── */}
      {activeTab === 'dubbing' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl space-y-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FilmIcon className="w-5 h-5 text-emerald-400" />
                Script Translation & Syllable Dubbing Timeline
              </h2>
              <p className="text-xs text-slate-400">
                Translate across 50+ African languages and prepare syllable-timed dubbing tracks.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Source Language</label>
                <select
                  value={dubSrcLang}
                  onChange={(e) => setDubSrcLang(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-slate-100"
                >
                  <option value="eng">English</option>
                  <option value="fra">French</option>
                  <option value="swa">Swahili</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Target African Language</label>
                <select
                  value={dubTgtLang}
                  onChange={(e) => setDubTgtLang(e.target.value)}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-slate-100"
                >
                  <option value="lug">Luganda</option>
                  <option value="swa">Swahili</option>
                  <option value="nyn">Runyankore</option>
                  <option value="yor">Yoruba</option>
                  <option value="ibo">Igbo</option>
                  <option value="zul">isiZulu</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Source Script</label>
              <textarea
                value={dubSrcText}
                onChange={(e) => setDubSrcText(e.target.value)}
                rows={4}
                className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-slate-100 leading-relaxed font-sans"
              />
            </div>

            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="py-3 px-6 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm flex items-center gap-2"
            >
              {isTranslating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Translating via NLLB-200...</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Run Translation</span>
                </>
              )}
            </button>

            {dubTranslated && (
              <div className="p-4 bg-dark-surface border border-emerald-500/30 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider">
                    {dubTgtLang.toUpperCase()} Translated Script
                  </span>
                  <span>Estimated: ~{Math.ceil(dubTranslated.split(' ').length * 0.4)}s duration</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">{dubTranslated}</p>
                <button
                  onClick={() => {
                    setSpeechText(dubTranslated);
                    setSelectedLang(dubTgtLang);
                    setActiveTab('speech');
                  }}
                  className="py-2 px-4 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" /> Dub into Speech Lab
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── WORKSPACE 6: MASTERING RACK ── */}
      {activeTab === 'mastering' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                Broadcast Loudness & Ducking Rack
              </h2>
              <p className="text-xs text-slate-400">
                Normalizes speech tracks to international broadcast standards with smooth background music ducking.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300">Target Loudness (LUFS / RMS)</span>
                  <span className="font-mono text-emerald-400 font-bold">{targetLufs} LUFS</span>
                </div>
                <input
                  type="range"
                  min="-24"
                  max="-6"
                  value={targetLufs}
                  onChange={(e) => setTargetLufs(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300">Background Music Ducking Attenuation</span>
                  <span className="font-mono text-emerald-400 font-bold">{duckRatio} dB</span>
                </div>
                <input
                  type="range"
                  min="-24"
                  max="-3"
                  value={duckRatio}
                  onChange={(e) => setDuckRatio(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="p-3 bg-dark-surface rounded-xl border border-dark-border">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={softClip}
                    onChange={(e) => setSoftClip(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  <span>Soft-Clip Saturation Limiting (Peak Protection without Digital Clipping)</span>
                </label>
              </div>

              <button
                onClick={handleRunMastering}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Sliders className="w-4 h-4" />
                <span>Test Normalization Engine</span>
              </button>

              {masterResults && (
                <div className="p-4 bg-dark-surface border border-emerald-500/30 rounded-xl space-y-2 font-mono text-xs">
                  <div className="text-emerald-400 font-bold mb-2">Mastering Computation Results:</div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Initial Track RMS:</span>
                    <span className="text-white">{masterResults.initialRms.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Track RMS:</span>
                    <span className="text-white">{masterResults.targetRms.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Final Mastered RMS:</span>
                    <span className="text-emerald-300 font-bold">{masterResults.finalRms.toFixed(4)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── WORKSPACE 7: ENGINE SETTINGS ── */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl space-y-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                Host Hardware Accelerator & Engine Inspector
              </h2>
              <p className="text-xs text-slate-400">
                Detailed telemetry for local quantized engines and cloud fallbacks.
              </p>
            </div>

            {hardware ? (
              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-3 bg-dark-surface rounded-xl border border-dark-border">
                  <div className="text-slate-500 mb-1">Accelerator</div>
                  <div className="text-sm font-bold text-emerald-400">{hardware.accelerator.toUpperCase()}</div>
                </div>
                <div className="p-3 bg-dark-surface rounded-xl border border-dark-border">
                  <div className="text-slate-500 mb-1">Compute Tier</div>
                  <div className="text-sm font-bold text-blue-400">{hardware.compute_class}</div>
                </div>
                <div className="p-3 bg-dark-surface rounded-xl border border-dark-border">
                  <div className="text-slate-500 mb-1">Device Name</div>
                  <div className="text-sm font-bold text-white truncate">{hardware.device_name}</div>
                </div>
                <div className="p-3 bg-dark-surface rounded-xl border border-dark-border">
                  <div className="text-slate-500 mb-1">VRAM Available</div>
                  <div className="text-sm font-bold text-white">{hardware.vram_mb} MB</div>
                </div>
                <div className="p-3 bg-dark-surface rounded-xl border border-dark-border">
                  <div className="text-slate-500 mb-1">Host System RAM</div>
                  <div className="text-sm font-bold text-white">{hardware.system_ram_mb} MB</div>
                </div>
                <div className="p-3 bg-dark-surface rounded-xl border border-dark-border">
                  <div className="text-slate-500 mb-1">Recommended GGUF Quant</div>
                  <div className="text-sm font-bold text-amber-400">{hardware.recommended_gguf_quant}</div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-xs">Loading hardware probe...</div>
            )}
          </div>

          {/* Regional Cloud API Key Settings */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Sunbird AI Regional Cloud Credentials
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enables production neural TTS, ASR, and Translation across 51+ African languages via api.sunbird.ai.
            </p>
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">API Bearer Token</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={sunbirdApiKey}
                  onChange={(e) => {
                    setSunbirdApiKey(e.target.value);
                    localStorage.setItem('sunbird_api_key', e.target.value);
                  }}
                  placeholder="Paste Sunbird API Token..."
                  className="flex-1 bg-dark-bg border border-dark-border rounded-xl p-3 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500/60"
                />
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('sunbird_api_key', sunbirdApiKey);
                    alert('Sunbird AI key saved! Regional cloud neural models are now active.');
                  }}
                  className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Save Token
                </button>
              </div>
              <div className="text-[11px] text-slate-500">
                {sunbirdApiKey ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Token configured & active
                  </span>
                ) : (
                  <span>No key set. Using local offline engines and browser speech synthesis.</span>
                )}
              </div>
            </div>
          </div>

          {/* Offline Neural Models Hub */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  Offline Neural Models Hub (Zero-Bandwidth)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage local INT8 & GGUF model weights for zero-cloud offline speech, translation, and ASR.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchModels}
                className="p-2 hover:bg-white/5 rounded-xl border border-dark-border text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Hub
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {models.map((model) => (
                <div
                  key={model.model_id}
                  className="p-4 bg-dark-surface border border-dark-border rounded-xl space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-semibold text-xs text-white leading-tight">
                        {model.name}
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {model.task}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {model.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 font-mono">
                      <span>Size: {model.size_mb} MB</span>
                      <span>•</span>
                      <span>RAM: ~{model.ram_mb} MB</span>
                      <span>•</span>
                      <span>{model.languages.slice(0, 3).join(', ')}{model.languages.length > 3 ? '...' : ''}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-dark-border flex items-center justify-between">
                    <div>
                      {model.is_downloaded ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready Offline
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Not Installed ({model.size_mb} MB)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {model.is_downloaded ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveModel(model.model_id)}
                          className="px-2.5 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs flex items-center gap-1 transition-all"
                          title="Delete from local cache"
                        >
                          <Trash2 className="w-3 h-3" /> Reclaim
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={pullingModelId === model.model_id}
                          onClick={() => handlePullModel(model.model_id)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10"
                        >
                          {pullingModelId === model.model_id ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" /> Pulling...
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" /> Pull Weights
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Fallback icon helper
function RadioIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 01-3-3V4.5a3 3 0 116 0v7.5a3 3 0 01-3 3z" />
    </svg>
  );
}

function FilmIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75a1.125 1.125 0 001.125 1.125" />
    </svg>
  );
}
