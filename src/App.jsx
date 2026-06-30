import React, { useEffect, useState } from 'react';
import ChatTab from './ChatTab.jsx';
import SettingsTab from './SettingsTab.jsx';
import { loadSettings, saveSettings } from './settingsStore.js';

export default function App() {
  const [tab, setTab] = useState('chat');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  async function updateSettings(partial) {
    const next = { ...settings, ...partial };
    setSettings(next);
    await saveSettings(next);
  }

  if (!settings) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Multi AI Chat</h1>
      </header>

      <main className="app-content">
        {tab === 'chat' ? (
          <ChatTab settings={settings} />
        ) : (
          <SettingsTab settings={settings} updateSettings={updateSettings} />
        )}
      </main>

      <nav className="tab-bar">
        <button
          className={tab === 'chat' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setTab('chat')}
        >
          Chat
        </button>
        <button
          className={tab === 'settings' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setTab('settings')}
        >
          Settings
        </button>
      </nav>
    </div>
  );
}
