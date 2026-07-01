import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, AlertCircle, Loader } from 'lucide-react';
import { chatGroq, chatOpenRouter, searchTavily } from './api.js';

export default function ChatTab({ settings }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const providerLabel = settings.activeProvider === 'groq' ? 'Groq' : 'OpenRouter';
  const modelLabel = settings.activeProvider === 'groq' ? settings.groqModel : settings.openRouterModel;
  const providerKey = settings.activeProvider === 'groq' ? settings.groqKey : settings.openRouterKey;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    setError('');

    if (!providerKey) {
      setError(`No API key set for ${providerLabel}. Add it in Settings.`);
      return;
    }

    const userMsg = { role: 'user', content: input };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      let contextMessages = nextMessages;

      if (settings.useTavily && settings.tavilyKey) {
        const results = await searchTavily(settings.tavilyKey, input);
        contextMessages = [
          {
            role: 'system',
            content: `Relevant web search results:\n\n${results}\n\nUse these if helpful and cite sources.`
          },
          ...nextMessages
        ];
      }

      const reply =
        settings.activeProvider === 'groq'
          ? await chatGroq(settings.groqKey, settings.groqModel, contextMessages)
          : await chatOpenRouter(settings.openRouterKey, settings.openRouterModel, contextMessages);

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
          <div className="empty-hint">
            <Bot size={32} strokeWidth={1.5} style={{ marginBottom: 8, color: '#4f8cff' }} />
            <p>Using <strong>{providerLabel}</strong> / <code>{modelLabel}</code></p>
            <p>Change provider and model in Settings.</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <div className="message-header">
              {m.role === 'user'
                ? <User size={14} strokeWidth={2} /> 
                : <Bot size={14} strokeWidth={2} />}
              <span className="message-role">{m.role === 'user' ? 'You' : 'AI'}</span>
            </div>
            <div className="message-body">
              {m.role === 'assistant'
                ? <ReactMarkdown>{m.content}</ReactMarkdown>
                : <p>{m.content}</p>}
            </div>
          </div>
        ))}

        {loading && (
          <div className="loading-row">
            <Loader size={16} strokeWidth={2} className="spin" />
            <span>Thinking...</span>
          </div>
        )}

        {error && (
          <div className="error-row">
            <AlertCircle size={16} strokeWidth={2} />
            <span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
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
        <button onClick={handleSend} disabled={loading} className="send-btn">
          <Send size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
