'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { BottomNav } from '@/components/ui/BottomNav';

export default function GroupChatPage({ params }: { params: { id: string } }) {
  const { userId } = useAuth();
  const { user } = useUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [group, setGroup] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${params.id}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    }
  };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${params.id}`)
      .then(r => r.json()).then(setGroup);
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [params.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${params.id}/messages`, {
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
        <a href="/groups" className="text-yellow-500 text-xl font-bold">←</a>
        <div className="w-10 h-10 rounded-xl bg-yellow-900/30 border border-yellow-900 flex items-center justify-center text-xl">⚽</div>
        <div>
          <h1 className="font-bold text-sm">{group?.name || 'Loading...'}</h1>
          <p className="text-xs text-gray-500">📍 {group?.citySlug?.replace(/_/g, ' ')}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {messages.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-3">💬</p>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm mt-1">Be the first to say something!</p>
          </div>
        )}
        {messages.map((m: any, i: number) => {
          const isMe = m.sender?.clerkId === userId;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-yellow-900 flex items-center justify-center text-yellow-500 font-bold text-xs flex-shrink-0 overflow-hidden">
                  {m.sender?.avatarUrl
                    ? <img src={m.sender.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : m.sender?.displayName?.[0] || '?'
                  }
                </div>
              )}
              <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && <p className="text-[10px] text-gray-500 mb-1 ml-1">{m.sender?.displayName}</p>}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-yellow-500 text-black rounded-br-sm' : 'bg-gray-900 border border-gray-800 text-white rounded-bl-sm'}`}>
                  {m.content}
                </div>
                <p className="text-[9px] text-gray-600 mt-1 mx-1">{new Date(m.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
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
