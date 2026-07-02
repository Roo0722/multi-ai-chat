import React, { useEffect, useState } from 'react';
import { MessageSquare, Settings, Image } from 'lucide-react';
import ChatTab from './ChatTab.jsx';
import SettingsTab from './SettingsTab.jsx';
import ImageTab from './ImageTab.jsx';
import { loadSettings, saveSettings } from './settingsStore.js';

export default function App() {
  const [tab, setTab] = useState('chat');
  const [settings, setSettings] = useState(null);
  const [messages, setMessages] = useState([]);

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
        <MessageSquare size={18} strokeWidth={2} style={{ color: '#4f8cff' }} />
        <h1>Nexus</h1>
      </header>

      <main className="app-content">
        {tab === 'chat' && (
          <ChatTab settings={settings} messages={messages} setMessages={setMessages} />
        )}
        {tab === 'image' && <ImageTab />}
        {tab === 'settings' && (
          <SettingsTab settings={settings} updateSettings={updateSettings} />
        )}
      </main>

      <nav className="tab-bar">
        <button
          className={tab === 'chat' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setTab('chat')}
        >
          <MessageSquare size={16} strokeWidth={2} />
          Chat
        </button>
        <button
          className={tab === 'image' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setTab('image')}
        >
          <Image size={16} strokeWidth={2} />
          Image
        </button>
        <button
          className={tab === 'settings' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setTab('settings')}
        >
          <Settings size={16} strokeWidth={2} />
          Settings
        </button>
      </nav>
    </div>
  );
}
