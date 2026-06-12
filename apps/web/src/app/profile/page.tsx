'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';

const TEAMS = ['Brazil','Argentina','France','England','Germany','Spain','Portugal','Netherlands','Italy','Mexico','USA','Canada','Japan','South Korea','Morocco','Senegal','Australia','Belgium','Croatia','Uruguay'];
const COUNTRIES = ['USA','Brazil','Argentina','Mexico','England','France','Germany','Spain','Portugal','Italy','Netherlands','Japan','South Korea','Australia','Canada','Morocco','Senegal','India','Nigeria','Turkey','Poland','Colombia'];
const INTERESTS = ['Food & Drink','Nightlife','Culture','Photography','Tactics','Fan Zones','Stadium Tours','Budget Travel','Luxury Travel'];
const CITIES = ['dallas','new_york','los_angeles','miami','houston','atlanta','boston','philadelphia','kansas_city','seattle','san_francisco','mexico_city','guadalajara','monterrey','toronto','vancouver'];

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();
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

  const toggle = (arr: string[], val: string) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <header className="sticky top-0 bg-black/95 backdrop-blur border-b border-yellow-900/50 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-yellow-500 text-xl font-bold">←</button>
        <h1 className="text-xl font-black text-yellow-500 tracking-widest">EDIT PROFILE</h1>
      </header>

      <main className="px-4 py-5 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-700">
            {user?.imageUrl ? <img src={user.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-yellow-900 flex items-center justify-center text-3xl font-black text-yellow-500">{user?.firstName?.[0] || '?'}</div>}
          </div>
          <div>
            <p className="font-black text-lg">{user?.firstName} {user?.lastName}</p>
            <p className="text-gray-500 text-sm">{user?.emailAddresses[0]?.emailAddress}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest font-bold block mb-2">Your Country</label>
            <select value={form.nationality} onChange={e => setForm(f => ({...f, nationality: e.target.value}))} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-600">
              <option value="">Select country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest font-bold block mb-2">Team You Support</label>
            <select value={form.supportedTeam} onChange={e => setForm(f => ({...f, supportedTeam: e.target.value}))} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-600">
              <option value="">Select team</option>
              {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest font-bold block mb-2">Bio</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} placeholder="Tell other fans about yourself..." className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-600 h-24 resize-none" maxLength={150} />
            <p className="text-[10px] text-gray-600 mt-1">{form.bio.length}/150</p>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest font-bold block mb-2">Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button key={i} onClick={() => setForm(f => ({...f, interests: toggle(f.interests, i)}))} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.interests.includes(i) ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-gray-900 text-gray-400 border-gray-700'}`}>{i}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest font-bold block mb-2">Host Cities Visiting</label>
            <div className="grid grid-cols-2 gap-2">
              {CITIES.map(c => (
                <button key={c} onClick={() => setForm(f => ({...f, hostCities: toggle(f.hostCities, c)}))} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${form.hostCities.includes(c) ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-gray-900 text-gray-400 border-gray-700'}`}>
                  📍 {c.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={save} disabled={saving} className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl text-lg disabled:opacity-50 transition-all">
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Profile'}
        </button>
      </main>
      <BottomNav />
    </div>
  );
}
