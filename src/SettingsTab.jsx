import React, { useState } from 'react';
import { KeyRound, Bot, Globe, Search, CheckCircle, XCircle, Loader, Image } from 'lucide-react';
import { chatGroq, chatOpenRouter, searchTavily, generateImage } from './api.js';

function StatusBadge({ status }) {
  if (!status) return null;
  if (status === 'testing') return <Loader size={14} className="spin" style={{ color: '#888' }} />;
  if (status === 'ok') return <CheckCircle size={14} style={{ color: '#4caf50' }} />;
  return <XCircle size={14} style={{ color: '#ff6b6b' }} />;
}

export default function SettingsTab({ settings, updateSettings }) {
  const [testStatus, setTestStatus] = useState({ groq: null, openrouter: null, tavily: null, image: null });
  const [testMsg, setTestMsg] = useState({ groq: '', openrouter: '', tavily: '', image: '' });

  async function testGroq() {
    setTestStatus((s) => ({ ...s, groq: 'testing' }));
    setTestMsg((s) => ({ ...s, groq: '' }));
    try {
      const reply = await chatGroq(settings.groqKey, settings.groqModel, [
        { role: 'user', content: 'Reply with just: OK' }
      ]);
      setTestStatus((s) => ({ ...s, groq: 'ok' }));
      setTestMsg((s) => ({ ...s, groq: reply.slice(0, 60) }));
    } catch (e) {
      setTestStatus((s) => ({ ...s, groq: 'error' }));
      setTestMsg((s) => ({ ...s, groq: e.message.slice(0, 80) }));
    }
  }

  async function testOpenRouter() {
    setTestStatus((s) => ({ ...s, openrouter: 'testing' }));
    setTestMsg((s) => ({ ...s, openrouter: '' }));
    try {
      const reply = await chatOpenRouter(settings.openRouterKey, settings.openRouterModel, [
        { role: 'user', content: 'Reply with just: OK' }
      ]);
      setTestStatus((s) => ({ ...s, openrouter: 'ok' }));
      setTestMsg((s) => ({ ...s, openrouter: reply.slice(0, 60) }));
    } catch (e) {
      setTestStatus((s) => ({ ...s, openrouter: 'error' }));
      setTestMsg((s) => ({ ...s, openrouter: e.message.slice(0, 80) }));
    }
  }

  async function testTavily() {
    setTestStatus((s) => ({ ...s, tavily: 'testing' }));
    setTestMsg((s) => ({ ...s, tavily: '' }));
    try {
      const result = await searchTavily(settings.tavilyKey, 'test');
      setTestStatus((s) => ({ ...s, tavily: 'ok' }));
      setTestMsg((s) => ({ ...s, tavily: 'Search returned results.' }));
    } catch (e) {
      setTestStatus((s) => ({ ...s, tavily: 'error' }));
      setTestMsg((s) => ({ ...s, tavily: e.message.slice(0, 80) }));
    }
  }

  async function testImage() {
    setTestStatus((s) => ({ ...s, image: 'testing' }));
    setTestMsg((s) => ({ ...s, image: '' }));
    try {
      await generateImage('a simple blue circle');
      setTestStatus((s) => ({ ...s, image: 'ok' }));
      setTestMsg((s) => ({ ...s, image: 'Image generation is working.' }));
    } catch (e) {
      setTestStatus((s) => ({ ...s, image: 'error' }));
      setTestMsg((s) => ({ ...s, image: e.message.slice(0, 80) }));
    }
  }

  return (
    <div className="settings-tab">
      <h2>Settings</h2>

      {/* Active Provider */}
      <section>
        <div className="section-label">
          <Bot size={15} strokeWidth={2} />
          <label>Active Provider</label>
        </div>
        <select
          value={settings.activeProvider}
          onChange={(e) => updateSettings({ activeProvider: e.target.value })}
        >
          <option value="groq">Groq</option>
          <option value="openrouter">OpenRouter</option>
        </select>
      </section>

      {/* Groq */}
      <section>
        <div className="section-label">
          <KeyRound size={15} strokeWidth={2} />
          <label>Groq API Key</label>
        </div>
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
        <div className="test-row">
          <button className="test-btn" onClick={testGroq} disabled={!settings.groqKey || testStatus.groq === 'testing'}>
            Test Groq
          </button>
          <StatusBadge status={testStatus.groq} />
          {testMsg.groq && <span className="test-msg">{testMsg.groq}</span>}
        </div>
      </section>

      {/* OpenRouter */}
      <section>
        <div className="section-label">
          <Globe size={15} strokeWidth={2} />
          <label>OpenRouter API Key</label>
        </div>
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
        <div className="test-row">
          <button className="test-btn" onClick={testOpenRouter} disabled={!settings.openRouterKey || testStatus.openrouter === 'testing'}>
            Test OpenRouter
          </button>
          <StatusBadge status={testStatus.openrouter} />
          {testMsg.openrouter && <span className="test-msg">{testMsg.openrouter}</span>}
        </div>
      </section>

      {/* Tavily */}
      <section>
        <div className="section-label">
          <Search size={15} strokeWidth={2} />
          <label>Tavily API Key</label>
        </div>
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
        <div className="test-row">
          <button className="test-btn" onClick={testTavily} disabled={!settings.tavilyKey || testStatus.tavily === 'testing'}>
            Test Tavily
          </button>
          <StatusBadge status={testStatus.tavily} />
          {testMsg.tavily && <span className="test-msg">{testMsg.tavily}</span>}
        </div>
      </section>

      {/* Image Generation */}
      <section>
        <div className="section-label">
          <Image size={15} strokeWidth={2} />
          <label>Image Generation</label>
        </div>
        <p className="note" style={{ marginTop: 0 }}>
          Powered by Pollinations.ai Flux -- free, no API key required.
        </p>
        <div className="test-row">
          <button
            className="test-btn"
            onClick={testImage}
            disabled={testStatus.image === 'testing'}
          >
            Test Image Gen
          </button>
          <StatusBadge status={testStatus.image} />
          {testMsg.image && <span className="test-msg">{testMsg.image}</span>}
        </div>
      </section>

      <p className="note">Keys are saved automatically on-device. Switching tabs will not lose them.</p>
    </div>
  );
}
