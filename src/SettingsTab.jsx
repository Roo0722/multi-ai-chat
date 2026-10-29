import React, { useState } from 'react';
import { KeyRound, Bot, Search, CheckCircle, XCircle, Loader, Image } from 'lucide-react';
import { PROVIDERS, chatCompletion, listModels, searchTavily, testImageService } from './api.js';

function StatusBadge({ status }) {
  if (!status) return null;
  if (status === 'testing') return <Loader size={14} className="spin" style={{ color: '#888' }} />;
  if (status === 'ok') return <CheckCircle size={14} style={{ color: '#4caf50' }} />;
  return <XCircle size={14} style={{ color: '#ff6b6b' }} />;
}

export default function SettingsTab({ settings, updateSettings }) {
  const [testStatus, setTestStatus] = useState({});
  const [testMsg, setTestMsg] = useState({});
  const [modelLists, setModelLists] = useState({});

  function setStatus(id, status, msg = '') {
    setTestStatus((s) => ({ ...s, [id]: status }));
    setTestMsg((s) => ({ ...s, [id]: msg }));
  }

  // fn returns the success message to display.
  async function runTest(id, fn) {
    setStatus(id, 'testing');
    try {
      setStatus(id, 'ok', await fn());
    } catch (e) {
      setStatus(id, 'error', (e.message || String(e)).slice(0, 80));
    }
  }

  function testProvider(p) {
    return runTest(p.id, async () => {
      const reply = await chatCompletion(p.id, settings[p.keyField], settings[p.modelField], [
        { role: 'user', content: 'Reply with just: OK' }
      ]);
      return reply.slice(0, 60);
    });
  }

  function loadModels(p) {
    return runTest(p.id, async () => {
      const list = await listModels(p.id, settings[p.keyField]);
      setModelLists((m) => ({ ...m, [p.id]: list }));
      return `Loaded ${list.length} models.`;
    });
  }

  function testTavily() {
    return runTest('tavily', async () => {
      await searchTavily(settings.tavilyKey, 'test');
      return 'Search returned results.';
    });
  }

  function testImage() {
    return runTest('image', async () => {
      await testImageService();
      return 'Image generation is working.';
    });
  }

  return (
    <div className="settings-tab">
      <h2>Settings</h2>

      {/* Active Provider */}
      <section>
        <div className="section-label">
          <Bot size={15} strokeWidth={2} />
          <label htmlFor="active-provider">Active Provider</label>
        </div>
        <select
          id="active-provider"
          value={settings.activeProvider}
          onChange={(e) => updateSettings({ activeProvider: e.target.value })}
        >
          {Object.values(PROVIDERS).map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </section>

      {/* One section per chat provider */}
      {Object.values(PROVIDERS).map((p) => (
        <section key={p.id}>
          <div className="section-label">
            <KeyRound size={15} strokeWidth={2} />
            <label htmlFor={`${p.id}-key`}>{p.label} API Key</label>
          </div>
          <input
            id={`${p.id}-key`}
            type="password"
            value={settings[p.keyField] || ''}
            onChange={(e) => updateSettings({ [p.keyField]: e.target.value })}
            placeholder={p.keyPlaceholder}
          />
          <label htmlFor={`${p.id}-model`}>{p.label} Model</label>
          <input
            id={`${p.id}-model`}
            type="text"
            list={`models-${p.id}`}
            value={settings[p.modelField] || ''}
            onChange={(e) => updateSettings({ [p.modelField]: e.target.value })}
            placeholder={`e.g. ${p.defaultModel}`}
          />
          <datalist id={`models-${p.id}`}>
            {(modelLists[p.id] || []).map((m) => <option key={m} value={m} />)}
          </datalist>
          <div className="test-row">
            <button
              className="test-btn"
              onClick={() => testProvider(p)}
              disabled={!settings[p.keyField] || testStatus[p.id] === 'testing'}
            >
              Test {p.label}
            </button>
            <button
              className="test-btn"
              onClick={() => loadModels(p)}
              disabled={!settings[p.keyField] || testStatus[p.id] === 'testing'}
            >
              Load models
            </button>
            <StatusBadge status={testStatus[p.id]} />
            {testMsg[p.id] && <span className="test-msg">{testMsg[p.id]}</span>}
          </div>
        </section>
      ))}

      {/* Tavily */}
      <section>
        <div className="section-label">
          <Search size={15} strokeWidth={2} />
          <label htmlFor="tavily-key">Tavily API Key</label>
        </div>
        <input
          id="tavily-key"
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
          Powered by Pollinations.ai Flux -- free, no API key required (about 1 image per 45s).
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
