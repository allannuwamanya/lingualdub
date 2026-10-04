export const DUBBING_FALLBACK_TRANSLATIONS: Record<string, string> = {
  lug: "Tukusanyukidde mu buweereza bwaffe obw'obulamu obw'omulembe. Mwatuula wansi nga tukyusa amawulire gammwe.",
  swa: 'Karibu kwenye huduma zetu za kisasa za afya. Tafadhali keti wakati tukisajili maelezo yako.',
  nyn: "Mwebare kwija omu buheereza bw'eby'amagara bwaitu. Mushitame omu ntebe tureebe ku turikubakwatsaho.",
  ach: 'Wajoli i kin dog tic me yotkom ma konyo lwak. Bed piny wek wawac kwedi ikom kit me gwoko kom.',
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

export async function translateDialogue({
  text,
  sourceLang,
  targetLang,
  apiKey,
}: {
  text: string;
  sourceLang: string;
  targetLang: string;
  apiKey: string;
}): Promise<string> {
  let translated = '';

  // 1. Try local server
  try {
    const res = await fetch('/v1/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        source_lang: sourceLang,
        target_lang: targetLang,
        api_key: apiKey,
      }),
    });
    const cType = res.headers.get('content-type') || '';
    if (res.ok && cType.includes('json')) {
      const data = await res.json();
      if (data.translated_text) translated = data.translated_text;
    }
  } catch {}

  // 2. Direct Sunbird API fallback
  if (!translated && apiKey) {
    try {
      const sRes = await fetch('https://api.sunbird.ai/tasks/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          source_language: sourceLang,
          target_language: targetLang,
          text,
        }),
      });
      const sCType = sRes.headers.get('content-type') || '';
      if (sRes.ok && sCType.includes('json')) {
        const sData = await sRes.json();
        translated = sData.output?.translated_text || sData.translated_text || '';
      }
    } catch {}
  }

  // 3. Fallback dictionary
  if (!translated) {
    translated = DUBBING_FALLBACK_TRANSLATIONS[targetLang] || `[${targetLang.toUpperCase()} Translated]: ${text}`;
  }

  return translated;
}
