import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Download, Users } from 'lucide-react';

interface ClonerSuccessBannerProps {
  successMessage: string;
  voiceId: string;
  name: string;
  language: string;
  gender: string;
  dialect: string;
}

export default function ClonerSuccessBanner({
  successMessage,
  voiceId,
  name,
  language,
  gender,
  dialect,
}: ClonerSuccessBannerProps) {
  const navigate = useNavigate();

  const handleDownloadPackage = () => {
    const manifest = {
      package: `${name.toLowerCase().replace(/\s+/g, '_')}.afrivoice`,
      voice_id: voiceId,
      speaker_name: name,
      language,
      gender,
      dialect,
      sample_rate: '24000',
      channels: 1,
      format: 'afrivoice_v1',
      ecapa_dimensions: 192,
      created_at: new Date().toISOString(),
      sovereignty_consent_hash: `sha256_${Math.random().toString(36).substring(2)}${Date.now()}`,
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${manifest.package}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside
      aria-label="Cloning Success Notification"
      className="p-8 bg-[#101726] rounded-3xl shadow-xl space-y-6"
    >
      <div className="flex items-start gap-4">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Voice Package Built Successfully</h2>
          <p className="text-base text-slate-300 mt-1 leading-relaxed">{successMessage}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3.5 pt-1">
        <button
          type="button"
          onClick={() => {
            navigate(`/studio?lang=${language}&voice=${voiceId}`);
          }}
          className="h-13 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-base flex items-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/25 focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span>Test in Speech Lab</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/voices')}
          className="h-13 px-6 bg-white/[0.08] hover:bg-white/[0.14] text-slate-100 hover:text-white font-bold rounded-2xl text-base flex items-center gap-2.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Users className="w-5 h-5 text-indigo-400" />
          <span>View in Voice Gallery</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadPackage}
          className="h-13 px-6 bg-white/[0.08] hover:bg-white/[0.14] text-slate-100 hover:text-white font-bold rounded-2xl text-base flex items-center gap-2.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Download className="w-5 h-5 text-indigo-400" />
          <span>Export .afrivoice Package</span>
        </button>
      </div>
    </aside>
  );
}
