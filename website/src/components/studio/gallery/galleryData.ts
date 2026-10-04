import type { VoiceOption } from '../../../types/studio';

export type RegionFilterId = 'all' | 'ug' | 'ea' | 'wa' | 'za' | 'horn' | 'ca' | 'cloned';

export interface RegionTab {
  id: RegionFilterId;
  label: string;
  flag: string;
  languages?: string[];
}

export const REGION_TABS: RegionTab[] = [
  { id: 'all', label: 'All Regions', flag: '🌍' },
  { id: 'ug', label: 'Uganda', flag: '🇺🇬', languages: ['lug', 'nyn', 'ach'] },
  { id: 'ea', label: 'East Africa', flag: '🇰🇪🇷🇼', languages: ['swa', 'kin'] },
  { id: 'wa', label: 'West Africa', flag: '🇳🇬🇸🇳', languages: ['yor', 'ibo', 'hau', 'wol'] },
  { id: 'za', label: 'Southern Africa', flag: '🇿🇦', languages: ['zul', 'xho'] },
  { id: 'horn', label: 'Horn of Africa', flag: '🇪🇹🇸🇴', languages: ['amh', 'som'] },
  { id: 'ca', label: 'Central Africa', flag: '🇨🇩', languages: ['lin'] },
  { id: 'cloned', label: 'Custom Clones', flag: '🧬' },
];

export interface VoiceGreeting {
  native: string;
  english: string;
  phonetics?: string;
}

export const VOICE_GREETINGS: Record<string, VoiceGreeting> = {
  lug: {
    native: 'Oli otya nnyabo n’omwami! Ndi mubeezi wo ow’amaloboozi mu LingualDub.',
    english: 'Hello madam and sir! I am your voice assistant in LingualDub.',
  },
  nyn: {
    native: 'Mwebare kwija! Ndi omubeezi wawe omu Runyankore n’orulimi rw’eka.',
    english: 'Welcome! I am your assistant in Runyankore and mother tongue.',
  },
  ach: {
    native: 'Wajoli ducu! Man obedo dwon me Leb Acoli ma pigi tek.',
    english: 'Welcome everyone! This is the authentic voice of Leb Acoli.',
  },
  swa: {
    native: 'Habari yako! Karibu kwenye mfumo wa sauti asilia wa LingualDub.',
    english: 'Hello! Welcome to LingualDub native African voice synthesis.',
  },
  yor: {
    native: 'Ẹ ku ojumo o! Eyi ni ohun adayeba lati ile Yoruba.',
    english: 'Good day! This is a natural voice from the Yoruba heritage.',
  },
  ibo: {
    native: 'Nnọọ nwanne m! Nke a bụ olu sitere n’ala nna anyị.',
    english: 'Welcome my kin! This is an authentic voice from our homeland.',
  },
  hau: {
    native: 'Barka da rana! Wannan muryar zamani ce mai dadin sauraro.',
    english: 'Good afternoon! This is a modern, melodious voice.',
  },
  zul: {
    native: 'Sawubona mzali! Leli yizwi lendabuko laseNingizimu Afrika.',
    english: 'Greetings! This is a native voice of South Africa.',
  },
  xho: {
    native: 'Molo mhlobo wam! Ndingu mzukulwana wesiXhosa esicocekileyo.',
    english: 'Hello my friend! This is authentic isiXhosa speech.',
  },
  kin: {
    native: 'Muraho neza! Nitwa ijwi ryawe ry’umwimerere mu Kinyarwanda.',
    english: 'Warm greetings! I am your authentic voice in Kinyarwanda.',
  },
  amh: {
    native: 'እንኳን ደህና መጡ! ይህ የአማርኛ ዜማና የተፈጥሮ ድምጽ ነው።',
    phonetics: 'Inkuan dehna metu! Yih yeAmharigna zemana yetefetro dimts new.',
    english: 'Welcome! This is the natural cadence and melody of Amharic speech.',
  },
  som: {
    native: 'Iska warran asxabeey! Ku soo dhowow codka afka hooyo.',
    english: 'Greetings friend! Welcome to the mother tongue voice.',
  },
  lin: {
    native: 'Mbote na yo nyonso! Naza mongongo ya sika ya Lingála ya Kongo.',
    english: 'Hello to all! I am the fresh voice of Congo Lingala.',
  },
  wol: {
    native: 'Dalal ak jamm! Maa ngi tudd sunu kàddu ci làkku Wolof.',
    english: 'Welcome in peace! This is our voice in the Wolof language.',
  },
};

export function getVoiceGreeting(lang: string, speakerName: string): VoiceGreeting {
  const greeting = VOICE_GREETINGS[lang];
  if (greeting) return greeting;
  return {
    native: `Hello! I am ${speakerName}, ready to speak with authentic African cadence.`,
    english: `Hello! I am ${speakerName}, ready to speak with authentic African cadence.`,
  };
}

export function matchesRegionFilter(voice: VoiceOption, filter: RegionFilterId): boolean {
  if (filter === 'all') return true;
  if (filter === 'cloned') return Boolean(voice.isCloned || voice.voice_id.startsWith('clone_'));
  
  const tab = REGION_TABS.find((t) => t.id === filter);
  if (!tab || !tab.languages) return true;
  return tab.languages.includes(voice.language);
}
