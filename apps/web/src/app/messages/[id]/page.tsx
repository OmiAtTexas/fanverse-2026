'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function DMPage({ params }: { params: { id: string } }) {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [other, setOther] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/conversations/${params.id}`, {
      headers: { 'x-user-id': userId || '' }
    });
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
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [params.id, userId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || sending || !other) return;
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
    <div className="flex flex-col h-screen bg-black text-white">
      <header className="sticky top-0 bg-black border-b border-yellow-900 px-4 py-3 flex items-center gap-3">
        <a href="/messages" className="text-yellow-500 text-xl font-bold">←</a>
        <div className="w-10 h-10 rounded-full bg-yellow-900 flex items-center justify-center overflow-hidden">
          {other?.avatarUrl
            ? <img src={other.avatarUrl} alt="" className="w-full h-full object-cover" />
            : <span className="text-yellow-500 font-bold">{other?.displayName?.[0] || '?'}</span>
          }
        </div>
        <div>
          <h1 className="font-bold text-sm">{other?.displayName || 'Loading...'}</h1>
          <p className="text-xs text-gray-500">{other?.supportedTeam ? `⚽ ${other.supportedTeam}` : 'Fan'}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {messages.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-3">👋</p>
            <p className="font-medium">Say hello!</p>
          </div>
        )}
        {messages.map((m: any, i: number) => {
          const isMe = m.sender?.clerkId === userId;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-yellow-500 text-black rounded-br-sm' : 'bg-gray-900 border border-gray-800 text-white rounded-bl-sm'}`}>
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 px-4 py-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-600"
        />
        <button onClick={send} disabled={sending || !input.trim()} className="bg-yellow-500 text-black font-bold px-5 rounded-xl disabled:opacity-50 text-lg">→</button>
      </div>
    </div>
  );
}
