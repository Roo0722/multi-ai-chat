import React, { useState } from 'react';

export default function ChatTab() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Chat UI scaffolded. API wiring comes in a later step.' }
  ]);
  const [input, setInput] = useState('');

  function handleSend() {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setInput('');
    // NOTE: Actual Groq/OpenRouter/Tavily call logic will be added in a later step.
  }

  return (
    <div className="chat-tab">
      <div className="message-list">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <span className="message-role">{m.role === 'user' ? 'You' : 'AI'}</span>
            <p>{m.content}</p>
          </div>
        ))}
      </div>

      <div className="input-row">
        <input
          type="text"
          value={input}
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
