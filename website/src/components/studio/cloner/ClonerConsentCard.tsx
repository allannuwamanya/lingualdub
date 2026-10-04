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
      className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-xl space-y-6"
    >
      <div className="flex items-center gap-4 border-b border-white/[0.06] pb-5">
        <span className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-300 text-base font-black flex items-center justify-center shrink-0">
          3
        </span>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            African Ethical Voice Sovereignty Certificate
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-1">
            Cryptographically sealed provenance ensuring indigenous African voice rights.
          </p>
        </div>
      </div>

      <div className="p-6 bg-[#070b14] rounded-2xl space-y-4">
        <label className="flex items-start gap-4 cursor-pointer select-none">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="mt-1 accent-indigo-600 w-6 h-6 rounded-lg cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-indigo-500"
          />
          <div className="text-base text-slate-300 leading-relaxed">
            <span className="font-extrabold text-white flex items-center gap-2 mb-1.5 text-base sm:text-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Irrevocable Speaker Consent & Cryptographic Sovereignty</span>
            </span>
            I certify and affirm that I have explicit, verifiable consent from the voice donor to clone, synthesize, and store their acoustic timbre under LingualDub&apos;s cryptographic sovereignty framework. The voice owner retains full rights and provenance over their acoustic identity.
          </div>
        </label>

        <div className="flex items-center gap-2.5 pt-2 text-sm text-slate-400 font-mono">
          <Lock className="w-4 h-4 text-indigo-400" />
          <span>SHA-256 Donor Signature Token will be embedded into container header</span>
        </div>
      </div>
    </section>
  );
}
