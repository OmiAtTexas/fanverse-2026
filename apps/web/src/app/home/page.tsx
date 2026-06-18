'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/ui/BottomNav';

const ACCENT_COLORS = ['#e8003d','#7b2fff','#00c2a8','#ff5c1a','#ffd700','#00e676'];

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
    <div className="page" style={{ background: 'var(--bg)' }}>
      <header className="header">
        <div className="header-inner flex items-center justify-between">
          <div>
            <h1 className="fifa-font" style={{ fontSize: 28, color: '#e8003d', lineHeight: 1 }}>FANVERSE 26</h1>
            <p style={{ fontSize: 9, color: 'var(--gray)', letterSpacing: 3, textTransform: 'uppercase' }}>FIFA World Cup Companion</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="live-badge"><span className="pulse-dot" style={{ width: 6, height: 6, background: 'white', borderRadius: '50%', display: 'inline-block' }}/>LIVE</span>
            <Link href="/profile">
              {user?.imageUrl
                ? <img src={user.imageUrl} alt="" style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #e8003d' }} />
                : <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e8003d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16 }}>{user?.firstName?.[0] || '?'}</div>
              }
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>
        {/* Hero */}
        <div className="animate-slide-up" style={{ padding: '24px 20px', borderRadius: 22, background: 'linear-gradient(135deg, #e8003d 0%, #7b2fff 100%)', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}/>
          <div style={{ position: 'absolute', bottom: -40, right: 20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>
          <p style={{ fontSize: 12, opacity: 0.8, marginBottom: 6, fontWeight: 600 }}>Welcome back,</p>
          <h2 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>{user?.firstName || 'Fan'} 👋</h2>
          <p style={{ fontSize: 12, opacity: 0.75, fontWeight: 500 }}>🔥 The World Cup has started!</p>
        </div>

        {/* Today's Matches */}
        <div style={{ marginBottom: 24 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <p className="section-label">Today's Matches</p>
            <Link href="/matches" style={{ fontSize: 11, color: '#e8003d', fontWeight: 700, textDecoration: 'none' }}>See all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {matches.length === 0 && (
              <div className="card" style={{ padding: '20px', textAlign: 'center', color: 'var(--gray)', fontSize: 13 }}>Loading matches...</div>
            )}
            {matches.map((m: any, idx: number) => {
              const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
              return (
                <div key={m.id} className="match-card animate-slide-up" style={{ borderLeft: `3px solid ${color}` }}>
                  {m.isLive && <div style={{ background: '#e8003d', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6 }}><span className="pulse-dot" style={{ width: 6, height: 6, background: 'white', borderRadius: '50%', display: 'inline-block' }}/><span style={{ fontSize: 10, fontWeight: 800, color: 'white', letterSpacing: 1 }}>LIVE · {m.clock}</span></div>}
                  {m.isCompleted && <div style={{ background: '#1a1a2e', padding: '4px 12px' }}><span style={{ fontSize: 10, fontWeight: 800, color: 'var(--gray)', letterSpacing: 1 }}>FULL TIME</span></div>}
                  <div style={{ padding: '14px 16px' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <img src={m.homeLogo} alt="" style={{ width: 34, height: 34, objectFit: 'contain' }} onError={(e: any) => e.target.style.display='none'} />
                        <span style={{ fontWeight: 800, fontSize: 15 }}>{m.homeTeamCode}</span>
                      </div>
                      <div style={{ textAlign: 'center', padding: '0 16px' }}>
                        {m.isLive || m.isCompleted
                          ? <span style={{ fontWeight: 900, fontSize: 24, color }}>{m.homeScore} - {m.awayScore}</span>
                          : <div><span style={{ fontSize: 14, color: 'var(--white)', fontWeight: 800 }}>{new Date(m.kickoffAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span><p style={{ fontSize: 9, color: 'var(--gray)', marginTop: 2 }}>vs</p></div>
                        }
                      </div>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span style={{ fontWeight: 800, fontSize: 15 }}>{m.awayTeamCode}</span>
                        <img src={m.awayLogo} alt="" style={{ width: 34, height: 34, objectFit: 'contain' }} onError={(e: any) => e.target.style.display='none'} />
                      </div>
                    </div>
                    <p style={{ fontSize: 10, color: 'var(--gray)', textAlign: 'center', marginTop: 10 }}>📍 {m.venue}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <p className="section-label">Explore</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { emoji: '👥', label: 'Find Fans', href: '/fans', color: '#e8003d' },
              { emoji: '🫂', label: 'Groups', href: '/groups', color: '#7b2fff' },
              { emoji: '🤖', label: 'AI Guide', href: '/ai', color: '#00c2a8' },
              { emoji: '💬', label: 'Messages', href: '/messages', color: '#ff5c1a' },
              { emoji: '🏅', label: 'Passport', href: '/passport', color: '#ffd700' },
              { emoji: '👤', label: 'Profile', href: '/profile', color: '#00e676' },
            ].map((item, i) => (
              <Link key={item.href} href={item.href} className="animate-slide-up" style={{
                background: 'var(--bg2)', borderRadius: 16, padding: '18px 8px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                border: '1px solid var(--border)', textDecoration: 'none',
                animationDelay: `${i * 50}ms`, transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: 28 }}>{item.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textAlign: 'center' }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
