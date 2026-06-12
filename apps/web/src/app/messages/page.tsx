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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/conversations`, {
      headers: { 'x-user-id': userId }
    }).then(r => r.json()).then(data => {
      setConversations(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <header className="sticky top-0 bg-black border-b border-yellow-900 px-4 py-3">
        <h1 className="text-2xl font-bold text-yellow-500 tracking-widest uppercase">Messages</h1>
        <p className="text-xs text-gray-500">Your direct messages</p>
      </header>
      <main className="px-4 py-4 space-y-3">
        {loading && <p className="text-center text-gray-500 py-8 animate-pulse">Loading...</p>}
        {!loading && conversations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-5xl mb-3">💬</p>
            <p className="text-gray-400 font-medium">No messages yet</p>
            <p className="text-gray-600 text-sm mt-1">Go to Fans and tap Message to start chatting!</p>
            <a href="/fans" className="mt-4 inline-block bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl">Find Fans →</a>
          </div>
        )}
        {conversations.map((c: any) => (
          <a key={c.id} href={`/messages/${c.id}`} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-3 block hover:border-yellow-800 transition-all">
            <div className="w-12 h-12 rounded-full bg-yellow-900 flex items-center justify-center overflow-hidden flex-shrink-0">
              {c.other?.avatarUrl
                ? <img src={c.other.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                : <span className="text-yellow-500 font-bold text-lg">{c.other?.displayName?.[0] || '?'}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{c.other?.displayName || 'Fan'}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{c.lastMessage || 'Say hello!'}</p>
            </div>
            {c.lastMessageAt && (
              <p className="text-[10px] text-gray-600 flex-shrink-0">{new Date(c.lastMessageAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            )}
          </a>
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
