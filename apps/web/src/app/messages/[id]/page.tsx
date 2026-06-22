'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

const REACTIONS = ['❤️','😂','😮','😢','👍','🔥'];

export default function DMPage({ params }: { params: { id: string } }) {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [other, setOther] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, string[]>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadMessages = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/conversations/${params.id}`, { headers: { 'x-user-id': userId || '' } });
    if (res.ok) {
      const data = await res.json();
      const msgs = Array.isArray(data) ? data : [];
      setMessages(msgs);
      const otherUser = msgs.find((m: any) => m.sender?.clerkId !== userId)?.sender;
      if (otherUser) setOther(otherUser);
    }
  };

  useEffect(() => {
    if (!userId) return;
    // Load conversation info
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/conversations`, { headers: { 'x-user-id': userId } })
      .then(r => r.json()).then(convs => {
        if (Array.isArray(convs)) {
          const conv = convs.find((c: any) => c.id === params.id);
          if (conv?.other) setOther(conv.other);
        }
      });
    loadMessages();
    const i = setInterval(loadMessages, 3000);
    return () => clearInterval(i);
  }, [params.id, userId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || sending || !other?.clerkId) return;
    setSending(true);
    const content = replyTo ? `↩️ ${replyTo.sender?.displayName}: "${replyTo.content.substring(0, 40)}${replyTo.content.length > 40 ? '...' : ''}"\n${input.trim()}` : input.trim();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/dm/${other.clerkId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' },
      body: JSON.stringify({ content }),
    });
    setInput('');
    setReplyTo(null);
    setSending(false);
    loadMessages();
  };

  const addReaction = (msgId: string, emoji: string) => {
    setReactions(r => {
      const current = r[msgId] || [];
      if (current.includes(emoji)) return { ...r, [msgId]: current.filter(e => e !== emoji) };
      return { ...r, [msgId]: [...current, emoji] };
    });
    setShowReactions(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }} onClick={() => setShowReactions(null)}>
      {/* Header */}
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

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', maxWidth: 480, margin: '0 auto', width: '100%', paddingBottom: replyTo ? 120 : 80 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>👋</p>
            <p style={{ color: 'var(--text2)', fontWeight: 600 }}>Start the conversation!</p>
            <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 6 }}>Say hi to {other?.displayName || 'your new connection'}</p>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {messages.map((m: any, i: number) => {
            const isMe = m.sender?.clerkId === userId;
            const msgReactions = reactions[m.id] || [];
            const isReply = m.content?.startsWith('↩️');
            const lines = isReply ? m.content.split('\n') : null;

            return (
              <div key={m.id || i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6, marginBottom: msgReactions.length > 0 ? 16 : 2 }}>
                {!isMe && (
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: 12, flexShrink: 0 }}>
                    {m.sender?.avatarUrl ? <img src={m.sender.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m.sender?.displayName?.[0] || '?'}
                  </div>
                )}
                <div style={{ position: 'relative', maxWidth: '75%' }}>
                  {/* Message bubble */}
                  <div
                    onLongPress={() => {}}
                    onClick={e => { e.stopPropagation(); setShowReactions(showReactions === (m.id || i.toString()) ? null : (m.id || i.toString())); }}
                    style={{ padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isMe ? '#00c2a8' : 'var(--bg2)', color: isMe ? '#000' : 'var(--text)', fontSize: 14, fontWeight: isMe ? 600 : 400, border: isMe ? 'none' : '1px solid var(--border)', cursor: 'pointer' }}>
                    {isReply && lines ? (
                      <>
                        <div style={{ borderLeft: '3px solid rgba(0,0,0,0.2)', paddingLeft: 8, marginBottom: 6, opacity: 0.7, fontSize: 12 }}>{lines[0]}</div>
                        <div>{lines.slice(1).join('\n')}</div>
                      </>
                    ) : m.content}
                  </div>

                  {/* Reaction picker */}
                  {showReactions === (m.id || i.toString()) && (
                    <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: '100%', [isMe ? 'right' : 'left']: 0, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 99, padding: '6px 10px', display: 'flex', gap: 6, marginBottom: 4, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
                      {REACTIONS.map(emoji => (
                        <button key={emoji} onClick={() => addReaction(m.id || i.toString(), emoji)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: '2px 4px', borderRadius: 8, transition: 'transform 0.1s' }}>
                          {emoji}
                        </button>
                      ))}
                      <button onClick={() => { setReplyTo(m); setShowReactions(null); inputRef.current?.focus(); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text2)', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '4px 10px', borderRadius: 99 }}>
                        Reply
                      </button>
                    </div>
                  )}

                  {/* Reactions display */}
                  {msgReactions.length > 0 && (
                    <div style={{ position: 'absolute', bottom: -20, [isMe ? 'right' : 'left']: 0, display: 'flex', gap: 2 }}>
                      {[...new Set(msgReactions)].map(emoji => (
                        <span key={emoji} onClick={() => addReaction(m.id || i.toString(), emoji)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 99, padding: '1px 6px', fontSize: 12, cursor: 'pointer' }}>
                          {emoji} {msgReactions.filter(e => e === emoji).length}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div style={{ position: 'fixed', bottom: 65, left: 0, right: 0, maxWidth: 480, margin: '0 auto', background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: '#00c2a8', fontWeight: 700 }}>Replying to {replyTo.sender?.displayName}</p>
            <p style={{ fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyTo.content}</p>
          </div>
          <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer', padding: '0 0 0 12px' }}>✕</button>
        </div>
      )}

      {/* Input */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: '10px 16px', maxWidth: 480, margin: '0 auto', display: 'flex', gap: 8, alignItems: 'center' }}>
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={other ? `Message ${other.displayName}...` : 'Loading...'} className="input" style={{ flex: 1 }} disabled={!other} />
        <button onClick={send} disabled={sending || !input.trim() || !other} style={{ padding: '11px 16px', borderRadius: 12, background: '#00c2a8', color: '#000', fontWeight: 900, fontSize: 18, border: 'none', cursor: 'pointer', opacity: !input.trim() || !other ? 0.5 : 1, flexShrink: 0 }}>→</button>
      </div>
    </div>
  );
}
