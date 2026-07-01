import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, AlertCircle, Loader, Trash2, Copy, Download, Check } from 'lucide-react';
import { Share } from '@capacitor/share';
import { chatGroq, chatOpenRouter, searchTavily } from './api.js';

function CopyDownloadBar({ content, index }) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleShare() {
    setSharing(true);
    try {
      await Share.share({
        title: `Nexus Response ${index + 1}`,
        text: content,
        dialogTitle: 'Save or share response'
      });
    } catch (e) {
      // User cancelled share sheet -- not an error
      if (e && e.message && !e.message.includes('cancel')) {
        navigator.clipboard.writeText(content);
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="msg-action-bar">
      <button className="msg-action-btn" onClick={handleCopy} title="Copy text">
        {copied ? <Check size={13} strokeWidth={2} style={{ color: '#4caf50' }} /> : <Copy size={13} strokeWidth={2} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <button className="msg-action-btn" onClick={handleShare} disabled={sharing} title="Share / Save">
        <Download size={13} strokeWidth={2} />
        {sharing ? 'Sharing...' : 'Share'}
      </button>
    </div>
  );
}

export default function ChatTab({ settings, messages, setMessages }) {
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

  function handleClear() {
    setMessages([]);
    setError('');
  }

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

  // Count only assistant messages for labeling downloads
  let assistantIndex = -1;

  return (
    <div className="chat-tab">
      <div className="chat-toolbar">
        <span className="chat-provider-label">
          {providerLabel} / <code>{modelLabel}</code>
        </span>
        {messages.length > 0 && (
          <button className="clear-btn" onClick={handleClear} title="Clear chat">
            <Trash2 size={15} strokeWidth={2} />
            Clear
          </button>
        )}
      </div>

      <div className="message-list">
        {messages.length === 0 && (
          <div className="empty-hint">
            <Bot size={32} strokeWidth={1.5} style={{ marginBottom: 8, color: '#4f8cff' }} />
            <p>Chat history lasts until you close the app.</p>
            <p>Change provider and model in Settings.</p>
          </div>
        )}

        {messages.map((m, i) => {
          if (m.role === 'assistant') assistantIndex++;
          const aiIdx = assistantIndex;
          return (
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
              {m.role === 'assistant' && (
                <CopyDownloadBar content={m.content} index={aiIdx} />
              )}
            </div>
          );
        })}

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
