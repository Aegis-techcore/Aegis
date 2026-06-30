import { buildFallbackReply, buildSystemPrompt, mentionsMoney, moneyReply } from '../../lib/chatRules';

export const runtime = 'nodejs';

const cleanText = (value) => String(value || '').trim();

const fetchWithTimeout = async (url, options = {}, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
};

const getLastUserMessage = (messages) => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === 'user') {
      return cleanText(messages[index].content);
    }
  }

  return '';
};

const toOllamaMessages = (messages) =>
  messages
    .filter((message) => ['user', 'assistant'].includes(message?.role))
    .map((message) => ({
      role: message.role,
      content: cleanText(message.content).slice(0, 1200)
    }))
    .filter((message) => message.content)
    .slice(-10);

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: 'Chatten skickade ogiltig data.' }, { status: 400 });
  }

  const messages = Array.isArray(payload?.messages) ? payload.messages : [];
  const pageContext = cleanText(payload?.pageContext || 'startsidan').slice(0, 120);
  const lastUserMessage = getLastUserMessage(messages);

  if (!lastUserMessage) {
    return Response.json({ message: 'Skriv en fråga först.' }, { status: 400 });
  }

  if (mentionsMoney(lastUserMessage)) {
    return Response.json({ reply: moneyReply(), source: 'policy' });
  }

  const baseUrl = cleanText(process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
  const model = cleanText(process.env.OLLAMA_MODEL || 'llama3.2:3b');

  try {
    const healthResponse = await fetchWithTimeout(`${baseUrl}/api/tags`, {}, 2500);

    if (!healthResponse.ok) {
      throw new Error(`Ollama svarade med ${healthResponse.status}`);
    }

    const ollamaResponse = await fetchWithTimeout(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        options: {
          temperature: 0.45,
          num_predict: 180
        },
        messages: [
          { role: 'system', content: buildSystemPrompt(pageContext) },
          ...toOllamaMessages(messages)
        ]
      })
    }, 22000);

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama svarade med ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    const reply = cleanText(data?.message?.content);

    if (!reply) {
      throw new Error('Ollama gav inget textsvar');
    }

    return Response.json({ reply, source: 'ollama', model });
  } catch {
    return Response.json({
      reply: buildFallbackReply(lastUserMessage),
      source: 'fallback'
    });
  }
}
