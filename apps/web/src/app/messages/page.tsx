'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { BottomNav } from '@/components/ui/BottomNav';

export default function MessagesPage() {
  const { userId } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!userId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/conversations`, { headers: { 'x-user-id': userId } })
      .then(r => r.json()).then(data => { setConversations(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => { load(); const i = setInterval(load, 3000); return () => clearInterval(i); }, [userId]);

  return (
    <div className="page">
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="fifa-font" style={{ fontSize: 28, color: '#00c2a8' }}>MESSAGES</h1>
          <p style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 3, textTransform: 'uppercase' }}>Your direct messages</p>
        </div>
      </header>

      <main className="inner">
        {loading && [1,2,3].map(i => <div key={i} className="card" style={{ height: 72, marginBottom: 10, opacity: 0.3 }}/>)}
        {!loading && conversations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: 56, marginBottom: 12 }}>💬</p>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>No messages yet</p>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20 }}>Follow fans and start chatting!</p>
            <a href="/fans" style={{ padding: '12px 24px', borderRadius: 12, background: '#00c2a8', color: '#000', fontWeight: 800, textDecoration: 'none', fontSize: 14 }}>Find Fans →</a>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {conversations.map((c: any) => (
            <a key={c.id} href={`/messages/${c.id}`} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', borderLeft: '3px solid #00c2a8' }}>
              <div className="avatar" style={{ width: 50, height: 50, fontSize: 20, border: '2px solid #00c2a844' }}>
                {c.other?.avatarUrl ? <img src={c.other.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : c.other?.displayName?.[0] || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 800, fontSize: 15 }}>{c.other?.displayName || 'Fan'}</p>
                <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage || 'Say hello!'}</p>
              </div>
              {c.lastMessageAt && <p style={{ fontSize: 10, color: 'var(--text3)', flexShrink: 0 }}>{new Date(c.lastMessageAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>}
            </a>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
