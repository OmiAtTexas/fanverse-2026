'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { BottomNav } from '@/components/ui/BottomNav';

const CITIES = ['dallas','new_york','los_angeles','miami','houston','atlanta','boston','philadelphia','kansas_city','seattle','san_francisco','mexico_city','guadalajara','monterrey','toronto','vancouver'];

export default function GroupsPage() {
  const { userId } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', citySlug: '' });
  const [creating, setCreating] = useState(false);

  const load = () => {
    const url = search.length >= 2
      ? `${process.env.NEXT_PUBLIC_API_URL}/groups?search=${search}`
      : `${process.env.NEXT_PUBLIC_API_URL}/groups`;
    fetch(url).then(r => r.json()).then(data => { setGroups(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [search]);

  const create = async () => {
    if (!newGroup.name || !newGroup.citySlug) return;
    setCreating(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' },
      body: JSON.stringify(newGroup),
    });
    setShowCreate(false);
    setNewGroup({ name: '', description: '', citySlug: '' });
    setCreating(false);
    load();
  };

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
            <div>
              <h1 className="fifa-font" style={{ fontSize: 28, color: '#00e676' }}>FAN GROUPS</h1>
              <p style={{ fontSize: 9, color: 'var(--gray)', letterSpacing: 3, textTransform: 'uppercase' }}>Connect with fans in your city</p>
            </div>
            <button onClick={() => setShowCreate(true)} style={{ padding: '8px 14px', borderRadius: 10, background: '#00e676', color: '#000', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: 12 }}>+ Create</button>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search groups..." className="input" />
        </div>
      </header>

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderRadius: '24px 24px 0 0', padding: 24, width: '100%', maxWidth: 480, margin: '0 auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#00e676', marginBottom: 16 }}>Create Fan Group</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} placeholder="Group name e.g. Brazil Fans Dallas 🇧🇷" className="input" />
              <input value={newGroup.description} onChange={e => setNewGroup({...newGroup, description: e.target.value})} placeholder="What's this group about?" className="input" />
              <select value={newGroup.citySlug} onChange={e => setNewGroup({...newGroup, citySlug: e.target.value})} className="input" style={{ cursor: 'pointer' }}>
                <option value="">Select host city</option>
                {CITIES.map(c => <option key={c} value={c}>{c.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
              </select>
              <div className="flex gap-3" style={{ marginTop: 4 }}>
                <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--bg3)', color: 'var(--gray)', fontWeight: 700, border: '1px solid var(--border)', cursor: 'pointer' }}>Cancel</button>
                <button onClick={create} disabled={creating || !newGroup.name || !newGroup.citySlug} style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#00e676', color: '#000', fontWeight: 800, border: 'none', cursor: 'pointer', opacity: creating ? 0.6 : 1 }}>{creating ? 'Creating...' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>
        {loading && [1,2,3].map(i => <div key={i} className="card" style={{ height: 90, marginBottom: 10, opacity: 0.3 }}/>)}
        {!loading && groups.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>👥</p>
            <p style={{ color: 'var(--gray)', fontWeight: 600 }}>No groups yet</p>
            <p style={{ color: 'var(--gray2)', fontSize: 13, marginTop: 6 }}>Be the first to create one!</p>
            <button onClick={() => setShowCreate(true)} style={{ marginTop: 16, padding: '12px 24px', borderRadius: 12, background: '#00e676', color: '#000', fontWeight: 800, border: 'none', cursor: 'pointer' }}>Create First Group</button>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {groups.map(g => (
            <a key={g.id} href={`/groups/${g.id}`} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', borderLeft: '3px solid #00e676' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#00e67622', border: '1px solid #00e67644', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>⚽</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 800, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</p>
                <p style={{ fontSize: 12, color: 'var(--gray)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.description}</p>
                <div className="flex gap-3" style={{ marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: '#00e676' }}>👥 {g._count?.members || 0} members</span>
                  <span style={{ fontSize: 11, color: 'var(--gray)' }}>📍 {g.citySlug?.replace(/_/g,' ')}</span>
                </div>
              </div>
              <span style={{ color: 'var(--gray)', fontSize: 18 }}>›</span>
            </a>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
