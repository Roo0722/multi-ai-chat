async function timedFetch(url, options = {}, ms = 60000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } catch (e) {
    if (e && e.name === 'AbortError') {
      throw new Error('Request timed out. Check your connection and try again.');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Chat providers. All of them speak the OpenAI-compatible /chat/completions API,
// so adding one is just a new entry here (settings and chat pick it up automatically).
// keyField / modelField are the names used in saved settings (kept stable so
// existing installs keep their keys).
// Default models are suggestions: use "Load models" in Settings to pick a current one.
// ---------------------------------------------------------------------------
export const PROVIDERS = {
  groq: {
    id: 'groq',
    label: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    keyField: 'groqKey',
    modelField: 'groqModel',
    defaultModel: 'llama-3.3-70b-versatile',
    keyPlaceholder: 'gsk_...'
  },
  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    keyField: 'openRouterKey',
    modelField: 'openRouterModel',
    defaultModel: 'openai/gpt-4o-mini',
    keyPlaceholder: 'sk-or-...',
    headers: { 'HTTP-Referer': 'https://multi-ai-chat.local', 'X-Title': 'Nexus' }
  },
  cerebras: {
    id: 'cerebras',
    label: 'Cerebras',
    baseUrl: 'https://api.cerebras.ai/v1',
    keyField: 'cerebrasKey',
    modelField: 'cerebrasModel',
    defaultModel: 'gpt-oss-120b',
    keyPlaceholder: 'csk-...'
  },
  gemini: {
    id: 'gemini',
    label: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    keyField: 'geminiKey',
    modelField: 'geminiModel',
    defaultModel: 'gemini-flash-latest',
    keyPlaceholder: 'AIza...'
  },
  mistral: {
    id: 'mistral',
    label: 'Mistral',
    baseUrl: 'https://api.mistral.ai/v1',
    keyField: 'mistralKey',
    modelField: 'mistralModel',
    defaultModel: 'mistral-small-latest',
    keyPlaceholder: 'API key'
  }
};

export function getProvider(id) {
  return PROVIDERS[id] || PROVIDERS.groq;
}

export async function chatCompletion(providerId, apiKey, model, messages) {
  const p = getProvider(providerId);
  const res = await timedFetch(`${p.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(p.headers || {})
    },
    body: JSON.stringify({ model, messages })
  });
  if (!res.ok) {
    throw new Error(`${p.label} error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '(empty response)';
}

// Fetch the model ids a provider currently offers (for the model picker in Settings).
export async function listModels(providerId, apiKey) {
  const p = getProvider(providerId);
  const res = await timedFetch(
    `${p.baseUrl}/models`,
    { headers: { Authorization: `Bearer ${apiKey}`, ...(p.headers || {}) } },
    30000
  );
  if (!res.ok) {
    throw new Error(`${p.label} error ${res.status}: ${(await res.text()).slice(0, 100)}`);
  }
  const data = await res.json();
  const items = Array.isArray(data) ? data : data.data || data.models || [];
  return items
    .map((m) => String(m.id || m.name || '').replace(/^models\//, ''))
    .filter(Boolean)
    .sort();
}

export async function searchTavily(apiKey, query) {
  const res = await timedFetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: 5,
      include_answer: true
    })
  });
  if (!res.ok) {
    throw new Error(`Tavily error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const results = (data.results || [])
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.content}\nSource: ${r.url}`)
    .join('\n\n');
  return data.answer ? `${data.answer}\n\n${results}` : results;
}

// Pollinations Flux -- free, no API key needed.
// Returns a URL for <img src>. The <img> element is the only request made
// (no pre-fetch), so the image is not downloaded twice. A random seed makes
// repeated prompts produce new images instead of a cached one.
export const IMAGE_COOLDOWN_MS = 45000;
let lastImageRequestAt = 0; // module-level, so it survives tab switches

// Milliseconds left before the free Pollinations tier will accept another request.
export function getImageCooldownLeft() {
  return Math.max(0, lastImageRequestAt + IMAGE_COOLDOWN_MS - Date.now());
}

export function generateImage(prompt) {
  lastImageRequestAt = Date.now();
  const encoded = encodeURIComponent(prompt.trim());
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encoded}?model=flux&nologo=true&width=1024&height=1024&seed=${seed}`;
}

// Used by Settings -> "Test Image Gen": resolves if the service returns a loadable image.
export function testImageService(timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const wait = getImageCooldownLeft();
    if (wait > 0) {
      reject(new Error(`Rate limit: wait ${Math.ceil(wait / 1000)}s (free tier allows ~1 image / 45s).`));
      return;
    }
    const img = new window.Image();
    const timer = setTimeout(() => {
      img.src = '';
      reject(new Error('Image service timed out.'));
    }, timeoutMs);
    img.onload = () => { clearTimeout(timer); resolve(); };
    img.onerror = () => { clearTimeout(timer); reject(new Error('Image service failed to respond.')); };
    img.src = generateImage('a simple blue circle');
  });
}
