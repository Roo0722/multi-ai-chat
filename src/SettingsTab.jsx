import React, { useState } from 'react';

export default function SettingsTab() {
  const [groqKey, setGroqKey] = useState('');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [tavilyKey, setTavilyKey] = useState('');
  const [groqModel, setGroqModel] = useState('llama-3.3-70b-versatile');
  const [openRouterModel, setOpenRouterModel] = useState('');
  const [activeProvider, setActiveProvider] = useState('groq');

  return (
    <div className="settings-tab">
      <h2>Settings</h2>

      <section>
        <label>Active Provider</label>
        <select value={activeProvider} onChange={(e) => setActiveProvider(e.target.value)}>
          <option value="groq">Groq</option>
          <option value="openrouter">OpenRouter</option>
        </select>
      </section>

      <section>
        <label>Groq API Key</label>
        <input
          type="password"
          value={groqKey}
          onChange={(e) => setGroqKey(e.target.value)}
          placeholder="gsk_..."
        />
        <label>Groq Model</label>
        <input
          type="text"
          value={groqModel}
          onChange={(e) => setGroqModel(e.target.value)}
        />
      </section>

      <section>
        <label>OpenRouter API Key</label>
        <input
          type="password"
          value={openRouterKey}
          onChange={(e) => setOpenRouterKey(e.target.value)}
          placeholder="sk-or-..."
        />
        <label>OpenRouter Model</label>
        <input
          type="text"
          value={openRouterModel}
          onChange={(e) => setOpenRouterModel(e.target.value)}
          placeholder="e.g. anthropic/claude-3.5-sonnet"
        />
      </section>

      <section>
        <label>Tavily API Key</label>
        <input
          type="password"
          value={tavilyKey}
          onChange={(e) => setTavilyKey(e.target.value)}
          placeholder="tvly-..."
        />
      </section>

      <p className="note">
        Note: these fields are not yet saved to device storage. Local
        persistence will be wired up in the next step.
      </p>
    </div>
  );
}
