'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';

const TEAMS = ['Brazil','Argentina','France','England','Germany','Spain','Portugal','Netherlands','Italy','Mexico','USA','Canada','Japan','South Korea','Morocco','Senegal','Australia','Belgium','Croatia','Uruguay','Ecuador','Cameroon','Ghana','Serbia','Switzerland','Poland','Denmark','Tunisia','Costa Rica'];
const COUNTRIES = ['USA','Brazil','Argentina','Mexico','England','France','Germany','Spain','Portugal','Italy','Netherlands','Japan','South Korea','Australia','Canada','Morocco','Senegal','India','China','Nigeria','South Africa','Saudi Arabia','UAE','Turkey','Poland','Colombia','Chile','Ecuador','Peru','Bolivia','Pakistan','Bangladesh','Indonesia','Philippines','Vietnam','Thailand'];
const INTERESTS = ['Food & Drink','Nightlife','Culture','Photography','Tactics','Fan Zones','Stadium Tours','Local Transport','Budget Travel','Luxury Travel','History','Music','Art','Sports Betting','Fantasy Football'];
const CITIES = ['Dallas','New York/New Jersey','Los Angeles','Miami','Atlanta','Houston','Seattle','San Francisco Bay Area','Boston','Philadelphia','Kansas City','Mexico City','Guadalajara','Monterrey','Vancouver','Toronto'];

export default function EditProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const [form, setForm] = useState({ displayName: '', nationality: '', supportedTeam: '', bio: '', interests: [] as string[], hostCities: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { headers: { 'x-user-id': user.id } })
      .then(r => r.json()).then(data => {
        if (data) setForm({
          displayName: data.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          nationality: data.nationality || '',
          supportedTeam: data.supportedTeam || '',
          bio: data.bio || '',
          interests: data.interests || [],
          hostCities: data.hostCities || [],
        });
      });
  }, [user]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    if (photoFile) {
      await user?.setProfileImage({ file: photoFile });
    }
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push('/profile'); }, 1500);
  };

  const toggle = (arr: string[], val: string) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  return (
    <div className="page">
      <header className="app-header">
        <div className="app-header-inner" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#7b2fff', padding: 0 }}>←</button>
          <h1 className="fifa-font" style={{ fontSize: 24, color: '#7b2fff' }}>EDIT PROFILE</h1>
        </div>
      </header>

      <main className="inner" style={{ paddingBottom: 100 }}>
        {/* Photo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div onClick={() => fileRef.current?.click()} style={{ width: 90, height: 90, borderRadius: '50%', border: '3px solid #7b2fff', overflow: 'hidden', cursor: 'pointer', position: 'relative', marginBottom: 10 }}>
            <img src={photo || user?.imageUrl || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20 }}>📷</span>
            </div>
          </div>
          <button onClick={() => fileRef.current?.click()} style={{ background: 'none', border: '1px solid rgba(123,47,255,0.3)', color: '#7b2fff', padding: '6px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Change Photo</button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p className="section-label">Display Name</p>
            <input value={form.displayName} onChange={e => setForm(f => ({...f, displayName: e.target.value}))} className="input" placeholder="Your name" />
          </div>
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
                <button key={i} onClick={() => setForm(f => ({...f, interests: toggle(f.interests, i)}))} className={`pill ${form.interests.includes(i) ? 'active' : ''}`}>{i}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="section-label">Host Cities Visiting</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {CITIES.map(c => (
                <button key={c} onClick={() => setForm(f => ({...f, hostCities: toggle(f.hostCities, c)}))} style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${form.hostCities.includes(c) ? '#7b2fff' : 'var(--border)'}`, background: form.hostCities.includes(c) ? '#7b2fff' : 'var(--bg3)', color: form.hostCities.includes(c) ? 'white' : 'var(--text2)', fontWeight: 600, fontSize: 12, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                  📍 {c}
                </button>
              ))}
            </div>
          </div>

          <button onClick={save} disabled={saving} style={{ padding: '14px', borderRadius: 14, background: saved ? '#00e676' : '#7b2fff', color: 'white', fontWeight: 800, fontSize: 16, border: 'none', cursor: 'pointer', transition: 'all 0.3s', opacity: saving ? 0.7 : 1, marginTop: 8 }}>
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
