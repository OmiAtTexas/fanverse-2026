'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';

export default function GroupsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'city' | 'private'>('city');
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const url = search.length >= 2
      ? `${process.env.NEXT_PUBLIC_API_URL}/groups?search=${search}`
      : `${process.env.NEXT_PUBLIC_API_URL}/groups`;
    const res = await fetch(url, { headers: { 'x-user-id': userId || '' } });
    const data = await res.json();
    setGroups(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { if (userId) load(); }, [userId]);
  useEffect(() => { const t = setTimeout(() => { if (userId) load(); }, 400); return () => clearTimeout(t); }, [search]);

  const join = async (id: string) => {
    setBusyId(id);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${id}/join`, { method: 'POST', headers: { 'x-user-id': userId || '' } });
    setGroups(g => g.map(x => x.id === id ? { ...x, isMember: true, _count: { ...x._count, members: (x._count?.members || 0) + 1 } } : x));
    setBusyId(null);
  };

  const leave = async (id: string) => {
    setBusyId(id);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${id}/leave`, { method: 'POST', headers: { 'x-user-id': userId || '' } });
    setGroups(g => g.map(x => x.id === id ? { ...x, isMember: false, _count: { ...x._count, members: Math.max(0, (x._count?.members || 1) - 1) } } : x));
    setBusyId(null);
  };

  const hide = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/${id}/hide`, { method: 'POST', headers: { 'x-user-id': userId || '' } });
    setGroups(g => g.filter(x => x.id !== id));
  };

  const create = async () => {
    if (!newGroup.name) return;
    setCreating(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' },
      body: JSON.stringify({ ...newGroup, isPublic: false }),
    });
    setShowCreate(false);
    setNewGroup({ name: '', description: '' });
    setCreating(false);
    load();
  };

  const cityGroups = groups.filter(g => g.isOfficial);
  const privateGroups = groups.filter(g => !g.isOfficial);
  const displayed = tab === 'city' ? cityGroups : privateGroups;

  return (
    <div className="page">
      <header className="app-header">
        <div className="app-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <h1 className="fifa-font" style={{ fontSize: 28, color: '#00e676' }}>FAN GROUPS</h1>
              <p style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 3, textTransform: 'uppercase' }}>Connect with fans in your city</p>
            </div>
            <button onClick={() => setShowCreate(true)} style={{ padding: '8px 14px', borderRadius: 10, background: '#00e676', color: '#000', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: 12 }}>+ Create</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button onClick={() => setTab('city')} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: tab === 'city' ? '#00e676' : 'var(--bg3)', color: tab === 'city' ? '#000' : 'var(--text2)' }}>🌍 City Groups</button>
            <button onClick={() => setTab('private')} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: tab === 'private' ? '#00e676' : 'var(--bg3)', color: tab === 'private' ? '#000' : 'var(--text2)' }}>🔒 My Groups</button>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search groups..." className="input" />
        </div>
      </header>

      {/* Create group modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderRadius: '24px 24px 0 0', padding: 24, width: '100%', maxWidth: 480, margin: '0 auto' }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#00e676', marginBottom: 6 }}>Create Private Group</h2>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>Only people you both follow can be added. Group is private — invite only.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} placeholder="Group name e.g. Brazil Fans 🇧🇷" className="input" />
              <input value={newGroup.description} onChange={e => setNewGroup({...newGroup, description: e.target.value})} placeholder="What's this group about? (optional)" className="input" />
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--bg3)', color: 'var(--text2)', fontWeight: 700, border: '1px solid var(--border)', cursor: 'pointer' }}>Cancel</button>
                <button onClick={create} disabled={creating || !newGroup.name} style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#00e676', color: '#000', fontWeight: 800, border: 'none', cursor: 'pointer', opacity: creating ? 0.6 : 1 }}>{creating ? 'Creating...' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '16px', paddingBottom: 100 }}>
        {/* Community guidelines banner */}
        {tab === 'city' && (
          <div style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: '#00e676', fontWeight: 700, marginBottom: 3 }}>📋 Community Guidelines</p>
            <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>No racism, hate speech, or abusive language. 3 violations = 24hr ban.</p>
          </div>
        )}

        {loading && [1,2,3].map(i => <div key={i} className="card" style={{ height: 90, marginBottom: 10, opacity: 0.3 }}/>)}

        {!loading && displayed.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>{tab === 'city' ? '🌍' : '🔒'}</p>
            <p style={{ color: 'var(--text2)', fontWeight: 600 }}>{tab === 'city' ? 'No city groups found' : 'No private groups yet'}</p>
            {tab === 'private' && <button onClick={() => setShowCreate(true)} style={{ marginTop: 16, padding: '12px 24px', borderRadius: 12, background: '#00e676', color: '#000', fontWeight: 800, border: 'none', cursor: 'pointer' }}>Create First Group</button>}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {displayed.map(g => (
            <div key={g.id} className="card" style={{ padding: 16, borderLeft: `3px solid ${g.isOfficial ? '#00e676' : '#7b2fff'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => router.push(`/groups/${g.id}`)}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: g.isOfficial ? '#00e67622' : '#7b2fff22', border: `1px solid ${g.isOfficial ? '#00e67644' : '#7b2fff44'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {g.isOfficial ? '🏟️' : '🔒'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p style={{ fontWeight: 800, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</p>
                    {g.isOfficial && <span style={{ fontSize: 9, background: '#00e676', color: '#000', fontWeight: 800, padding: '2px 6px', borderRadius: 99, flexShrink: 0 }}>OFFICIAL</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.description}</p>
                  <p style={{ fontSize: 11, color: '#00e676', marginTop: 4 }}>👥 {g._count?.members || 0} members</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {g.isMember ? (
                  <button onClick={() => leave(g.id)} disabled={busyId === g.id} style={{ flex: 1, padding: '9px', borderRadius: 10, background: 'var(--bg3)', color: 'var(--text2)', fontWeight: 700, fontSize: 13, border: '1px solid var(--border)', cursor: 'pointer' }}>
                    {busyId === g.id ? '...' : '✓ Joined'}
                  </button>
                ) : (
                  <button onClick={() => join(g.id)} disabled={busyId === g.id} style={{ flex: 1, padding: '9px', borderRadius: 10, background: '#00e676', color: '#000', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
                    {busyId === g.id ? '...' : '+ Join'}
                  </button>
                )}
                <button onClick={() => router.push(`/groups/${g.id}`)} style={{ flex: 1, padding: '9px', borderRadius: 10, background: 'rgba(0,230,118,0.1)', color: '#00e676', fontWeight: 700, fontSize: 13, border: '1px solid rgba(0,230,118,0.2)', cursor: 'pointer' }}>
                  💬 Chat
                </button>
                {g.isOfficial && (
                  <button onClick={() => hide(g.id)} style={{ padding: '9px 12px', borderRadius: 10, background: 'var(--bg3)', color: 'var(--text3)', fontWeight: 700, fontSize: 11, border: '1px solid var(--border)', cursor: 'pointer' }}>
                    Hide
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
