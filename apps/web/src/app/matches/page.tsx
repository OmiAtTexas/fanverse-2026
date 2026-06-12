'use client';

import { useEffect, useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  const getDates = () => {
    const dates = [];
    for (let i = -2; i <= 10; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const formatDate = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');

  const load = (date?: string) => {
    setLoading(true);
    const url = date
      ? `${process.env.NEXT_PUBLIC_API_URL}/matches?date=${date}`
      : `${process.env.NEXT_PUBLIC_API_URL}/matches`;
    fetch(url).then(r => r.json()).then(data => {
      setMatches(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  };

  useEffect(() => {
    load(selectedDate);
    const i = setInterval(() => load(selectedDate), 30000);
    return () => clearInterval(i);
  }, [selectedDate]);

  const grouped = matches.reduce((acc: any, m: any) => {
    const d = new Date(m.kickoffAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!acc[d]) acc[d] = [];
    acc[d].push(m);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <header className="sticky top-0 bg-black/95 backdrop-blur border-b border-yellow-900/50 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-black text-yellow-500 tracking-widest">MATCHES</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">FIFA World Cup 2026 · Live</p>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-950/40 border border-red-900/50 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"/>LIVE
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setSelectedDate('')} className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedDate === '' ? 'bg-yellow-500 text-black' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>
            Today
          </button>
          {getDates().map(d => {
            const key = formatDate(d);
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return (
              <button key={key} onClick={() => setSelectedDate(key)} className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedDate === key ? 'bg-yellow-500 text-black' : 'bg-gray-900 text-gray-400 border border-gray-800'}`}>
                {label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="px-4 py-4 space-y-6">
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 animate-pulse h-28"/>
            ))}
          </div>
        )}
        {!loading && matches.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📅</p>
            <p className="text-gray-400 font-medium">No matches on this date</p>
          </div>
        )}
        {Object.entries(grouped).map(([date, dayMatches]: any) => (
          <div key={date}>
            <p className="text-xs text-yellow-500/80 font-bold uppercase tracking-widest mb-3">{date}</p>
            <div className="space-y-3">
              {dayMatches.map((m: any) => (
                <div key={m.id} className={`rounded-2xl border overflow-hidden ${m.isLive ? 'border-red-700' : m.isCompleted ? 'border-gray-700' : 'border-gray-800'} bg-gray-900`}>
                  {m.isLive && (
                    <div className="bg-red-700 px-3 py-1.5 flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"/>
                      <span className="text-white text-xs font-black tracking-wider">LIVE · {m.clock}</span>
                    </div>
                  )}
                  {m.isCompleted && (
                    <div className="bg-gray-800 px-3 py-1.5">
                      <span className="text-gray-400 text-xs font-bold tracking-wider">FULL TIME</span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <img src={m.homeLogo} alt={m.homeTeam} className="w-14 h-14 object-contain" onError={(e: any) => e.target.style.display='none'} />
                        <p className="font-bold text-sm text-center leading-tight">{m.homeTeam}</p>
                      </div>
                      <div className="px-3 text-center min-w-[100px]">
                        {m.isLive || m.isCompleted ? (
                          <div>
                            <p className="font-black text-4xl text-yellow-500">{m.homeScore} - {m.awayScore}</p>
                            {m.winner && <p className="text-xs text-green-400 mt-1 font-bold">{m.winner === 'Draw' ? '🤝 Draw' : `🏆 ${m.winner}`}</p>}
                          </div>
                        ) : (
                          <div>
                            <p className="text-base font-black text-white">{new Date(m.kickoffAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-[9px] text-gray-600 mt-0.5">vs</p>
                          </div>
                        )}
                        <p className="text-[9px] text-gray-600 mt-1">{m.stage}</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <img src={m.awayLogo} alt={m.awayTeam} className="w-14 h-14 object-contain" onError={(e: any) => e.target.style.display='none'} />
                        <p className="font-bold text-sm text-center leading-tight">{m.awayTeam}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                      <p className="text-[10px] text-gray-600">📍 {m.venue}{m.city ? `, ${m.city}` : ''}</p>
                      {m.isCompleted && m.espnUrl && (
                        <a href={m.espnUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-yellow-500 font-bold">ESPN Report →</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
