'use client';

import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { BottomNav } from '@/components/ui/BottomNav';

const STAMP_ICONS: Record<string, string> = {
  MATCH_ATTENDED: '🏆',
  CITY_VISITED: '🏙️',
  GROUP_JOINED: '🤝',
  MEETUP_ATTENDED: '🎉',
  FAN_MET: '⭐',
  JOURNEY_COMPLETE: '🌟',
};

export function PassportScreen() {
  const { request } = useApi();
  const { data: passport } = useQuery({
    queryKey: ['passport'],
    queryFn: () => request<any>('/passport/my'),
  });

  const stamps = passport?.stamps || [];
  const stats = passport?.stats || { matches: 0, cities: 0, fans: 0, meetups: 0 };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <h1 className="font-bebas text-2xl tracking-wider">WORLD CUP PASSPORT</h1>
      </header>

      <main className="px-4 py-4 space-y-5">
        {/* Passport Cover */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a2a1a] via-[#0d1a0d] to-[#001500] border border-wc-green/30 p-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-wc-green/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-wc-green/70 text-[10px] font-medium tracking-widest">FIFA WORLD CUP</p>
              <h2 className="font-bebas text-5xl text-wc-green tracking-widest leading-none">USA '26</h2>
              <p className="text-xs text-muted mt-1">Your Fan Journey</p>
            </div>
            <div className="text-right">
              <div className="text-3xl">🌍</div>
              <p className="font-bebas text-gold text-xl tracking-wide mt-1">{stamps.length} STAMPS</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mt-5">
            {[
              { label: 'Matches', value: stats.matches, icon: '⚽' },
              { label: 'Cities', value: stats.cities, icon: '📍' },
              { label: 'Fans Met', value: stats.fans, icon: '🤝' },
              { label: 'Meetups', value: stats.meetups, icon: '🎉' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-black/20 rounded-xl p-2 text-center">
                <div className="text-base">{icon}</div>
                <div className="font-bebas text-xl text-gold">{value}</div>
                <div className="text-[9px] text-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stamps */}
        <section>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">My Stamps</h3>
          {stamps.length === 0 && (
            <div className="card-dark p-8 text-center text-muted">
              <p className="text-4xl mb-2">🎒</p>
              <p className="text-sm">Attend matches and visit cities to earn stamps!</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            {stamps.map((stamp: any) => (
              <div key={stamp.id} className="card-dark p-3 flex flex-col items-center text-center gap-1">
                <div className="text-3xl">{STAMP_ICONS[stamp.type] || '🏅'}</div>
                <p className="text-[11px] font-medium leading-tight">{stamp.title}</p>
                <p className="text-[10px] text-muted">{new Date(stamp.earnedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Generate Story button */}
        <button className="w-full btn-primary py-4 rounded-2xl font-semibold text-center">
          ✨ Generate My Journey Story
        </button>
      </main>
      <BottomNav />
    </div>
  );
}
