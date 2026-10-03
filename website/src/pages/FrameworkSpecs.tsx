import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Layers,
  Cpu,
  BookOpen,
  FlaskConical,
  Compass,
  ArrowRight,
  ExternalLink,
  Sparkles,
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
  { id: 'architecture', label: 'Architecture & Pipeline DAG', icon: Cpu, badge: 'System Blueprint' },
  { id: 'abstractions', label: 'Core Abstractions', icon: Layers, badge: '5 Primitives' },
  { id: 'research', label: 'Research Whitepaper', icon: FlaskConical, badge: 'SALT Baselines' },
  { id: 'docs', label: 'SDK & API Reference', icon: BookOpen, badge: 'Python + CLI' },
  { id: 'overview', label: 'Project Mission', icon: Compass, badge: 'Overview' },
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
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col">
      {/* Studio Sub-header for Specs & Architecture */}
      <div className="border-b border-slate-800/80 bg-[#090d18]/90 backdrop-blur-md sticky top-14 z-30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  Framework Specifications & Knowledge Base
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  v0.1.0 Stable
                </span>
              </div>
              <h1 className="text-sm font-semibold text-slate-200">
                Interoperable Speech-AI Architecture for African Languages
              </h1>
            </div>
          </div>

          {/* Sub-tabs pill navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-400/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content Display */}
      <main className="flex-1 pb-16">
        {activeTab === 'architecture' && <Architecture />}
        {activeTab === 'abstractions' && <Abstractions />}
        {activeTab === 'research' && <Research />}
        {activeTab === 'docs' && <Docs />}
        {activeTab === 'overview' && <Overview />}
      </main>
    </div>
  );
}
