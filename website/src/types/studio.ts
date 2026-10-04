export interface ModelItem {
  model_id: string;
  name: string;
  family: string;
  task: string;
  languages: string[];
  size_mb: number;
  ram_mb: number;
  is_downloaded: boolean;
  local_path: string | null;
  description: string;
}

export interface VoiceOption {
  voice_id: string;
  name: string;
  language: string;
  gender: string;
  dialect?: string;
  country?: string;
  flag?: string;
}

export interface HardwareInfo {
  accelerator: string;
  compute_class: string;
  device_name: string;
  vram_mb: number;
  system_ram_mb: number;
  recommended_gguf_quant: string;
}

export interface DomainTemplate {
  id: string;
  label: string;
  text: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  audioBase64?: string;
  interrupted?: boolean;
  time: string;
}

export type StudioTab =
  | 'speech'
  | 'gallery'
  | 'cloner'
  | 'agent'
  | 'dubbing'
  | 'mastering'
  | 'models'
  | 'settings';

export const NATIVE_LANG_NAMES: Record<string, string> = {
  lug: 'Oluganda',
  nyn: 'Orunyankore',
  ach: 'Leb Acoli',
  swa: 'Kiswahili',
  yor: 'Èdè Yorùbá',
  ibo: 'Asụsụ Igbo',
  hau: 'Harshen Hausa',
  zul: 'isiZulu',
  xho: 'isiXhosa',
  kin: 'Ikinyarwanda',
  amh: 'አማርኛ',
  som: 'Af-Soomaali',
  lin: 'Lingála',
  wol: 'Wolof',
};

export const LANGUAGE_SAMPLES: Record<string, string> = {
  lug: 'Mwaniriziddwa mu buweereza bwaffe obw’obulamu obw’omulembe. Mwatuula wansi nga tukyusa amawulire gammwe.',
  nyn: 'Mwebare kwija omu buheereza bw’eby’amagara bwaitu. Mushitame omu ntebe tureebe ku turikubakwatsaho.',
  ach: 'Wajoli i kin dog tic me yotkom ma konyo lwak. Bed piny wek wawac kwedi ikom kit me gwoko kom.',
  swa: 'Karibu katika huduma zetu za afya zilizoboreshwa. Tafadhali keti wakati tukiandikisha taarifa zako.',
  yor: 'Ẹ kaabọ si ile-iṣẹ ilera wa ti ode oni. Ẹ jọwọ joko lakoko ti a n ṣe iforukọsilẹ rẹ.',
  ibo: 'Nnọọ na ọrụ ahụike anyị nke oge a. Biko nọdụ ala mgbe anyị na-edebanye aha gị.',
  hau: 'Barka da zuwa asibitinmu na zamani. Da fatan za a zauna yayin da muke tattara bayananku.',
  zul: 'Siyakwamukela emtholampilo wethu wanamuhla. Sicela uhlale phansi ngenkathi sibhalisa imininingwane yakho.',
  xho: 'Wamkelekile kwinkonzo yethu yezempilo yanamhlanje. Nceda uhlale phantsi ngelixa sibhalisa iinkcukacha zakho.',
  kin: 'Murakaza neza muri serivisi zacu z’ubuzima zigezweho. Mwicare mu gihe tugitunganya amakuru yanyu.',
  amh: 'እንኳን ወደ ዘመናዊው የጤና አጠባበቅ አገልግሎታችን በደህና መጡ። መረጃዎትን እስክንመዘግብ ድረስ እባክዎ ይቀመጡ።',
  som: 'Ku soo dhowow adeegyadayada daryeelka caafimaad ee casriga ah. Fadlan fadhiiso inta aan macluumaadkaaga diiwaangelinayno.',
  lin: 'Boyei bolamu na mosala na biso ya bokolongono ya nzoto. Bofanda naino wana tozali kokoma makambo na bino.',
  wol: 'Dalal ak jamm ci sunu sémb bu xam-xamu wér-gi-yaram. Toogleen fi ñu lay bind.',
};

