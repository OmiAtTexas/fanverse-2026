'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import { BottomNav } from '@/components/ui/BottomNav';

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { headers: { 'x-user-id': user.id } })
      .then(r => r.json()).then(data => { if (data) setProfile(data); });
  }, [user]);

  return (
    <div className="page">
      <header className="app-header">
        <div className="app-header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="fifa-font" style={{ fontSize: 24, color: '#7b2fff' }}>PROFILE</h1>
          <button onClick={() => router.push('/profile/edit')} style={{ background: 'rgba(123,47,255,0.15)', border: '1px solid rgba(123,47,255,0.3)', color: '#7b2fff', borderRadius: 10, padding: '7px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Edit Profile
          </button>
        </div>
      </header>

      <main className="inner" style={{ paddingBottom: 100 }}>
        {/* Profile card */}
        <div style={{ background: 'linear-gradient(135deg, #7b2fff22, #e8003d22)', border: '1px solid #7b2fff33', borderRadius: 24, padding: 24, marginBottom: 20, textAlign: 'center' }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', border: '3px solid #7b2fff', margin: '0 auto 14px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)', fontSize: 36, fontWeight: 800, color: '#7b2fff' }}>
            {user?.imageUrl ? <img src={user.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user?.firstName?.[0] || '?'}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{user?.firstName} {user?.lastName}</h2>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
            {profile?.nationality && <span style={{ fontSize: 13, color: 'var(--text2)' }}>🌍 {profile.nationality}</span>}
            {profile?.supportedTeam && <span style={{ fontSize: 13, color: '#7b2fff', fontWeight: 700 }}>⚽ {profile.supportedTeam}</span>}
          </div>
          {profile?.bio && <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5 }}>{profile.bio}</p>}
        </div>

        {/* Interests */}
        {profile?.interests?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p className="section-label">Interests</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.interests.map((i: string) => <span key={i} className="pill active">{i}</span>)}
            </div>
          </div>
        )}

        {/* Cities */}
        {profile?.hostCities?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p className="section-label">Visiting</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.hostCities.map((c: string) => <span key={c} className="pill">📍 {c.replace(/_/g,' ').replace(/\b\w/g,(l:string)=>l.toUpperCase())}</span>)}
            </div>
          </div>
        )}

        {/* Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14 }}>{theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</p>
              <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Switch app theme</p>
            </div>
            <button onClick={toggle} style={{ width: 52, height: 28, borderRadius: 99, border: 'none', cursor: 'pointer', background: theme === 'dark' ? '#7b2fff' : 'var(--bg3)', position: 'relative', transition: 'background 0.3s' }}>
              <span style={{ position: 'absolute', top: 3, left: theme === 'dark' ? 26 : 3, width: 22, height: 22, borderRadius: '50%', background: 'white', transition: 'left 0.3s', display: 'block' }}/>
            </button>
          </div>

          <button onClick={() => signOut()} style={{ padding: '14px', borderRadius: 14, background: 'var(--bg3)', color: '#e8003d', fontWeight: 700, fontSize: 14, border: '1px solid rgba(232,0,61,0.2)', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
