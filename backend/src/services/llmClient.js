import { config } from '../env.js';

const TIMEOUT_MS = 15000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function post(url, init) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callOnce({ system, prompt, json }) {
  const { provider, apiKey, model, baseUrl } = config.llm;
  if (!apiKey) throw new Error('LLM_API_KEY is not set');

  if (provider === 'openai') {
    const res = await post(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
    return { res, extract: (d) => d?.choices?.[0]?.message?.content };
  }

  // Gemini (Google AI Studio) REST API
  const res = await post(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, ...(json ? { responseMimeType: 'application/json' } : {}) },
    }),
  });
  return { res, extract: (d) => d?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') };
}

// Retries once on 429 / 5xx. Never logs the API key.
async function call(opts) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { res, extract } = await callOnce(opts);
      if (res.status === 429 || res.status >= 500) {
        lastError = new Error(`LLM request failed (${res.status})`);
        await sleep(800);
        continue;
      }
      if (!res.ok) throw new Error(`LLM request failed (${res.status})`);
      const text = extract(await res.json());
      if (!text) throw new Error('LLM returned an empty response');
      return text;
    } catch (err) {
      lastError = err.name === 'AbortError' ? new Error('LLM request timed out') : err;
      if (attempt === 0) await sleep(500);
    }
  }
  throw lastError;
}

export function parseJSON(text) {
  const cleaned = String(text).replace(/```json|```/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object in LLM response');
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function generateJSON({ system, prompt }) {
  return parseJSON(await call({ system, prompt, json: true }));
}

export async function generateText({ system, prompt }) {
  return (await call({ system, prompt, json: false })).trim();
}
