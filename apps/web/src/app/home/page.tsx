'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/ui/BottomNav';

export default function HomePage() {
  const { user } = useUser();
  const [matches, setMatches] = useState<any[]>([]);
  const [synced, setSynced] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

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
      }).then(r => r.json()).then(data => { setSynced(true); setProfileData(data); });
    }
  }, [user, synced]);

  useEffect(() => {
    const load = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches`)
        .then(r => r.json())
        .then(data => setMatches(Array.isArray(data) ? data.slice(0, 3) : []));
    };
    load();
    const i = setInterval(load, 30000);
    return () => clearInterval(i);
  }, []);

  const liveMatches = matches.filter(m => m.isLive);
  const upcomingMatches = matches.filter(m => !m.isLive && !m.isCompleted);

  return (
    <div className="page">
      {/* Header */}
      <header style={{ padding: '16px 20px 0', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 3, fontWeight: 700, textTransform: 'uppercase' }}>FIFA World Cup 2026</p>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: 'white', lineHeight: 1.1, marginTop: 2 }}>FanVerse</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {liveMatches.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(232,0,61,0.15)', border: '1px solid rgba(232,0,61,0.3)', borderRadius: 99, padding: '5px 10px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e8003d', animation: 'pulse 1s infinite' }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: '#e8003d', letterSpacing: 1 }}>LIVE</span>
              </div>
            )}
            <Link href="/profile">
              {user?.imageUrl
                ? <img src={user.imageUrl} alt="" style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid rgba(232,0,61,0.5)', objectFit: 'cover' }} />
                : <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #e8003d, #7b2fff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16 }}>{user?.firstName?.[0] || '?'}</div>
              }
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 100px' }}>
        {/* Hero welcome */}
        <div style={{ borderRadius: 24, overflow: 'hidden', marginBottom: 24, position: 'relative', background: 'linear-gradient(135deg, #0d0020 0%, #1a0035 50%, #0a1a2e 100%)', border: '1px solid rgba(123,47,255,0.2)' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,0,61,0.2) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,47,255,0.2) 0%, transparent 70%)' }} />
          <div style={{ padding: '24px 20px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              {user?.imageUrl
                ? <img src={user.imageUrl} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(232,0,61,0.5)' }} />
                : <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #e8003d, #7b2fff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900 }}>{user?.firstName?.[0] || '?'}</div>
              }
              <div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{greeting},</p>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', lineHeight: 1 }}>{user?.firstName || 'Fan'} 👋</h2>
                {profileData?.supportedTeam && <p style={{ fontSize: 12, color: '#7b2fff', fontWeight: 700, marginTop: 3 }}>⚽ Supporting {profileData.supportedTeam}</p>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 4 }}>TOURNAMENT</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>🏆 FIFA WC 2026</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>June 11 — July 19</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 4 }}>HOST NATIONS</p>
                <p style={{ fontSize: 16, fontWeight: 800 }}>🇺🇸 🇨🇦 🇲🇽</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>USA · Canada · Mexico</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live matches */}
        {liveMatches.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e8003d', animation: 'pulse 1s infinite' }} />
                <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: '#e8003d' }}>LIVE NOW</p>
              </div>
              <Link href="/matches" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>All matches →</Link>
            </div>
            {liveMatches.map(m => (
              <div key={m.id} style={{ background: 'rgba(232,0,61,0.08)', border: '1px solid rgba(232,0,61,0.2)', borderRadius: 16, padding: '16px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <img src={m.homeLogo} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} onError={(e: any) => e.target.style.display='none'} />
                    <span style={{ fontWeight: 800, fontSize: 15 }}>{m.homeTeamCode}</span>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0 12px' }}>
                    <span style={{ fontWeight: 900, fontSize: 26, color: '#e8003d' }}>{m.homeScore} - {m.awayScore}</span>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{m.clock}'</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
                    <span style={{ fontWeight: 800, fontSize: 15 }}>{m.awayTeamCode}</span>
                    <img src={m.awayLogo} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} onError={(e: any) => e.target.style.display='none'} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upcoming matches */}
        {upcomingMatches.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,255,255,0.6)' }}>UPCOMING</p>
              <Link href="/matches" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>See all →</Link>
            </div>
            {upcomingMatches.map(m => (
              <div key={m.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '14px 16px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <img src={m.homeLogo} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} onError={(e: any) => e.target.style.display='none'} />
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{m.homeTeamCode}</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>{new Date(m.kickoffAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>vs</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{m.awayTeamCode}</span>
                    <img src={m.awayLogo} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} onError={(e: any) => e.target.style.display='none'} />
                  </div>
                </div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 8 }}>📍 {m.venue}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>EXPLORE</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { emoji: '👥', label: 'Find Fans', href: '/fans', color: '#e8003d', bg: 'rgba(232,0,61,0.1)' },
              { emoji: '🫂', label: 'Groups', href: '/groups', color: '#7b2fff', bg: 'rgba(123,47,255,0.1)' },
              { emoji: '🤖', label: 'AI Guide', href: '/ai', color: '#00c2a8', bg: 'rgba(0,194,168,0.1)' },
              { emoji: '💬', label: 'Messages', href: '/messages', color: '#ff5c1a', bg: 'rgba(255,92,26,0.1)' },
              { emoji: '🏅', label: 'Passport', href: '/passport', color: '#ffd700', bg: 'rgba(255,215,0,0.1)' },
              { emoji: '👤', label: 'Profile', href: '/profile', color: '#00e676', bg: 'rgba(0,230,118,0.1)' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{ background: item.bg, border: `1px solid ${item.color}22`, borderRadius: 18, padding: '18px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textDecoration: 'none', transition: 'all 0.2s' }}>
                <span style={{ fontSize: 28 }}>{item.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: item.color, textAlign: 'center' }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
