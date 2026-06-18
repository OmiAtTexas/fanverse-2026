'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';

const STAMPS = [
  { id: 1, emoji: '🏟️', title: 'First Match', desc: 'Attend your first World Cup match', color: '#e8003d' },
  { id: 2, emoji: '🌍', title: 'World Traveler', desc: 'Visit 3 host cities', color: '#7b2fff' },
  { id: 3, emoji: '🤝', title: 'Fan Connector', desc: 'Connect with 5 fans', color: '#00c2a8' },
  { id: 4, emoji: '🍕', title: 'Local Foodie', desc: 'Try local food in 2 cities', color: '#ff5c1a' },
  { id: 5, emoji: '📸', title: 'Photographer', desc: 'Share 3 match day photos', color: '#ffd700' },
  { id: 6, emoji: '⚽', title: 'Group Stage Fan', desc: 'Watch 3 group stage matches', color: '#00e676' },
  { id: 7, emoji: '🏆', title: 'Quarter Final Fan', desc: 'Attend a quarter final', color: '#c9a227' },
  { id: 8, emoji: '🥇', title: 'Final Witness', desc: 'Attend the World Cup Final', color: '#e8003d' },
  { id: 9, emoji: '🌮', title: 'Mexico Explorer', desc: 'Visit a Mexican host city', color: '#00c2a8' },
  { id: 10, emoji: '🍁', title: 'Canada Explorer', desc: 'Visit a Canadian host city', color: '#e8003d' },
  { id: 11, emoji: '🦅', title: 'USA Explorer', desc: 'Visit a US host city', color: '#7b2fff' },
  { id: 12, emoji: '💬', title: 'Group Member', desc: 'Join a fan group', color: '#00e676' },
];

export default function PassportPage() {
  const { user } = useUser();
  const [earnedIds] = useState<number[]>([12]);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`)
      .then(r => r.json())
      .then(data => setMatches(Array.isArray(data) ? data.slice(0, 3) : []));
  }, []);

  const earned = STAMPS.filter(s => earnedIds.includes(s.id));
  const notEarned = STAMPS.filter(s => !earnedIds.includes(s.id));

  return (
    <div className="page">
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="fifa-font" style={{ fontSize: 28, color: '#c9a227' }}>MY PASSPORT</h1>
          <p style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 3, textTransform: 'uppercase' }}>FIFA World Cup 2026 Journey</p>
        </div>
      </header>

      <main className="inner" style={{ paddingBottom: 100 }}>
        {/* Passport Card */}
        <div style={{ borderRadius: 24, background: 'linear-gradient(135deg, #020F2A 0%, #0a2454 50%, #1a3a6b 100%)', border: '2px solid #c9a227', padding: '24px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(201, 162, 39, 0.08)' }}/>
          <div style={{ position: 'absolute', bottom: -50, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(201, 162, 39, 0.05)' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 10, color: '#c9a227', fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase' }}>FIFA World Cup</p>
              <h2 className="fifa-font" style={{ fontSize: 48, color: '#c9a227', lineHeight: 1 }}>USA '26</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 6, fontWeight: 600 }}>{user?.firstName} {user?.lastName}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 36 }}>🌍</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#c9a227' }}>{earned.length}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>STAMPS</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { label: 'Matches', value: 0, icon: '⚽' },
              { label: 'Cities', value: 0, icon: '📍' },
              { label: 'Groups', value: 1, icon: '👥' },
              { label: 'Stamps', value: earned.length, icon: '🏅' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '10px 6px', textAlign: 'center', border: '1px solid rgba(201,162,39,0.2)' }}>
                <p style={{ fontSize: 18 }}>{s.icon}</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#c9a227' }}>{s.value}</p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>{s.label.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Earned Stamps */}
        {earned.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <p className="section-label">Earned Stamps ✨</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {earned.map(s => (
                <div key={s.id} style={{ background: `${s.color}15`, border: `1px solid ${s.color}44`, borderRadius: 16, padding: '14px 8px', textAlign: 'center' }}>
                  <p style={{ fontSize: 32, marginBottom: 6 }}>{s.emoji}</p>
                  <p style={{ fontSize: 11, fontWeight: 800, color: s.color }}>{s.title}</p>
                  <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3, lineHeight: 1.3 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Matches */}
        {matches.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <p className="section-label">Upcoming Matches</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {matches.map((m: any) => (
                <div key={m.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={m.homeLogo} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} onError={(e: any) => e.target.style.display='none'} />
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{m.homeTeamCode}</span>
                    <span style={{ color: 'var(--text3)', fontSize: 11 }}>vs</span>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{m.awayTeamCode}</span>
                    <img src={m.awayLogo} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} onError={(e: any) => e.target.style.display='none'} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text2)' }}>{new Date(m.kickoffAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stamps to Earn */}
        <section>
          <p className="section-label">Earn More Stamps</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {notEarned.map(s => (
              <div key={s.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 8px', textAlign: 'center', opacity: 0.5 }}>
                <p style={{ fontSize: 32, marginBottom: 6, filter: 'grayscale(1)' }}>{s.emoji}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)' }}>{s.title}</p>
                <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3, lineHeight: 1.3 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
