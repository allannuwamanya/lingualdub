import React from 'react';

const STATS = [
  { value: '51+', label: 'African Languages' },
  { value: '< 250ms', label: 'Barge-In Latency' },
  { value: '192-d', label: 'ECAPA Embeddings' },
  { value: 'MIT', label: 'Open Source License' },
];

export default function HomeStatsStrip() {
  return (
    <section className="bg-[#0b101c] py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="text-4xl sm:text-5xl font-black text-white tracking-tight">{s.value}</dt>
              <dd className="text-base text-slate-300 mt-2 font-medium">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
