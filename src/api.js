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

export async function chatGroq(apiKey, model, messages) {
  const res = await timedFetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, messages })
  });
  if (!res.ok) {
    throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '(empty response)';
}

export async function chatOpenRouter(apiKey, model, messages) {
  const res = await timedFetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://multi-ai-chat.local',
      'X-Title': 'Multi AI Chat'
    },
    body: JSON.stringify({ model, messages })
  });
  if (!res.ok) {
    throw new Error(`OpenRouter error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '(empty response)';
}

// Pollinations Flux -- free, no API key needed.
// Returns a URL for <img src>. The <img> element is the only request made
// (no pre-fetch), so the image is not downloaded twice. A random seed makes
// repeated prompts produce new images instead of a cached one.
export function generateImage(prompt) {
  const encoded = encodeURIComponent(prompt.trim());
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encoded}?model=flux&nologo=true&width=1024&height=1024&seed=${seed}`;
}

// Used by Settings -> "Test Image Gen": resolves if the service returns a loadable image.
export function testImageService(timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
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
