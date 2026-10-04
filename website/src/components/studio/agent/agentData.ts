export interface AgentLangConfig {
  code: string;
  label: string;
  flag: string;
  bcp47: string;
  initialGreeting: string;
  fallbackReply: (input: string) => string;
}

export const SUPPORTED_AGENT_LANGS: AgentLangConfig[] = [
  {
    code: 'lug',
    label: 'Oluganda',
    flag: '🇺🇬',
    bcp47: 'lg-UG',
    initialGreeting: "Oli otya nnyabo/ssebo! Ndi mubeezi wo ow'ekisa mu LingualDub. Nkuyambe ntya leero ku nsonga z'amaloboozi oba okukyusa ennimi?",
    fallbackReply: (input) => `Ntegedde bulungi nnyabo/ssebo: "${input}". Ndi mwetegefu okukuyamba mu lulimi Oluganda n'amagezi ag'eby'obulimi, eddembe ly'amaloboozi, oba eby'obusuubuzi.`,
  },
  {
    code: 'swa',
    label: 'Kiswahili',
    flag: '🇰🇪',
    bcp47: 'sw-KE',
    initialGreeting: 'Hujambo! Karibu kwenye wakala wa sauti wa LingualDub. Nikusaidie vipi leo kuhusu utayarishaji wa sauti au huduma za kijamii?',
    fallbackReply: (input) => `Nimekuelewa vyema: "${input}". Niko hapa kukusaidia na mifumo ya sauti ya Kiswahili, tafsiri asilia, na huduma za kiteknolojia.`,
  },
  {
    code: 'nyn',
    label: 'Runyankore',
    flag: '🇺🇬',
    bcp47: 'en-UG',
    initialGreeting: 'Mwebare kwija! Ndi omubeezi wawe omu Runyankore. Ninkwasa ki leero aha nshonga z’amaloboozi n’okuhindura ebirikugambwa?',
    fallbackReply: (input) => `Nyakukwatira kimwe: "${input}". Ndi omubeezi wawe omu Runyankore n'okuhindura ebirikugambwa omu buringaniza.`,
  },
  {
    code: 'ach',
    label: 'Leb Acoli',
    flag: '🇺🇬',
    bcp47: 'en-UG',
    initialGreeting: 'Wajoli ducu! Man obedo latic me LingualDub i Leb Acoli. Anyalo konyi nining tin i lok me dwon kede loko leb?',
    fallbackReply: (input) => `Aniang maber: "${input}". Abino konyi i leb Acoli kede tic me yotkom, pur, kede kwan.`,
  },
  {
    code: 'yor',
    label: 'Èdè Yorùbá',
    flag: '🇳🇬',
    bcp47: 'yo-NG',
    initialGreeting: 'Ẹ ku ojumo o! Emi ni oluranlowo ohun LingualDub. Bawo ni mo se le ran yin lowo loni?',
    fallbackReply: (input) => `Mo gbọ ọ daradara: "${input}". Mo wa nibi lati ran ọ lọwọ pẹlu ohun ede Yorùbá ati itumọ to peye.`,
  },
  {
    code: 'ibo',
    label: 'Asụsụ Igbo',
    flag: '🇳🇬',
    bcp47: 'ig-NG',
    initialGreeting: 'Nnọọ nwanne m! Abụ m onye inyeaka olu LingualDub. Kedu ka m ga-esi nyere gị aka taa?',
    fallbackReply: (input) => `Aghọtara m gị nke ọma: "${input}". Enwere m ike inyere gị aka na nsụgharị na nhazi olu Igbo.`,
  },
  {
    code: 'hau',
    label: 'Harshen Hausa',
    flag: '🇳🇬',
    bcp47: 'ha-NG',
    initialGreeting: 'Barka da rana! Ni ne mataimakin muryar LingualDub. Ta yaya zan iya taimaka muku a yau?',
    fallbackReply: (input) => `Na fahimta sosai: "${input}". Ina nan don in taimaka muku da duk wani aikin murya na Hausa.`,
  },
  {
    code: 'zul',
    label: 'isiZulu',
    flag: '🇿🇦',
    bcp47: 'zu-ZA',
    initialGreeting: 'Sawubona! Ngingumsizi wakho wezwi e-LingualDub. Ngingakusiza kanjani namhlanje?',
    fallbackReply: (input) => `Ngiyezwisisa kahle: "${input}". Ngingakusiza ngezwi lesiZulu, ukuhumusha, nokusebenza kwezwi.`,
  },
  {
    code: 'xho',
    label: 'isiXhosa',
    flag: '🇿🇦',
    bcp47: 'xh-ZA',
    initialGreeting: 'Molo mhlobo wam! Ndingumncedisi welizwi waseLingualDub. Ndingakunceda njani namhlanje?',
    fallbackReply: (input) => `Ndiqonde kakuhle: "${input}". Ndilapha ukukunceda ngelizwi lesiXhosa kunye nokuguqulela okucocekileyo.`,
  },
  {
    code: 'kin',
    label: 'Ikinyarwanda',
    flag: '🇷🇼',
    bcp47: 'rw-RW',
    initialGreeting: 'Muraho neza! Ndi umufasha wanyu mu ijwi rya LingualDub. Nabafasha nte uyu munsi?',
    fallbackReply: (input) => `Nabyumvise neza: "${input}". Niteguye kubafasha mu rurimi rw'Ikinyarwanda n'ikoranabuhanga ry'amajwi.`,
  },
  {
    code: 'amh',
    label: 'አማርኛ',
    flag: '🇪🇹',
    bcp47: 'am-ET',
    initialGreeting: 'እንኳን ደህና መጡ! እኔ የሊንጓልዳብ የአማርኛ ድምጽ ረዳት ነኝ። ዛሬ እንዴት ልርዳዎ?',
    fallbackReply: (input) => `በደንብ ተረድቻለሁ፡ "${input}"። በአማርኛ የተፈጥሮ ድምጽ እና የትርጉም አገልግሎት ልረዳዎ ዝግጁ ነኝ።`,
  },
  {
    code: 'som',
    label: 'Af-Soomaali',
    flag: '🇸🇴',
    bcp47: 'so-SO',
    initialGreeting: 'Iska warran! Waxaan ahay caawiyaha codka LingualDub. Sideen maanta kuu caawin karaa?',
    fallbackReply: (input) => `Si fiican ayaan u fahmay: "${input}". Waxaan diyaar u ahay inaan kaa caawiyo codadka iyo tarjumaada af Soomaaliga.`,
  },
  {
    code: 'lin',
    label: 'Lingála',
    flag: '🇨🇩',
    bcp47: 'ln-CD',
    initialGreeting: 'Mbote na yo! Naza mosungi na yo ya mongongo na LingualDub. Ndenge nini nakoki kosalisa yo lelo?',
    fallbackReply: (input) => `Nasimbi malamu: "${input}". Naza awa mpo na kosalisa yo na monoko ya Lingala mpe makambo ya mongongo.`,
  },
  {
    code: 'wol',
    label: 'Wolof',
    flag: '🇸🇳',
    bcp47: 'wo-SN',
    initialGreeting: 'Dalal ak jamm! Maa ngi tudd ndimbalu LingualDub ci kàddu. Naka laa la mëna dimbalee tey?',
    fallbackReply: (input) => `Dégg naa bu baax: "${input}". Maa ngi fi ngir dimbali la ci làkku Wolof ak liggéeyu kàddu.`,
  },
  {
    code: 'eng',
    label: 'English (African Cadence)',
    flag: '🌍',
    bcp47: 'en-US',
    initialGreeting: 'Hello! I am your LingualDub African Duplex Voice Agent. How can I assist you today with native speech synthesis, dubbing, or clinic triage?',
    fallbackReply: (input) => `Understood: "${input}". LingualDub African Duplex Voice Agent is active with low-latency acoustic turn-taking.`,
  },
];

export const PROMPT_STARTERS: Record<string, string[]> = {
  lug: [
    'Oli otya? Nsasula ntya emitendezo gy’obulimi?',
    'Okulabula ku mbeera y’obudde mu Buganda leero.',
    'Ntegeeza ku nteekateeka z’okugema omusujja ogw’omutwe.',
    'Empewo ez’ebitundu eby’enkuba zireeta ki?',
  ],
  swa: [
    'Hujambo! Nisaidie na bei za mazao ya kilimo sokoni.',
    'Je, hatua za kwanza za huduma ya dharura ya afya ni zipi?',
    'Niwezeshe kurekodi tangazo fupi la redio kwa Kiswahili.',
    'Taarifa ya hali ya hewa katika ukanda wa Afrika Mashariki.',
  ],
  default: [
    'What are the primary clinical triage guidelines for malaria?',
    'How do I calibrate pacing speed and pitch for educational dubbing?',
    'Explain the difference between Sunbird Neural and Sherpa INT8 models.',
    'Give me an authentic regional greeting and translation.',
  ],
};
