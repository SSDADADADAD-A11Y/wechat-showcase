import { useState, useRef, useEffect } from 'react';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '你好！我是视觉便签的AI助手 🤖\n\n有什么关于红包封面或公众号的问题，随时问我！' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages.slice(1), userMsg],
        }),
      });

      const data = await res.json();
      const reply = data.reply || '抱歉，我暂时无法回复，请稍后再试。';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '网络出问题了，请检查网络后重试。' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {open && (
        <div className="chat-panel">
          <div className="chat-panel__header">
            <div className="chat-panel__header-info">
              <span className="chat-panel__avatar">🤖</span>
              <div>
                <div className="chat-panel__title">视觉便签 AI助手</div>
                <div className="chat-panel__status">在线</div>
              </div>
            </div>
            <button className="chat-panel__close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-panel__messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role === 'user' ? 'chat-msg--user' : 'chat-msg--bot'}`}>
                <div className="chat-msg__bubble">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg chat-msg--bot">
                <div className="chat-msg__bubble chat-msg__bubble--loading">
                  <span className="chat-dot" />
                  <span className="chat-dot" />
                  <span className="chat-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-panel__input-area">
            <input
              className="chat-panel__input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              disabled={loading}
            />
            <button
              className="chat-panel__send"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              发送
            </button>
          </div>
        </div>
      )}

      <button className={`chat-fab ${open ? 'chat-fab--hidden' : ''}`} onClick={() => setOpen(true)}>
        <span className="chat-fab__icon">💬</span>
      </button>
    </>
  );
}
