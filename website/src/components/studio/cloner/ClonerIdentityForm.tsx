import React from 'react';
import { UserCheck } from 'lucide-react';

interface ClonerIdentityFormProps {
  name: string;
  onNameChange: (v: string) => void;
  language: string;
  onLanguageChange: (v: string) => void;
  gender: string;
  onGenderChange: (v: string) => void;
  dialect: string;
  onDialectChange: (v: string) => void;
}

export default function ClonerIdentityForm({
  name,
  onNameChange,
  language,
  onLanguageChange,
  gender,
  onGenderChange,
  dialect,
  onDialectChange,
}: ClonerIdentityFormProps) {
  return (
    <section
      aria-label="Speaker Identity and Linguistic Dialect"
      className="bg-[#101726] rounded-3xl p-7 sm:p-8 shadow-xl space-y-5"
    >
      <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4">
        <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-300 text-sm font-bold flex items-center justify-center shrink-0">
          1
        </span>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
            Speaker Identity & Linguistic Dialect
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify the speaker persona, geographic dialect, and pitch register.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Model Name */}
        <div>
          <label htmlFor="clone-name" className="text-sm font-semibold text-slate-300 block mb-2">
            Voice Model Name <span className="text-rose-400">*</span>
          </label>
          <input
            id="clone-name"
            type="text"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Namukasa (Radio Presenter)"
            className="w-full bg-[#070b14] rounded-xl px-4 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all h-12"
          />
        </div>

        {/* Primary Language */}
        <div>
          <label htmlFor="clone-lang" className="text-sm font-semibold text-slate-300 block mb-2">
            Primary Native Language <span className="text-rose-400">*</span>
          </label>
          <select
            id="clone-lang"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full bg-[#070b14] rounded-xl px-4 text-base text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all h-12 cursor-pointer"
          >
            <optgroup label="🇺🇬 Uganda">
              <option value="lug">Luganda (Central Buganda)</option>
              <option value="nyn">Runyankore (Western Region)</option>
              <option value="ach">Acholi (Northern Luo)</option>
            </optgroup>
            <optgroup label="🇰🇪🇷🇼 East Africa">
              <option value="swa">Kiswahili (East Africa)</option>
              <option value="kin">Kinyarwanda (Rwanda)</option>
            </optgroup>
            <optgroup label="🇳🇬🇸🇳 West Africa">
              <option value="yor">Yoruba (Nigeria)</option>
              <option value="ibo">Igbo (Nigeria)</option>
              <option value="hau">Hausa (Nigeria / Sahel)</option>
              <option value="wol">Wolof (Senegal)</option>
            </optgroup>
            <optgroup label="🇿🇦 Southern Africa">
              <option value="zul">isiZulu (South Africa)</option>
              <option value="xho">isiXhosa (South Africa)</option>
            </optgroup>
            <optgroup label="🇪🇹🇸🇴 Horn of Africa">
              <option value="amh">Amharic (Ethiopia)</option>
              <option value="som">Af-Soomaali (Somalia)</option>
            </optgroup>
            <optgroup label="🇨🇩 Central Africa">
              <option value="lin">Lingala (DR Congo)</option>
            </optgroup>
          </select>
        </div>

        {/* Gender Timbre */}
        <div>
          <label htmlFor="clone-gender" className="text-sm font-semibold text-slate-300 block mb-2">
            Gender Timbre
          </label>
          <select
            id="clone-gender"
            value={gender}
            onChange={(e) => onGenderChange(e.target.value)}
            className="w-full bg-[#070b14] rounded-xl px-4 text-base text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all h-12 cursor-pointer"
          >
            <option value="Female">Female (Soprano / Mezzo)</option>
            <option value="Male">Male (Baritone / Tenor)</option>
          </select>
        </div>

        {/* Regional Accent / Dialect */}
        <div>
          <label htmlFor="clone-dialect" className="text-sm font-semibold text-slate-300 block mb-2">
            Regional Accent / Dialect
          </label>
          <input
            id="clone-dialect"
            type="text"
            value={dialect}
            onChange={(e) => onDialectChange(e.target.value)}
            placeholder="e.g. Kampala Urban, Jinja Busoga"
            className="w-full bg-[#070b14] rounded-xl px-4 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all h-12"
          />
        </div>
      </div>
    </section>
  );
}
