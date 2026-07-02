export async function searchTavily(apiKey, query) {
  const res = await fetch('https://api.tavily.com/search', {
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
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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

export async function generateImage(prompt) {
  const encoded = encodeURIComponent(prompt.trim());
  // Use Pollinations Flux model -- free, no API key needed
  const url = `https://image.pollinations.ai/prompt/${encoded}?model=flux&nologo=true&width=1024&height=1024`;

  // Pollinations returns the image directly -- verify it loaded
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Image generation failed (${res.status}). Try again.`);
  }
  // Return the URL directly for use in <img src>
  return url;
}
