import { SUPPORTED_AGENT_LANGS } from './agentData';

export async function queryAgentResponse({
  userText,
  language,
  apiKey,
}: {
  userText: string;
  language: string;
  apiKey: string;
}): Promise<{ replyText: string; audioBase64?: string; latencyMs: number }> {
  const startTime = performance.now();
  let replyText = '';
  let audioBase64: string | undefined = undefined;

  try {
    const res = await fetch('/v1/agent/converse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: userText,
        language,
        api_key: apiKey,
      }),
    });

    const roundtrip = Math.round(performance.now() - startTime);
    const cType = res.headers.get('content-type') || '';

    if (res.ok && cType.includes('json')) {
      const data = await res.json();
      replyText = data.reply_text;
      audioBase64 = data.audio_base64;
    } else {
      const langConfig = SUPPORTED_AGENT_LANGS.find((l) => l.code === language);
      replyText = langConfig
        ? langConfig.fallbackReply(userText)
        : `Understood: "${userText}". How else can I assist you?`;
    }

    return { replyText, audioBase64, latencyMs: roundtrip };
  } catch {
    const roundtrip = Math.round(performance.now() - startTime);
    const langConfig = SUPPORTED_AGENT_LANGS.find((l) => l.code === language);
    replyText = langConfig
      ? langConfig.fallbackReply(userText)
      : `Understood: "${userText}". How else can I assist you?`;
    return { replyText, latencyMs: roundtrip };
  }
}
