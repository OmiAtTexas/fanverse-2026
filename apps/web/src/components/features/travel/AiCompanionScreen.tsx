'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { BottomNav } from '@/components/ui/BottomNav';
import { Send, MapPin, Mic } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; }

const QUICK_PROMPTS = [
  "6 hours before my match in Dallas 🏟️",
  "Best street food in LA 🌮",
  "How to get to SoFi Stadium 🚌",
  "Night out in Miami 🌴",
];

export function AiCompanionScreen() {
  const { request } = useApi();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your AI World Cup companion. Ask me about itineraries, local food, transport, or anything about the host cities! 🌟" },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: (query: string) =>
      request<{ reply: string }>('/travel/chat', {
        method: 'POST',
        body: JSON.stringify({ message: query, history: messages }),
      }),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    },
    onError: () => {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that. Please try again!" }]);
    },
  });

  const send = (text: string) => {
    if (!text.trim()) return;
    const query = text.trim();
    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    setInput('');
    chatMutation.mutate(query);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center">
            <span className="text-gold text-sm">AI</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm">AI Travel Companion</h1>
            <p className="text-xs text-muted">Powered by GPT-4</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs text-wc-green">
            <span className="w-1.5 h-1.5 bg-wc-green rounded-full" />
            Online
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-36">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gold text-black rounded-tr-sm'
                  : 'bg-surface border border-border rounded-tl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {QUICK_PROMPTS.map((p) => (
            <button key={p} onClick={() => send(p)} className="flex-shrink-0 text-xs bg-surface border border-border rounded-full px-3 py-1.5 text-foreground whitespace-nowrap">
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t border-border px-4 py-3 pb-safe-bottom mb-16">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="Ask about cities, food, transport..."
            className="input-dark flex-1 text-sm py-2.5"
          />
          <button onClick={() => send(input)} className="btn-primary p-2.5 rounded-xl">
            <Send size={18} />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
