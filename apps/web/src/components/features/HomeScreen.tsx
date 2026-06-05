'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { BottomNav } from '@/components/ui/BottomNav';
import { MatchCard } from '@/components/features/matches/MatchCard';
import { FanSuggestionCard } from '@/components/features/matching/FanSuggestionCard';
import { ActivityFeed } from '@/components/features/ActivityFeed';

export function HomeScreen() {
  const { user } = useUser();
  const { request } = useApi();

  const { data: matches } = useQuery({
    queryKey: ['matches', 'upcoming'],
    queryFn: () => request<any[]>('/matches?limit=3'),
  });

  const { data: suggestions } = useQuery({
    queryKey: ['matching', 'suggestions'],
    queryFn: () => request<any[]>('/matching/suggestions?limit=5'),
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
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

      <main className="px-4 py-4 space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-xl font-semibold">
            Welcome back, <span className="text-gold">{user?.firstName}</span> 👋
          </h2>
          <p className="text-sm text-muted mt-0.5">Here's what's happening today</p>
        </div>

        {/* Upcoming Matches */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-muted uppercase tracking-wider">Your Matches</h3>
            <a href="/matches" className="text-xs text-gold">See all →</a>
          </div>
          <div className="space-y-3">
            {matches?.slice(0, 2).map((match) => (
              <MatchCard key={match.id} match={match} compact />
            ))}
            {!matches?.length && (
              <div className="card-dark p-4 text-center text-sm text-muted">
                <p>No upcoming matches saved.</p>
                <a href="/matches" className="text-gold text-xs mt-1 inline-block">Browse schedule →</a>
              </div>
            )}
          </div>
        </section>

        {/* Fan Suggestions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-muted uppercase tracking-wider">Meet Fans</h3>
            <a href="/fans" className="text-xs text-gold">See all →</a>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {suggestions?.map((fan) => (
              <FanSuggestionCard key={fan.id} fan={fan} />
            ))}
          </div>
        </section>

        {/* Activity Feed */}
        <section>
          <h3 className="font-semibold text-sm text-muted uppercase tracking-wider mb-3">Activity</h3>
          <ActivityFeed />
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
