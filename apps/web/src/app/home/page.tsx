'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/ui/BottomNav';

export default function HomePage() {
  const { user } = useUser();
  const [matches, setMatches] = useState<any[]>([]);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (user && !synced) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sync`, {
        method: 'POST',
        headers: {
          'x-user-id': user.id,
          'x-user-email': user.emailAddresses[0]?.emailAddress || '',
          'x-user-name': `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          'x-user-avatar': user.imageUrl || '',
        },
      }).then(() => setSynced(true));
    }
  }, [user, synced]);

  useEffect(() => {
    const load = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`)
        .then(r => r.json())
        .then(data => setMatches(Array.isArray(data) ? data.slice(0, 5) : []));
    };
    load();
    const i = setInterval(load, 30000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <header className="sticky top-0 bg-black/95 backdrop-blur border-b border-yellow-900/50 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-yellow-500 tracking-widest">FANVERSE 2026</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">FIFA World Cup Companion</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-950/40 border border-red-900/50 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"/>LIVE
          </span>
          <Link href="/profile">
            {user?.imageUrl
              ? <img src={user.imageUrl} alt="" className="w-9 h-9 rounded-full border-2 border-yellow-700" />
              : <div className="w-9 h-9 rounded-full bg-yellow-900 border-2 border-yellow-700 flex items-center justify-center text-yellow-500 font-black">{user?.firstName?.[0] || '?'}</div>
            }
          </Link>
        </div>
      </header>

      <main className="px-4 py-5 space-y-6">
        <div>
          <h2 className="text-2xl font-black">Hey <span className="text-yellow-500">{user?.firstName || 'Fan'}</span> 👋</h2>
          <p className="text-gray-500 text-sm mt-0.5">Welcome to the biggest World Cup ever</p>
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Today's Matches</h3>
            <Link href="/matches" className="text-xs text-yellow-500 font-medium">See all →</Link>
          </div>
          <div className="space-y-2">
            {matches.length === 0 && <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center text-gray-600 text-sm animate-pulse">Loading matches...</div>}
            {matches.map((m: any) => (
              <div key={m.id} className={`rounded-2xl border p-3 ${m.isLive ? 'border-red-700 bg-red-950/20' : m.isCompleted ? 'border-gray-700 bg-gray-900' : 'border-gray-800 bg-gray-900'}`}>
                {m.isLive && <div className="flex items-center gap-1 mb-1.5"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"/><span className="text-red-400 text-[10px] font-bold">LIVE · {m.clock}</span></div>}
                <div className="flex items-center">
                  <div className="flex-1 flex items-center gap-2">
                    <img src={m.homeLogo} alt="" className="w-8 h-8 object-contain" onError={(e: any) => e.target.style.display='none'} />
                    <span className="font-bold text-sm">{m.homeTeamCode}</span>
                  </div>
                  <div className="text-center px-2">
                    {m.isLive || m.isCompleted
                      ? <span className="text-yellow-500 font-black text-lg">{m.homeScore} - {m.awayScore}</span>
                      : <span className="text-gray-400 text-xs font-medium">{new Date(m.kickoffAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    }
                    {m.isCompleted && <p className="text-[9px] text-gray-600">FT</p>}
                  </div>
                  <div className="flex-1 flex items-center gap-2 justify-end">
                    <span className="font-bold text-sm">{m.awayTeamCode}</span>
                    <img src={m.awayLogo} alt="" className="w-8 h-8 object-contain" onError={(e: any) => e.target.style.display='none'} />
                  </div>
                </div>
                <p className="text-[9px] text-gray-600 text-center mt-1.5">📍 {m.venue}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Explore</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { emoji: '👥', label: 'Find Fans', href: '/fans' },
              { emoji: '🫂', label: 'Groups', href: '/groups' },
              { emoji: '🤖', label: 'AI Guide', href: '/ai' },
              { emoji: '💬', label: 'Messages', href: '/messages' },
              { emoji: '🏅', label: 'Passport', href: '/passport' },
              { emoji: '👤', label: 'Profile', href: '/profile' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="bg-gray-900 border border-gray-800 rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:border-yellow-800 transition-all active:scale-95">
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[11px] font-medium text-gray-300">{item.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
