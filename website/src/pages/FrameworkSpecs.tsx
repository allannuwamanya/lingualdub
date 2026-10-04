import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Layers,
  Cpu,
  BookOpen,
  FlaskConical,
  Compass,
} from 'lucide-react';
import Architecture from './Architecture';
import Abstractions from './Abstractions';
import Research from './Research';
import Docs from './Docs';
import Overview from './Overview';

interface FrameworkSpecsProps {
  defaultTab?: 'architecture' | 'abstractions' | 'research' | 'docs' | 'overview';
}

const TABS = [
  { id: 'architecture', label: 'Architecture & DAG', icon: Cpu },
  { id: 'abstractions', label: 'Core Abstractions', icon: Layers },
  { id: 'research', label: 'Research Whitepaper', icon: FlaskConical },
  { id: 'docs', label: 'SDK & API Reference', icon: BookOpen },
  { id: 'overview', label: 'Project Mission', icon: Compass },
] as const;

type TabId = typeof TABS[number]['id'];

export default function FrameworkSpecs({ defaultTab = 'architecture' }: FrameworkSpecsProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Detect active tab from prop or URL
  const getInitialTab = (): TabId => {
    const path = location.pathname.replace(/^\//, '');
    if (['architecture', 'abstractions', 'research', 'docs', 'overview'].includes(path)) {
      return path as TabId;
    }
    return defaultTab;
  };

  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname, defaultTab]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    navigate(`/${tabId}`);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col page-fade-in">
      {/* Studio Sub-header for Specs & Architecture */}
      <div className="border-b border-white/[0.06] bg-[#070b14]/95 backdrop-blur-md sticky top-14 z-30 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  Framework Specifications & Knowledge Base
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/[0.06] text-slate-300 font-mono">
                  v0.1.0 Stable
                </span>
              </div>
              <h1 className="text-sm font-semibold text-slate-200 mt-0.5">
                Interoperable Speech-AI Architecture for African Languages
              </h1>
            </div>
          </div>

          {/* Sub-tabs pill navigation with 44px minimum touch targets */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none"
            role="tablist"
            aria-label="Framework documentation tabs"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl text-[15px] font-medium transition-all whitespace-nowrap min-h-[44px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold ring-1 ring-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05] bg-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content Display */}
      <main className="flex-1 pb-16" role="tabpanel">
        {activeTab === 'architecture' && <Architecture />}
        {activeTab === 'abstractions' && <Abstractions />}
        {activeTab === 'research' && <Research />}
        {activeTab === 'docs' && <Docs />}
        {activeTab === 'overview' && <Overview />}
      </main>
    </div>
  );
}
