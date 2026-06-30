import React, { useState } from 'react';
import { chatGroq, chatOpenRouter, searchTavily } from './api.js';

export default function ChatTab({ settings }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const providerKey =
    settings.activeProvider === 'groq' ? settings.groqKey : settings.openRouterKey;

  async function handleSend() {
    if (!input.trim() || loading) return;
    setError('');

    if (!providerKey) {
      setError(
        `No API key set for ${settings.activeProvider}. Add it in Settings first.`
      );
      return;
    }

    const userMessage = { role: 'user', content: input };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      let contextMessages = nextMessages;

      if (settings.useTavily && settings.tavilyKey) {
        const searchResults = await searchTavily(settings.tavilyKey, input);
        contextMessages = [
          {
            role: 'system',
            content: `Relevant web search results:\n\n${searchResults}\n\nUse these if helpful, and cite sources when you do.`
          },
          ...nextMessages
        ];
      }

      const reply =
        settings.activeProvider === 'groq'
          ? await chatGroq(settings.groqKey, settings.groqModel, contextMessages)
          : await chatOpenRouter(
              settings.openRouterKey,
              settings.openRouterModel,
              contextMessages
            );

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-tab">
      <div className="message-list">
        {messages.length === 0 && (
          <p className="empty-hint">
            Using {settings.activeProvider === 'groq' ? 'Groq' : 'OpenRouter'} (
            {settings.activeProvider === 'groq'
              ? settings.groqModel
              : settings.openRouterModel}
            ). Change this in Settings.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <span className="message-role">{m.role === 'user' ? 'You' : 'AI'}</span>
            <p>{m.content}</p>
          </div>
        ))}
        {loading && <p className="empty-hint">Thinking...</p>}
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="input-row">
        <input
          type="text"
          value={input}
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
