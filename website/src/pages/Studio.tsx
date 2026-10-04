import React from 'react';
import type { StudioTab } from '../types/studio';
import { StudioAudioProvider, useStudioAudio } from '../context/StudioAudioContext';
import SpeechLab from '../components/studio/SpeechLab';
import VoiceGallery from '../components/studio/VoiceGallery';
import VoiceCloner from '../components/studio/VoiceCloner';
import LiveAgent from '../components/studio/LiveAgent';
import DubbingRoom from '../components/studio/DubbingRoom';
import MasteringRack from '../components/studio/MasteringRack';
import ModelHub from '../components/studio/ModelHub';
import EngineSettings from '../components/studio/EngineSettings';
import { Info } from 'lucide-react';

interface StudioProps {
  initialTab?: StudioTab;
}

function StudioContent({ activeTab }: { activeTab: StudioTab }) {
  const { notice, setNotice } = useStudioAudio();

  return (
    <div className="h-full flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
      {/* ── System Notice Banner ── */}
      {notice && (
        <div className="mb-6 p-4 rounded-2xl bg-indigo-500/15 flex items-start justify-between gap-3 text-base text-indigo-200 backdrop-blur-md shadow-lg max-w-[1700px] mx-auto">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{notice}</p>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-indigo-400 hover:text-white p-1 rounded-lg hover:bg-indigo-500/20 transition-colors cursor-pointer"
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Active Room Workstation ── */}
      {activeTab === 'speech' && <SpeechLab />}
      {activeTab === 'gallery' && <VoiceGallery />}
      {activeTab === 'cloner' && <VoiceCloner />}
      {activeTab === 'agent' && <LiveAgent />}
      {activeTab === 'dubbing' && <DubbingRoom />}
      {activeTab === 'mastering' && <MasteringRack />}
      {activeTab === 'models' && <ModelHub />}
      {activeTab === 'settings' && <EngineSettings />}
    </div>
  );
}

export default function Studio({ initialTab = 'speech' }: StudioProps) {
  return (
    <StudioAudioProvider>
      <StudioContent activeTab={initialTab} />
    </StudioAudioProvider>
  );
}
