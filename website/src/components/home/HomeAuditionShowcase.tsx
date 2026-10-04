import React, { useState } from 'react';
import { Radio, Play, Pause } from 'lucide-react';

const SAMPLE_VOICES = [
  {
    lang: 'lug',
    label: 'Oluganda (Uganda)',
    speaker: 'Nakato (Central Dialect)',
    text: "Oli otya nnyabo! LingualDub ekoze amagero mu kussa amaloboozi gaffe ag'ennono mu tekinologiya ow'omulembe.",
    flag: '🇺🇬',
  },
  {
    lang: 'swa',
    label: 'Kiswahili (East Africa)',
    speaker: 'Mwangi (Nairobi Prosody)',
    text: 'Habari yako! Tunaleta mapinduzi ya sauti za Kiafrika kupitia mifumo ya kijasusi ya hali ya juu.',
    flag: '🇰🇪',
  },
  {
    lang: 'yor',
    label: 'Èdè Yorùbá (Nigeria)',
    speaker: 'Adebayo (Lagos Accent)',
    text: 'Ẹ ku ojumo! Imọ-ẹrọ ohun titun fun awọn ede Afirika ti de pẹlu pipe to daju.',
    flag: '🇳🇬',
  },
];

export default function HomeAuditionShowcase() {
  const [activeVoiceIndex, setActiveVoiceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayVoice = (text: string, lang: string) => {
    if (typeof window === 'undefined') return;

    if (isPlaying) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(
        (v) =>
          v.lang.toLowerCase().includes(lang) ||
          v.name.toLowerCase().includes(lang)
      );
      if (match) utterance.voice = match;
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative z-10">
      <div className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Live Phonetic Audition Preview
              </h2>
              <p className="text-base text-slate-300">
                Hear authentic neural cadence synthesized directly in your browser.
              </p>
            </div>
          </div>

          {/* Language Ghost Pills */}
          <div className="flex items-center gap-1.5 bg-[#0b101c] p-1.5 rounded-xl">
            {SAMPLE_VOICES.map((item, idx) => (
              <button
                key={item.lang}
                type="button"
                onClick={() => {
                  setActiveVoiceIndex(idx);
                  if (isPlaying) {
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    setIsPlaying(false);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeVoiceIndex === idx
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{item.flag}</span>
                <span className="hidden sm:inline">{item.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quote and Play Bar */}
        <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="text-sm font-mono text-indigo-400 mb-1.5 font-semibold">
              {SAMPLE_VOICES[activeVoiceIndex].speaker}
            </div>
            <p className="text-lg sm:text-xl text-slate-100 italic leading-relaxed">
              "{SAMPLE_VOICES[activeVoiceIndex].text}"
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              handlePlayVoice(
                SAMPLE_VOICES[activeVoiceIndex].text,
                SAMPLE_VOICES[activeVoiceIndex].lang
              )
            }
            className="h-13 px-7 rounded-xl font-bold text-base bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md shrink-0"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 text-white" />
                <span>Pause Audition</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 text-white" />
                <span>Audition Voice</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
