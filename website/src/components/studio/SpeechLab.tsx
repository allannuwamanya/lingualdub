import React, { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStudioAudio } from '../../context/StudioAudioContext';
import { LANGUAGE_SAMPLES, PRESET_VOICES } from '../../types/studio';
import type { VoiceOption } from '../../types/studio';
import SpeechLabHeader from './lab/SpeechLabHeader';
import SpeechScriptEditor from './lab/SpeechScriptEditor';
import SpeechAudioMonitor from './lab/SpeechAudioMonitor';
import SpeechRecentTakes from './lab/SpeechRecentTakes';
import type { GenerationTake } from './lab/SpeechRecentTakes';
import SpeechControlsRack from './lab/SpeechControlsRack';

export default function SpeechLab() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    replayAudio,
    seekAudio,
    sunbirdApiKey,
    synthesizeAudioTrack,
    playTrack,
    audioTrackName,
  } = useStudioAudio();

  const [selectedLang, setSelectedLang] = useState<string>(searchParams.get('lang') || 'lug');
  const [selectedVoice, setSelectedVoice] = useState<string>(searchParams.get('voice') || 'kigozi_lug');
  const [selectedEngine, setSelectedEngine] = useState<string>('sunbird');
  const [pacingSpeed, setPacingSpeed] = useState<number>(parseFloat(searchParams.get('speed') || '1.0'));
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const [speechText, setSpeechText] = useState<string>(
    searchParams.get('text') ||
      'Mwaniriziddwa mu buweereza bwaffe obw’obulamu obw’omulembe. Mwatuula wansi nga tukyusa amawulire gammwe.'
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [recentTakes, setRecentTakes] = useState<GenerationTake[]>([]);

  const scriptWords = speechText.trim() ? speechText.trim().split(/\s+/).length : 0;
  const estimatedDurationSec = scriptWords > 0 ? ((scriptWords * 0.42) / pacingSpeed).toFixed(1) : '0.0';

  const voices: VoiceOption[] = PRESET_VOICES;
  const currentVoiceObj = voices.find((v) => v.voice_id === selectedVoice) || voices[0];

  const handleSynthesize = async () => {
    if (!speechText.trim() || isSynthesizing) return;
    setIsSynthesizing(true);

    try {
      const res = await synthesizeAudioTrack({
        text: speechText,
        voiceId: selectedVoice,
        language: selectedLang,
        engine: selectedEngine,
        speed: pacingSpeed,
      });

      if (res.url) {
        const newTake: GenerationTake = {
          id: Date.now().toString(),
          url: res.url,
          voiceName: currentVoiceObj.name,
          lang: selectedLang,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          engine:
            selectedEngine === 'sunbird'
              ? 'Sunbird Cloud'
              : selectedEngine === 'sherpa_mms'
              ? 'Sherpa INT8'
              : 'Browser Engine',
          duration: parseFloat(estimatedDurationSec),
        };
        setRecentTakes((prev) => [newTake, ...prev.slice(0, 3)]);
      }
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleInsertText = (insertion: string) => {
    if (!textareaRef.current) {
      setSpeechText((prev) => `${prev} ${insertion} `);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const updated = current.substring(0, start) + insertion + current.substring(end);
    setSpeechText(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 0);
  };

  const handleLangChange = (newLang: string) => {
    setSelectedLang(newLang);
    const matching = voices.filter((v) => v.language === newLang);
    if (matching.length > 0) setSelectedVoice(matching[0].voice_id);
    if (LANGUAGE_SAMPLES[newLang]) setSpeechText(LANGUAGE_SAMPLES[newLang]);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto page-fade-in" role="region" aria-label="Speech Lab Studio">
      {/* ── 1. Top Header Banner ── */}
      <SpeechLabHeader
        currentVoiceName={currentVoiceObj.name}
        currentVoiceFlag={currentVoiceObj.flag}
        selectedLang={selectedLang}
        selectedEngine={selectedEngine}
        sunbirdApiKey={sunbirdApiKey}
      />

      {/* ── 2. Two-Column Modular Workstation ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Script Editor + Audio Player + Recent Takes */}
        <div className="xl:col-span-8 space-y-7">
          <SpeechScriptEditor
            speechText={speechText}
            onSpeechTextChange={setSpeechText}
            selectedLang={selectedLang}
            pacingSpeed={pacingSpeed}
            isSynthesizing={isSynthesizing}
            onSynthesize={handleSynthesize}
            textareaRef={textareaRef}
            onInsertText={handleInsertText}
            onResetSample={() => setSpeechText(LANGUAGE_SAMPLES[selectedLang] || '')}
          />

          <SpeechAudioMonitor
            audioUrl={audioUrl}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            estimatedDurationSec={estimatedDurationSec}
            audioTrackName={audioTrackName}
            selectedVoice={selectedVoice}
            selectedLang={selectedLang}
            speechText={speechText}
            togglePlayPause={togglePlayPause}
            replayAudio={replayAudio}
            seekAudio={seekAudio}
            navigate={navigate}
          />

          <SpeechRecentTakes
            takes={recentTakes}
            onClearTakes={() => setRecentTakes([])}
            onPlayTake={(url, name, lang, engine) => playTrack(url, name, lang, engine)}
          />
        </div>

        {/* Right Column (4 cols): Parameter Controls Rack */}
        <div className="xl:col-span-4 space-y-7">
          <SpeechControlsRack
            selectedLang={selectedLang}
            onLangChange={handleLangChange}
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            selectedEngine={selectedEngine}
            onEngineChange={setSelectedEngine}
            pacingSpeed={pacingSpeed}
            onPacingSpeedChange={setPacingSpeed}
            speechPitch={speechPitch}
            onSpeechPitchChange={setSpeechPitch}
            voices={voices}
            sunbirdApiKey={sunbirdApiKey}
          />
        </div>
      </div>
    </div>
  );
}
