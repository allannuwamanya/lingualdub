import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface ClonerConsentCardProps {
  consent: boolean;
  onConsentChange: (c: boolean) => void;
}

export default function ClonerConsentCard({
  consent,
  onConsentChange,
}: ClonerConsentCardProps) {
  return (
    <section
      aria-label="African Ethical Voice Sovereignty Certificate"
      className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-5"
    >
      <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4">
        <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-300 text-sm font-bold flex items-center justify-center shrink-0">
          3
        </span>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
            African Ethical Voice Sovereignty Certificate
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically sealed provenance ensuring indigenous African voice rights.
          </p>
        </div>
      </div>

      <div className="p-5 bg-[#070b14] rounded-2xl space-y-3">
        <label className="flex items-start gap-4 cursor-pointer select-none">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="mt-1 accent-indigo-600 w-5 h-5 rounded cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500"
          />
          <div className="text-sm text-slate-300 leading-relaxed">
            <span className="font-semibold text-white flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Irrevocable Speaker Consent & Cryptographic Sovereignty</span>
            </span>
            I certify and affirm that I have explicit, verifiable consent from the voice donor to clone, synthesize, and store their acoustic timbre under LingualDub&apos;s cryptographic sovereignty framework. The voice owner retains full rights and provenance over their acoustic identity.
          </div>
        </label>

        <div className="flex items-center gap-2 pt-2 text-xs text-slate-500 font-mono">
          <Lock className="w-3.5 h-3.5 text-indigo-400/80" />
          <span>SHA-256 Donor Signature Token will be embedded into container header</span>
        </div>
      </div>
    </section>
  );
}
