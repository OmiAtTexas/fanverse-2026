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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/history`, {
      headers: { 'x-user-id': userId }
    }).then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setMessages([DEFAULT_MSG, ...data.map((m: any) => ({ role: m.role, content: m.content }))]);
      }
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
      const history = newMessages.slice(1).slice(-10);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' },
        body: JSON.stringify({ message: text.trim(), history }),
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
    if (userId) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/history`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId }
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <header className="sticky top-0 bg-black/95 backdrop-blur border-b border-yellow-900/50 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-yellow-500 tracking-widest">AI GUIDE</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">World Cup 2026 Companion</p>
        </div>
        <button onClick={clear} className="text-xs text-gray-500 border border-gray-700 px-3 py-1.5 rounded-xl">Clear</button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-44">
        {loadingHistory && <p className="text-center text-gray-600 text-xs animate-pulse py-4">Loading your chat history...</p>}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-black text-sm mr-2 flex-shrink-0 mt-1">🤖</div>
            )}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-yellow-500 text-black font-medium rounded-br-sm' : 'bg-gray-900 border border-gray-800 text-white rounded-bl-sm'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-black text-sm mr-2 flex-shrink-0">🤖</div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex gap-1 items-center">
              {[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }}/>)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-black/95 border-t border-gray-800 px-4 py-3 space-y-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {QUICK.map(q => (
            <button key={q} onClick={() => send(q)} className="flex-shrink-0 text-xs bg-gray-900 border border-gray-700 rounded-full px-3 py-1.5 text-gray-300 whitespace-nowrap hover:border-yellow-600 transition-all">{q}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)} placeholder="Ask anything about World Cup 2026..." className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-600" />
          <button onClick={() => send(input)} disabled={!input.trim() || loading} className="bg-yellow-500 text-black font-black px-5 rounded-xl text-lg disabled:opacity-50">→</button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
