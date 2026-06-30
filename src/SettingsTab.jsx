import React from 'react';

export default function SettingsTab({ settings, updateSettings }) {
  return (
    <div className="settings-tab">
      <h2>Settings</h2>

      <section>
        <label>Active Provider</label>
        <select
          value={settings.activeProvider}
          onChange={(e) => updateSettings({ activeProvider: e.target.value })}
        >
          <option value="groq">Groq</option>
          <option value="openrouter">OpenRouter</option>
        </select>
      </section>

      <section>
        <label>Groq API Key</label>
        <input
          type="password"
          value={settings.groqKey}
          onChange={(e) => updateSettings({ groqKey: e.target.value })}
          placeholder="gsk_..."
        />
        <label>Groq Model</label>
        <input
          type="text"
          value={settings.groqModel}
          onChange={(e) => updateSettings({ groqModel: e.target.value })}
        />
      </section>

      <section>
        <label>OpenRouter API Key</label>
        <input
          type="password"
          value={settings.openRouterKey}
          onChange={(e) => updateSettings({ openRouterKey: e.target.value })}
          placeholder="sk-or-..."
        />
        <label>OpenRouter Model</label>
        <input
          type="text"
          value={settings.openRouterModel}
          onChange={(e) => updateSettings({ openRouterModel: e.target.value })}
          placeholder="e.g. openai/gpt-4o-mini"
        />
      </section>

      <section>
        <label>Tavily API Key</label>
        <input
          type="password"
          value={settings.tavilyKey}
          onChange={(e) => updateSettings({ tavilyKey: e.target.value })}
          placeholder="tvly-..."
        />
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.useTavily}
            onChange={(e) => updateSettings({ useTavily: e.target.checked })}
          />
          Use Tavily web search before each reply
        </label>
      </section>

      <p className="note">
        Saved automatically on-device. Switching tabs or closing the app will
        not lose these values.
      </p>
    </div>
  );
}
