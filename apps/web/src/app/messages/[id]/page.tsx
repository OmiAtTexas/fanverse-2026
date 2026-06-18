'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function DMPage({ params }: { params: { id: string } }) {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [other, setOther] = useState<any>(null);
  const [convInfo, setConvInfo] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversation = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/conversations`, { headers: { 'x-user-id': userId || '' } });
    if (res.ok) {
      const convs = await res.json();
      const conv = Array.isArray(convs) ? convs.find((c: any) => c.id === params.id) : null;
      if (conv?.other) setOther(conv.other);
    }
  };

  const loadMessages = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/conversations/${params.id}`, { headers: { 'x-user-id': userId || '' } });
    if (res.ok) {
      const data = await res.json();
      const msgs = Array.isArray(data) ? data : [];
      setMessages(msgs);
      if (msgs.length > 0) {
        const otherUser = msgs.find((m: any) => m.sender?.clerkId !== userId)?.sender;
        if (otherUser) setOther(otherUser);
      }
    }
  };

  useEffect(() => {
    if (!userId) return;
    loadConversation();
    loadMessages();
    const i = setInterval(loadMessages, 3000);
    return () => clearInterval(i);
  }, [params.id, userId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || sending || !other?.clerkId) return;
    setSending(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/dm/${other.clerkId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' },
      body: JSON.stringify({ content: input.trim() }),
    });
    setInput('');
    setSending(false);
    loadMessages();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header className="app-header">
        <div className="app-header-inner" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/messages" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#00c2a8', textDecoration: 'none', fontWeight: 900 }}>←</a>
          <div className="avatar" style={{ width: 38, height: 38, fontSize: 16, border: '2px solid #00c2a8' }}>
            {other?.avatarUrl ? <img src={other.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#00c2a8', fontWeight: 800 }}>{other?.displayName?.[0] || '?'}</span>}
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15 }}>{other?.displayName || 'Loading...'}</p>
            <p style={{ fontSize: 11, color: 'var(--text2)' }}>{other?.supportedTeam ? `⚽ ${other.supportedTeam}` : 'Fan'}</p>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', maxWidth: 480, margin: '0 auto', width: '100%', paddingBottom: 80 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>👋</p>
            <p style={{ color: 'var(--text2)', fontWeight: 600 }}>Start the conversation!</p>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {messages.map((m: any, i: number) => {
            const isMe = m.sender?.clerkId === userId;
            return (
              <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
                {!isMe && (
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: 12, flexShrink: 0 }}>
                    {m.sender?.avatarUrl ? <img src={m.sender.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m.sender?.displayName?.[0] || '?'}
                  </div>
                )}
                <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isMe ? '#00c2a8' : 'var(--bg2)', color: isMe ? '#000' : 'var(--text)', fontSize: 14, fontWeight: isMe ? 600 : 400, border: isMe ? 'none' : '1px solid var(--border)' }}>
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: '12px 16px', maxWidth: 480, margin: '0 auto', display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={other ? `Message ${other.displayName}...` : 'Loading...'} className="input" style={{ flex: 1 }} disabled={!other} />
        <button onClick={send} disabled={sending || !input.trim() || !other} style={{ padding: '12px 18px', borderRadius: 12, background: '#00c2a8', color: '#000', fontWeight: 900, fontSize: 18, border: 'none', cursor: 'pointer', opacity: !input.trim() || !other ? 0.5 : 1 }}>→</button>
      </div>
    </div>
  );
}
