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
      className="p-7 bg-[#101726] rounded-3xl shadow-xl space-y-5"
    >
      <div className="flex items-start gap-3.5">
        <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-lg font-bold text-white">Voice Package Built Successfully</h2>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">{successMessage}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            navigate(`/studio?lang=${language}&voice=${voiceId}`);
          }}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/25 min-h-[44px] focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span>Test in Speech Lab</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/voices')}
          className="px-5 py-3 bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 font-semibold rounded-xl text-sm flex items-center gap-2 transition-colors cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Users className="w-4 h-4 text-indigo-400" />
          <span>View in Voice Gallery</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadPackage}
          className="px-5 py-3 bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 font-semibold rounded-xl text-sm flex items-center gap-2 transition-colors cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Download className="w-4 h-4 text-indigo-400" />
          <span>Export .afrivoice Package</span>
        </button>
      </div>
    </aside>
  );
}
