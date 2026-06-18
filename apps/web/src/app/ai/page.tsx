'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { BottomNav } from '@/components/ui/BottomNav';

const QUICK = [
  '🏟️ Things to do before a match in Dallas',
  '🌮 Best food in Mexico City',
  '🚇 How to get to MetLife Stadium NYC',
  '🏖️ Matchday tips for Miami',
  '✈️ Travel tips for World Cup fans',
  '🗺️ Which cities are best to visit?',
  '💰 Budget tips for World Cup travel',
  '🍺 Best fan zones in Los Angeles',
];

const DEFAULT_MSG = { role: 'assistant', content: "Hey! I'm your FIFA World Cup 2026 AI guide 🌍⚽ Ask me anything about host cities, travel, food, transport, or match day tips!" };

export default function AiPage() {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([DEFAULT_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/history`, { headers: { 'x-user-id': userId } })
      .then(r => r.json()).then(data => {
        if (Array.isArray(data) && data.length > 0) setMessages([DEFAULT_MSG, ...data.map((m: any) => ({ role: m.role, content: m.content }))]);
        setLoadingHistory(false);
      }).catch(() => setLoadingHistory(false));
  }, [userId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: text.trim() }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' },
        body: JSON.stringify({ message: text.trim(), history: newMessages.slice(1).slice(-10) }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', content: data.reply || 'Sorry, try again!' }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Something went wrong. Try again!' }]);
    }
    setLoading(false);
  };

  const clear = async () => {
    setMessages([DEFAULT_MSG]);
    if (userId) await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/history`, { method: 'DELETE', headers: { 'x-user-id': userId } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header className="app-header">
        <div className="app-header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="fifa-font" style={{ fontSize: 28, color: '#ffd700' }}>AI GUIDE</h1>
            <p style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 3, textTransform: 'uppercase' }}>World Cup 2026 Companion</p>
          </div>
          <button onClick={clear} style={{ padding: '6px 14px', borderRadius: 10, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Clear</button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', maxWidth: 480, margin: '0 auto', width: '100%', paddingBottom: 160 }}>
        {loadingHistory && <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, padding: '12px 0', fontStyle: 'italic' }}>Loading chat history...</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
              {m.role === 'assistant' && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #ffd700, #ff5c1a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🤖</div>
              )}
              <div style={{ maxWidth: '78%', padding: '12px 16px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: m.role === 'user' ? 'var(--red)' : 'var(--bg2)', color: m.role === 'user' ? 'white' : 'var(--text)', fontSize: 14, lineHeight: 1.5, border: m.role === 'user' ? 'none' : '1px solid var(--border)', fontWeight: m.role === 'user' ? 600 : 400 }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #ffd700, #ff5c1a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
              <div style={{ padding: '14px 18px', background: 'var(--bg2)', borderRadius: '18px 18px 18px 4px', border: '1px solid var(--border)', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0,1,2].map(i => <span key={i} className="pulse-dot" style={{ width: 8, height: 8, background: '#ffd700', borderRadius: '50%', display: 'inline-block', animationDelay: `${i*200}ms` }}/>)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 64, left: 0, right: 0, background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: '12px 16px', maxWidth: 480, margin: '0 auto' }}>
        <div className="scrollbar-hide" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 10, paddingBottom: 4 }}>
          {QUICK.map(q => (
            <button key={q} onClick={() => send(q)} className="pill" style={{ flexShrink: 0 }}>{q}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)} placeholder="Ask anything about World Cup 2026..." className="input" style={{ flex: 1 }} />
          <button onClick={() => send(input)} disabled={!input.trim() || loading} style={{ padding: '12px 18px', borderRadius: 12, background: '#ffd700', color: '#000', fontWeight: 900, fontSize: 18, border: 'none', cursor: 'pointer', opacity: !input.trim() || loading ? 0.5 : 1, transition: 'all 0.2s' }}>→</button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
