'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import { BottomNav } from '@/components/ui/BottomNav';

const TEAMS = ['Brazil','Argentina','France','England','Germany','Spain','Portugal','Netherlands','Italy','Mexico','USA','Canada','Japan','South Korea','Morocco','Senegal','Australia','Belgium','Croatia','Uruguay','Colombia','Ecuador','Peru','Saudi Arabia','Tunisia','Uzbekistan','Paraguay','Bosnia-Herzegovina','South Africa','Czechia','Sweden','Austria','Jordan','Chile','Albania','New Zealand','Honduras','Malaysia','Cuba','Panama','Jamaica'];
const COUNTRIES = ['USA','Brazil','Argentina','Mexico','England','France','Germany','Spain','Portugal','Italy','Netherlands','Japan','South Korea','Australia','Canada','Morocco','Senegal','India','Nigeria','Turkey','Poland','Colombia','Saudi Arabia','UAE','Pakistan','Bangladesh','Indonesia','Philippines','Vietnam','Thailand'];
const INTERESTS = ['Food & Drink','Nightlife','Culture','Photography','Tactics','Fan Zones','Stadium Tours','Budget Travel','Luxury Travel','Local Transport','History','Music'];
const CITIES = ['dallas','new_york','los_angeles','miami','houston','atlanta','boston','philadelphia','kansas_city','seattle','san_francisco','mexico_city','guadalajara','monterrey','toronto','vancouver'];

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [form, setForm] = useState({ nationality: '', supportedTeam: '', bio: '', interests: [] as string[], hostCities: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { headers: { 'x-user-id': user.id } })
      .then(r => r.json()).then(data => {
        if (data) setForm({ nationality: data.nationality || '', supportedTeam: data.supportedTeam || '', bio: data.bio || '', interests: data.interests || [], hostCities: data.hostCities || [] });
      });
  }, [user]);

  const save = async () => {
    setSaving(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle2 = (arr: string[], val: string) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  return (
    <div className="page">
      <header className="app-header">
        <div className="app-header-inner flex items-center gap-3">
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--red)', padding: '0 4px' }}>←</button>
          <h1 className="fifa-font" style={{ fontSize: 24, color: 'var(--red)' }}>PROFILE</h1>
        </div>
      </header>

      <main className="inner" style={{ paddingBottom: 100 }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '20px', background: 'var(--bg2)', borderRadius: 20, border: '1px solid var(--border)' }}>
          <div className="avatar" style={{ width: 72, height: 72, fontSize: 28, border: '3px solid var(--red)' }}>
            {user?.imageUrl ? <img src={user.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user?.firstName?.[0] || '?'}
          </div>
          <div>
            <p style={{ fontWeight: 900, fontSize: 18 }}>{user?.firstName} {user?.lastName}</p>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>{user?.emailAddresses[0]?.emailAddress}</p>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14 }}>{theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}</p>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Switch app theme</p>
          </div>
          <button onClick={toggle} style={{
            width: 52, height: 28, borderRadius: 99, border: 'none', cursor: 'pointer',
            background: theme === 'dark' ? 'var(--red)' : 'var(--bg3)',
            position: 'relative', transition: 'background 0.3s',
          }}>
            <span style={{
              position: 'absolute', top: 3, left: theme === 'dark' ? 26 : 3,
              width: 22, height: 22, borderRadius: '50%',
              background: 'white', transition: 'left 0.3s', display: 'block',
            }}/>
          </button>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p className="section-label">Your Country</p>
            <select value={form.nationality} onChange={e => setForm(f => ({...f, nationality: e.target.value}))} className="input">
              <option value="">Select country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <p className="section-label">Team You Support</p>
            <select value={form.supportedTeam} onChange={e => setForm(f => ({...f, supportedTeam: e.target.value}))} className="input">
              <option value="">Select team</option>
              {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <p className="section-label">Bio</p>
            <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} placeholder="Tell other fans about yourself..." className="input" style={{ height: 88, resize: 'none' }} maxLength={150} />
            <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4, textAlign: 'right' }}>{form.bio.length}/150</p>
          </div>
          <div>
            <p className="section-label">Interests</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {INTERESTS.map(i => (
                <button key={i} onClick={() => setForm(f => ({...f, interests: toggle2(f.interests, i)}))} className={`pill ${form.interests.includes(i) ? 'active' : ''}`}>{i}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="section-label">Host Cities Visiting</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {CITIES.map(c => (
                <button key={c} onClick={() => setForm(f => ({...f, hostCities: toggle2(f.hostCities, c)}))} style={{
                  padding: '10px 12px', borderRadius: 12, border: `1px solid ${form.hostCities.includes(c) ? 'var(--red)' : 'var(--border)'}`,
                  background: form.hostCities.includes(c) ? 'var(--red)' : 'var(--bg3)',
                  color: form.hostCities.includes(c) ? 'white' : 'var(--text2)',
                  fontWeight: 600, fontSize: 12, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  📍 {c.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          <button onClick={save} disabled={saving} style={{ padding: '14px', borderRadius: 14, background: saved ? '#00e676' : 'var(--red)', color: 'white', fontWeight: 800, fontSize: 16, border: 'none', cursor: 'pointer', transition: 'all 0.3s', opacity: saving ? 0.7 : 1 }}>
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Profile'}
          </button>

          <button onClick={() => signOut()} style={{ padding: '14px', borderRadius: 14, background: 'var(--bg3)', color: 'var(--text2)', fontWeight: 700, fontSize: 14, border: '1px solid var(--border)', cursor: 'pointer', marginTop: 4 }}>
            Sign Out
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
