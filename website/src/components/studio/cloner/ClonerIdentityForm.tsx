import React from 'react';

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
      className="bg-[#101726] rounded-3xl p-7 sm:p-9 shadow-xl space-y-6"
    >
      <div className="flex items-center gap-4 border-b border-white/[0.06] pb-5">
        <span className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-300 text-base font-black flex items-center justify-center shrink-0">
          1
        </span>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Speaker Identity & Linguistic Dialect
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-1">
            Identify the speaker persona, geographic dialect, and pitch register.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Model Name */}
        <div className="space-y-2">
          <label htmlFor="clone-name" className="text-base font-bold text-slate-200 block">
            Voice Model Name <span className="text-rose-400">*</span>
          </label>
          <input
            id="clone-name"
            type="text"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Namukasa (Radio Presenter)"
            className="w-full bg-[#070b14] rounded-2xl px-5 text-base sm:text-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all h-14"
          />
        </div>

        {/* Primary Language */}
        <div className="space-y-2">
          <label htmlFor="clone-lang" className="text-base font-bold text-slate-200 block">
            Primary Native Language <span className="text-rose-400">*</span>
          </label>
          <select
            id="clone-lang"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full bg-[#070b14] rounded-2xl px-5 text-base sm:text-lg text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all h-14 cursor-pointer"
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

        {/* Gender */}
        <div className="space-y-2">
          <label htmlFor="clone-gender" className="text-base font-bold text-slate-200 block">
            Gender Pitch Profile <span className="text-rose-400">*</span>
          </label>
          <select
            id="clone-gender"
            value={gender}
            onChange={(e) => onGenderChange(e.target.value)}
            className="w-full bg-[#070b14] rounded-2xl px-5 text-base sm:text-lg text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all h-14 cursor-pointer"
          >
            <option value="Female">Female (Alto / Soprano Range)</option>
            <option value="Male">Male (Tenor / Bass Range)</option>
            <option value="Neutral">Neutral / Youthful Range</option>
          </select>
        </div>

        {/* Dialect / Accent Description */}
        <div className="space-y-2">
          <label htmlFor="clone-dialect" className="text-base font-bold text-slate-200 block">
            Regional Accent / Speaking Style
          </label>
          <input
            id="clone-dialect"
            type="text"
            value={dialect}
            onChange={(e) => onDialectChange(e.target.value)}
            placeholder="e.g. Kampala Central, Nairobi Sheng, Broadcast"
            className="w-full bg-[#070b14] rounded-2xl px-5 text-base sm:text-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all h-14"
          />
        </div>
      </div>
    </section>
  );
}