export const PRESET_VOICES: VoiceOption[] = [
  { voice_id: 'kigozi_lug', name: 'Kigozi (Central Luganda)', language: 'lug', gender: 'Male', dialect: 'Central Uganda / Buganda Urban', country: 'Uganda', flag: '🇺🇬' },
  { voice_id: 'nakato_lug', name: 'Nakato (Soft Luganda)', language: 'lug', gender: 'Female', dialect: 'Kampala Modern / Prosodic', country: 'Uganda', flag: '🇺🇬' },
  { voice_id: 'tumusiime_nyn', name: 'Tumusiime (Runyankore)', language: 'nyn', gender: 'Male', dialect: 'Western Uganda / Mbarara Accent', country: 'Uganda', flag: '🇺🇬' },
  { voice_id: 'atwooki_nyn', name: 'Atwooki (Runyankore/Rukiga)', language: 'nyn', gender: 'Female', dialect: 'Kigezi Highlands / Melodic', country: 'Uganda', flag: '🇺🇬' },
  { voice_id: 'okello_ach', name: 'Okello (Acholi / Luo)', language: 'ach', gender: 'Male', dialect: 'Northern Uganda / Gulu Dialect', country: 'Uganda', flag: '🇺🇬' },
  { voice_id: 'mwangi_swa', name: 'Mwangi (Nairobi Swahili)', language: 'swa', gender: 'Male', dialect: 'Kenya Urban / Professional', country: 'Kenya', flag: '🇰🇪' },
  { voice_id: 'zainab_swa', name: 'Zainab (Coastal Swahili)', language: 'swa', gender: 'Female', dialect: 'Mombasa / Classical Tonal Swahili', country: 'Kenya', flag: '🇰🇪' },
  { voice_id: 'adebayo_yor', name: 'Adebayo (Yoruba)', language: 'yor', gender: 'Male', dialect: 'Lagos Urban / Deep Resonance', country: 'Nigeria', flag: '🇳🇬' },
  { voice_id: 'folake_yor', name: 'Folake (Yoruba)', language: 'yor', gender: 'Female', dialect: 'Ibadan Native Accent', country: 'Nigeria', flag: '🇳🇬' },
  { voice_id: 'chukwudi_ibo', name: 'Chukwudi (Igbo)', language: 'ibo', gender: 'Male', dialect: 'Enugu Central Accent', country: 'Nigeria', flag: '🇳🇬' },
  { voice_id: 'amara_ibo', name: 'Amara (Igbo)', language: 'ibo', gender: 'Female', dialect: 'Owerri Prosodic Dialect', country: 'Nigeria', flag: '🇳🇬' },
  { voice_id: 'ibrahim_hau', name: 'Ibrahim (Hausa)', language: 'hau', gender: 'Male', dialect: 'Kano Classical Dialect', country: 'Nigeria', flag: '🇳🇬' },
  { voice_id: 'amina_hau', name: 'Amina (Hausa)', language: 'hau', gender: 'Female', dialect: 'Kaduna Soft Tonal Speech', country: 'Nigeria', flag: '🇳🇬' },
  { voice_id: 'sipho_zul', name: 'Sipho (isiZulu)', language: 'zul', gender: 'Male', dialect: 'KZN Native Accent with Clicks', country: 'South Africa', flag: '🇿🇦' },
  { voice_id: 'nomvula_zul', name: 'Nomvula (isiZulu)', language: 'zul', gender: 'Female', dialect: 'Johannesburg Contemporary Accent', country: 'South Africa', flag: '🇿🇦' },
  { voice_id: 'lungile_xho', name: 'Lungile (isiXhosa)', language: 'xho', gender: 'Female', dialect: 'Eastern Cape Authentic Inflection', country: 'South Africa', flag: '🇿🇦' },
  { voice_id: 'tadesse_amh', name: 'Tadesse (Amharic)', language: 'amh', gender: 'Male', dialect: 'Addis Ababa Formal News Cadence', country: 'Ethiopia', flag: '🇪🇹' },
  { voice_id: 'selam_amh', name: 'Selam (Amharic)', language: 'amh', gender: 'Female', dialect: 'Addis Ababa Conversational', country: 'Ethiopia', flag: '🇪🇹' },
  { voice_id: 'warsame_som', name: 'Warsame (Somali)', language: 'som', gender: 'Male', dialect: 'Mogadishu Northern Dialect', country: 'Somalia', flag: '🇸🇴' },
  { voice_id: 'gasana_kin', name: 'Gasana (Kinyarwanda)', language: 'kin', gender: 'Male', dialect: 'Kigali Standard Tone', country: 'Rwanda', flag: '🇷🇼' },
  { voice_id: 'diop_wol', name: 'Diop (Wolof)', language: 'wol', gender: 'Male', dialect: 'Dakar Urban Vernacular', country: 'Senegal', flag: '🇸🇳' },
  { voice_id: 'kabila_lin', name: 'Kabila (Lingala)', language: 'lin', gender: 'Male', dialect: 'Kinshasa Modern Rhythm', country: 'DR Congo', flag: '🇨🇩' },
];

export const DOMAIN_TEMPLATES: DomainTemplate[] = [
  {
    id: 'agritech',
    label: '🌾 Agritech & Farming',
    text: 'Okulabula eri abalimi b’ebijanjaalo: Empewo ez’ebitundu eby’enkuba zireeta ebiwuka eby’omutawaana. Kuuma ettaka nga likyali lyonjo.',
  },
  {
    id: 'fintech',
    label: '📱 Mobile Money & USSD',
    text: 'Sente zo zituuse bulungi ku ssimu yo. Omusolo ogw’emirimu gusaliddwako ebitundu bibiri ku buli kikumi.',
  },
  {
    id: 'health',
    label: '🏥 Clinical & Triage',
    text: 'Obujanjabi obw’ekyenkanya mu malwaliro: Baana bonna abali wansi w’emyaka etaano bafune empiso y’okugema omusujja ogw’omutwe mangu.',
  },
  {
    id: 'weather',
    label: '⛈️ Weather Alert',
    text: 'Okulabula ku mbeera y’obudde: Enkuba y’amaanyi n’amataba birindiriddwa mu biwonvu eby’amaserengeta ga Uganda.',
  },
  {
    id: 'chat',
    label: '🗣️ Conversational',
    text: 'Oli otya muganda wange? Ndi mubeezi wo ow’ekisa mu LingualDub. Nkuyambe ntya leero ku nsonga z’amaloboozi?',
  },
];

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
