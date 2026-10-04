import React from 'react';
import HomeHero from '../components/home/HomeHero';
import HomeAuditionShowcase from '../components/home/HomeAuditionShowcase';
import HomeStatsStrip from '../components/home/HomeStatsStrip';
import HomePillars from '../components/home/HomePillars';
import HomeArchitectureSection from '../components/home/HomeArchitectureSection';
import HomeCtaSection from '../components/home/HomeCtaSection';

export default function Home() {
  return (
    <div className="bg-[#070b14] text-white selection:bg-indigo-600 selection:text-white page-fade-in">
      {/* ── Hero Section with Glow and Live Audition ── */}
      <section className="relative pt-28 pb-24 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
        <HomeHero />
        <HomeAuditionShowcase />
      </section>

      {/* ── Key Statistics Strip ── */}
      <HomeStatsStrip />

      {/* ── 4 Core Pillars of African Speech AI ── */}
      <HomePillars />

      {/* ── Architecture & Framework Pipeline Spec ── */}
      <HomeArchitectureSection />

      {/* ── Bottom Call to Action ── */}
      <HomeCtaSection />
    </div>
  );
}
