import {
  Mic,
  Film,
  Users,
  Dna,
  MessageSquare,
  HardDrive,
  SlidersHorizontal,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  end?: boolean;
  icon?: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const WEBSITE_NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '/', end: true },
  { label: 'Overview', to: '/overview', end: false },
  { label: 'Docs', to: '/docs', end: false },
  { label: 'Abstractions', to: '/abstractions', end: false },
  { label: 'Research', to: '/research', end: false },
  { label: 'Architecture', to: '/architecture', end: false },
];

export const STUDIO_NAV: NavGroup[] = [
  {
    label: 'Create',
    items: [
      { label: 'Speech Lab', to: '/studio', icon: Mic, end: true },
      { label: 'Dubbing Room', to: '/dubbing', icon: Film, end: false },
      { label: 'Live Agent', to: '/agent', icon: MessageSquare, end: false },
    ],
  },
  {
    label: 'Library',
    items: [
      { label: 'Voices', to: '/voices', icon: Users, end: false },
      { label: 'Voice Cloner', to: '/cloner', icon: Dna, end: false },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Mastering', to: '/mastering', icon: SlidersHorizontal, end: false },
      { label: 'Model Hub', to: '/models', icon: HardDrive, end: false },
      { label: 'Settings', to: '/settings', icon: Settings, end: false },
    ],
  },
];

export const STUDIO_PATHS = [
  '/studio',
  '/speech',
  '/dubbing',
  '/voices',
  '/cloner',
  '/agent',
  '/models',
  '/mastering',
  '/settings',
];

export type ServerState = 'checking' | 'online' | 'offline';
