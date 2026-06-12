'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';

const STAMPS = [
  { id: 1, emoji: '🏟️', title: 'First Match', desc: 'Attend your first World Cup match' },
  { id: 2, emoji: '🌍', title: 'World Traveler', desc: 'Visit 3 host cities' },
  { id: 3, emoji: '🤝', title: 'Fan Connector', desc: 'Connect with 5 fans' },
  { id: 4, emoji: '🍕', title: 'Local Foodie', desc: 'Try local food in 2 cities' },
  { id: 5, emoji: '📸', title: 'Photographer', desc: 'Share 3 match day photos' },
  { id: 6, emoji: '⚽', title: 'Group Stage Fan', desc: 'Watch 3 group stage matches' },
  { id: 7, emoji: '🏆', title: 'Quarter Final Fan', desc: 'Attend a quarter final' },
  { id: 8, emoji: '🥇', title: 'Final Witness', desc: 'Attend the World Cup Final' },
  { id: 9, emoji: '🌮', title: 'Mexico Explorer', desc: 'Visit a Mexican host city' },
  { id: 10, emoji: '🍁', title: 'Canada Explorer', desc: 'Visit a Canadian host city' },
  { id: 11, emoji: '🦅', title: 'USA Explorer', desc: 'Visit a US host city' },
  { id: 12, emoji: '💬', title: 'Group Member', desc: 'Join a fan group' },
];

export default function PassportPage() {
  const { user } = useUser();
  const [earnedIds, setEarnedIds] = useState<number[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    // Load matches to show upcoming
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`)
      .then(r => r.json())
      .then(data => setMatches(data.slice(0, 3)));
    // Simulated earned stamps based on user joining
    setEarnedIds([12]); // joined a group
  }, []);

  const earned = STAMPS.filter(s => earnedIds.includes(s.id));
  const notEarned = STAMPS.filter(s => !earnedIds.includes(s.id));

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <header className="sticky top-0 bg-black border-b border-yellow-900 px-4 py-3">
        <h1 className="text-2xl font-bold text-yellow-500 tracking-widest uppercase">My Passport</h1>
        <p className="text-xs text-gray-500">FIFA World Cup 2026 Journey</p>
      </header>

      <main className="px-4 py-4 space-y-5">
        {/* Passport card */}
        <div className="bg-gradient-to-br from-green-950 via-black to-green-950 border border-green-800 rounded-3xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-green-500 text-xs font-bold tracking-widest uppercase">FIFA World Cup</p>
              <h2 className="text-4xl font-black text-green-400 tracking-wider">USA '26</h2>
              <p className="text-gray-400 text-sm mt-1">{user?.firstName} {user?.lastName}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl">🌍</p>
              <p className="text-yellow-500 font-bold text-xl mt-1">{earned.length} stamps</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: 'Matches', value: 0, icon: '⚽' },
              { label: 'Cities', value: 0, icon: '📍' },
              { label: 'Groups', value: 1, icon: '👥' },
              { label: 'Stamps', value: earned.length, icon: '🏅' },
            ].map(s => (
              <div key={s.label} className="bg-black/30 rounded-xl p-2 text-center">
                <p className="text-lg">{s.icon}</p>
                <p className="text-yellow-500 font-bold text-lg">{s.value}</p>
                <p className="text-gray-500 text-[9px]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Earned stamps */}
        {earned.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-3">Earned Stamps</h3>
            <div className="grid grid-cols-3 gap-3">
              {earned.map(s => (
                <div key={s.id} className="bg-yellow-950/30 border border-yellow-800 rounded-2xl p-3 text-center">
                  <p className="text-3xl">{s.emoji}</p>
                  <p className="text-xs font-bold mt-1">{s.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming stamps to earn */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Earn More Stamps</h3>
          <div className="grid grid-cols-3 gap-3">
            {notEarned.map(s => (
              <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-3 text-center opacity-60">
                <p className="text-3xl grayscale">{s.emoji}</p>
                <p className="text-xs font-bold mt-1">{s.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming matches */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Upcoming Matches</h3>
          <div className="space-y-2">
            {matches.map((m: any) => (
              <div key={m.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={m.homeLogo} alt="" className="w-6 h-6 object-contain" />
                  <span className="text-xs font-bold">{m.homeTeamCode}</span>
                  <span className="text-xs text-gray-500">vs</span>
                  <span className="text-xs font-bold">{m.awayTeamCode}</span>
                  <img src={m.awayLogo} alt="" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-[10px] text-gray-500">{new Date(m.kickoffAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
