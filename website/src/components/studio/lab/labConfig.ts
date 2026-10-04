import type { SelectGroup, SelectOption } from '../CustomSelect';

export const AFRICAN_LANGUAGE_GROUPS: SelectGroup[] = [
  {
    label: '🇺🇬 Uganda',
    options: [
      { value: 'lug', label: 'Luganda (Central)', flag: '🇺🇬', description: 'Central Buganda Dialect' },
      { value: 'nyn', label: 'Runyankore-Rukiga (Western)', flag: '🇺🇬', description: 'Western Uganda' },
      { value: 'ach', label: 'Acholi (Northern)', flag: '🇺🇬', description: 'Northern Luo' },
    ],
  },
  {
    label: '🇰🇪 East Africa',
    options: [
      { value: 'swa', label: 'Kiswahili (East Africa)', flag: '🇰🇪', description: 'Regional Lingua Franca' },
      { value: 'kin', label: 'Kinyarwanda (Rwanda)', flag: '🇷🇼', description: 'Great Lakes Region' },
      { value: 'som', label: 'Somali (Horn of Africa)', flag: '🇸🇴', description: 'Somalia & Ogaden' },
    ],
  },
  {
    label: '🇳🇬 West Africa',
    options: [
      { value: 'yor', label: 'Èdè Yorùbá (Nigeria)', flag: '🇳🇬', description: 'Southwestern Nigeria' },
      { value: 'ibo', label: 'Asụsụ Igbo (Nigeria)', flag: '🇳🇬', description: 'Southeastern Nigeria' },
      { value: 'hau', label: 'Harshen Hausa (Sahel)', flag: '🇳🇬', description: 'Northern Nigeria & Niger' },
      { value: 'wol', label: 'Wolof (Senegal)', flag: '🇸🇳', description: 'Senegambia Region' },
    ],
  },
  {
    label: '🇿🇦 Southern Africa',
    options: [
      { value: 'zul', label: 'isiZulu (South Africa)', flag: '🇿🇦', description: 'Nguni Language Family' },
      { value: 'xho', label: 'isiXhosa (South Africa)', flag: '🇿🇦', description: 'Nguni Click Consonants' },
    ],
  },
  {
    label: '🇪🇹 Horn & Central',
    options: [
      { value: 'amh', label: 'Amharic (Ethiopia)', flag: '🇪🇹', description: 'Semitic Ethiopic Script' },
      { value: 'lin', label: 'Lingala (DR Congo)', flag: '🇨🇩', description: 'Congo Basin' },
    ],
  },
];

export const INFERENCE_ENGINE_OPTIONS: SelectOption[] = [
  { value: 'sunbird', label: 'Sunbird AI Regional Cloud', description: 'Production Neural Speech API', badge: 'Cloud' },
  { value: 'sherpa_mms', label: 'Local Sherpa-ONNX MMS-TTS', description: 'Local INT8 execution (~35MB RAM)', badge: 'INT8' },
  { value: 'omnivoice', label: 'Local OmniVoice GGUF', description: 'Zero-shot voice cloning Q4_K_M', badge: 'GGUF' },
  { value: 'browser', label: 'Browser Neural Speech Engine', description: 'Native Web Speech API', badge: 'Browser' },
];
