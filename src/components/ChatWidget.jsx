import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '你好，我是视觉便签的 AI 助手。\n\n想了解红包封面、公众号领取方式或定制合作，都可以问我。',
    },
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
    setMessages((prev) => [...prev, userMsg]);
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
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: '网络出了点问题，请检查网络后重试。' }]);
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
              <span className="chat-panel__avatar"><MessageCircle size={22} aria-hidden="true" /></span>
              <div>
                <div className="chat-panel__title">视觉便签 AI 助手</div>
                <div className="chat-panel__status">在线</div>
              </div>
            </div>
            <button className="chat-panel__close" onClick={() => setOpen(false)} aria-label="关闭对话">
              <X size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="chat-panel__messages">
            {messages.map((msg, i) => (
              <div key={`${msg.role}-${i}`} className={`chat-msg ${msg.role === 'user' ? 'chat-msg--user' : 'chat-msg--bot'}`}>
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
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息..."
              disabled={loading}
            />
            <button
              className="chat-panel__send"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="发送消息"
            >
              <Send size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <button className={`chat-fab ${open ? 'chat-fab--hidden' : ''}`} onClick={() => setOpen(true)} aria-label="打开 AI 助手">
        <MessageCircle size={25} aria-hidden="true" />
      </button>
    </>
  );
}
