import React, { useState } from 'react';
import ChatTab from './ChatTab.jsx';
import SettingsTab from './SettingsTab.jsx';

export default function App() {
  const [tab, setTab] = useState('chat');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Multi AI Chat</h1>
      </header>

      <main className="app-content">
        {tab === 'chat' ? <ChatTab /> : <SettingsTab />}
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
