import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  Film,
  Users,
  Dna,
  MessageSquare,
  HardDrive,
  Key,
  Menu,
  X,
  ArrowLeft,
  SlidersHorizontal,
  Settings,
  Cloud,
  Server,
} from 'lucide-react';
import GithubIcon from '../GithubIcon';
import type { ServerState } from './layoutConfig';

interface StudioHeaderProps {
  pathname: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
  cloudConnected: boolean;
  server: ServerState;
  onOpenKeyModal: () => void;
  keyTriggerRef: React.RefObject<HTMLButtonElement>;
}

export default function StudioHeader({
  pathname,
  menuOpen,
  onToggleMenu,
  cloudConnected,
  server,
  onOpenKeyModal,
  keyTriggerRef,
}: StudioHeaderProps) {
  const activeRoom =
    pathname.startsWith('/dubbing') ? { label: 'Dubbing Room', icon: Film } :
    pathname.startsWith('/agent') ? { label: 'Live Agent', icon: MessageSquare } :
    pathname.startsWith('/voices') ? { label: 'Voice Gallery', icon: Users } :
    pathname.startsWith('/cloner') ? { label: 'Voice Cloner', icon: Dna } :
    pathname.startsWith('/mastering') ? { label: 'Mastering Rack', icon: SlidersHorizontal } :
    pathname.startsWith('/models') ? { label: 'Neural Model Hub', icon: HardDrive } :
    pathname.startsWith('/settings') ? { label: 'Engine Settings', icon: Settings } :
    { label: 'Speech Lab', icon: Mic };

  const RoomIcon = activeRoom.icon;

  return (
    <header className="h-18 shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] bg-[#0c1220]/95 backdrop-blur-md z-30">
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={onToggleMenu}
          className="md:hidden h-11 w-11 inline-flex items-center justify-center rounded-xl text-slate-300 hover:bg-white/[0.06] outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 cursor-pointer"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <Link
          to="/studio"
          className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 group"
        >
          <div className="p-1 rounded-xl bg-indigo-500/10 group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">LingualDub</span>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
            Studio
          </span>
        </Link>

        {/* Breadcrumb separator & Active Room Badge */}
        <div className="hidden sm:flex items-center gap-2.5 pl-3 text-sm sm:text-base font-medium text-slate-400">
          <span className="text-slate-600 font-bold">/</span>
          <span className="flex items-center gap-2 text-white font-bold">
            <RoomIcon className="w-4.5 h-4.5 text-indigo-400" aria-hidden="true" />
            {activeRoom.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status Pills */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-300">
          <span
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white/[0.05] text-slate-200 text-xs sm:text-sm font-semibold"
            title={cloudConnected ? 'Sunbird Regional Cloud Token active' : 'Click API Key to configure token'}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${cloudConnected ? 'bg-emerald-400' : 'bg-slate-600'}`}
              aria-hidden="true"
            />
            <Cloud className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <span>{cloudConnected ? 'Sunbird Cloud' : 'Cloud Offline'}</span>
          </span>

          <span
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white/[0.05] text-slate-200 text-xs sm:text-sm font-semibold"
            title={
              server === 'online'
                ? 'Local LingualDub Python backend connected on :8000'
                : 'Local server offline. Cloud and browser speech engines remain available.'
            }
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${server === 'online' ? 'bg-emerald-400' : 'bg-slate-600'}`}
              aria-hidden="true"
            />
            <Server className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <span>{server === 'checking' ? 'Probing…' : server === 'online' ? 'Local Edge :8000' : 'Edge Offline'}</span>
          </span>
        </div>

        <button
          ref={keyTriggerRef}
          type="button"
          onClick={onOpenKeyModal}
          className="inline-flex items-center gap-2 h-11 px-4.5 rounded-xl text-sm sm:text-base font-bold text-slate-200 bg-white/[0.06] hover:bg-white/[0.1] outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors cursor-pointer"
        >
          <Key className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <span className="hidden sm:inline">API Key</span>
        </button>

        <Link
          to="/"
          className="inline-flex items-center gap-2 h-11 px-4.5 rounded-xl text-sm sm:text-base font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
          title="Return to marketing website"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span className="hidden md:inline">Website</span>
        </Link>

        <a
          href="https://github.com/allannuwamanya/lingualdub"
          target="_blank"
          rel="noreferrer"
          aria-label="LingualDub on GitHub"
          className="h-11 w-11 inline-flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
        >
          <GithubIcon className="w-5 h-5" />
        </a>
      </div>
    </header>
  );
}
