'use client';

import { useUser } from '@clerk/nextjs';
import { BottomNav } from '@/components/ui/BottomNav';

export default function HomePage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bebas text-3xl text-gold tracking-widest">FANVERSE</h1>
            <p className="text-xs text-muted -mt-1">FIFA World Cup 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-wc-red/10 text-wc-red text-xs font-medium px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-wc-red rounded-full animate-pulse" />
              LIVE
            </span>
            {user?.imageUrl && (
              <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full border border-border" />
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">
            Welcome, <span className="text-gold">{user?.firstName || 'Fan'}</span> 👋
          </h2>
          <p className="text-sm text-muted mt-1">Your World Cup journey starts here</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '⚽', label: 'Browse Matches', href: '/matches', color: 'bg-wc-red/10 border-wc-red/20' },
            { icon: '🤝', label: 'Find Fans', href: '/fans', color: 'bg-gold/10 border-gold/20' },
            { icon: '💬', label: 'Fan Groups', href: '/groups', color: 'bg-blue-500/10 border-blue-500/20' },
            { icon: '🗺️', label: 'AI Guide', href: '/ai', color: 'bg-purple-500/10 border-purple-500/20' },
            { icon: '📍', label: 'Meetups', href: '/meetups', color: 'bg-green-500/10 border-green-500/20' },
            { icon: '🏅', label: 'My Passport', href: '/passport', color: 'bg-yellow-500/10 border-yellow-500/20' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`card-dark border ${item.color} p-4 flex flex-col gap-2 hover:scale-105 transition-transform`}
            >
              <span className="text-3xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </a>
          ))}
        </div>

        {/* Status card */}
        <div className="card-dark p-4 border border-gold/20">
          <p className="text-xs text-gold font-medium uppercase tracking-wider mb-1">🚧 Coming Soon</p>
          <p className="text-sm text-muted">AI fan matching, real-time chat, and travel companion are being set up. Check back soon!</p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}