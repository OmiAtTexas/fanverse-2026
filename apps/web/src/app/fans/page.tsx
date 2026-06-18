'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';

export default function FansPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [followRequests, setFollowRequests] = useState<any[]>([]);
  const [tab, setTab] = useState<'discover' | 'requests'>('discover');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async (q?: string) => {
    setLoading(true);
    const url = q && q.length >= 2
      ? `${process.env.NEXT_PUBLIC_API_URL}/users/search?q=${q}`
      : `${process.env.NEXT_PUBLIC_API_URL}/users/suggestions`;
    const res = await fetch(url, { headers: { 'x-user-id': userId || '' } });
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const loadRequests = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/follow-requests`, { headers: { 'x-user-id': userId || '' } });
    const data = await res.json();
    setFollowRequests(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (userId) {
      load();
      loadRequests();
      const i = setInterval(loadRequests, 5000);
      return () => clearInterval(i);
    }
  }, [userId]);

  useEffect(() => {
    const t = setTimeout(() => { if (userId) load(search); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const sendRequest = async (targetId: string) => {
    setActionLoading(targetId);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${targetId}/follow-request`, { method: 'POST', headers: { 'x-user-id': userId || '' } });
    setUsers(u => u.map(x => x.id === targetId ? { ...x, followStatus: 'requested' } : x));
    setActionLoading(null);
  };

  const startChat = async (clerkId: string) => {
    setActionLoading(clerkId);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/dm/${clerkId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' },
      body: JSON.stringify({ content: '👋 Hey!' }),
    });
    const data = await res.json();
    setActionLoading(null);
    if (data.conversationId) router.push(`/messages/${data.conversationId}`);
    else router.push('/messages');
  };

  const acceptRequest = async (requestId: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/follow-requests/${requestId}/accept`, { method: 'POST', headers: { 'x-user-id': userId || '' } });
    loadRequests();
  };

  const declineRequest = async (requestId: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/follow-requests/${requestId}/decline`, { method: 'POST', headers: { 'x-user-id': userId || '' } });
    loadRequests();
  };

  const getBtn = (u: any) => {
    if (u.followStatus === 'following' && u.canChat) return { label: '💬 Message', action: () => startChat(u.clerkId), bg: '#00c2a8', color: '#000' };
    if (u.followStatus === 'following') return { label: '✓ Following', action: null, bg: 'var(--bg3)', color: 'var(--text2)' };
    if (u.followStatus === 'requested') return { label: '⏳ Requested', action: null, bg: 'var(--bg3)', color: 'var(--text2)' };
    return { label: '+ Follow', action: () => sendRequest(u.id), bg: '#7b2fff', color: 'white' };
  };

  return (
    <div className="page">
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="fifa-font" style={{ fontSize: 28, color: '#7b2fff' }}>FIND FANS</h1>
          <p style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 }}>Connect with fans worldwide</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: tab === 'discover' ? 10 : 0 }}>
            <button onClick={() => setTab('discover')} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: tab === 'discover' ? '#7b2fff' : 'var(--bg3)', color: tab === 'discover' ? 'white' : 'var(--text2)', transition: 'all 0.2s' }}>Discover</button>
            <button onClick={() => { setTab('requests'); loadRequests(); }} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: tab === 'requests' ? '#7b2fff' : 'var(--bg3)', color: tab === 'requests' ? 'white' : 'var(--text2)', transition: 'all 0.2s', position: 'relative' }}>
              Requests {followRequests.length > 0 && <span style={{ position: 'absolute', top: -6, right: -4, background: '#e8003d', color: 'white', fontSize: 9, fontWeight: 800, width: 16, height: 16, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{followRequests.length}</span>}
            </button>
          </div>
          {tab === 'discover' && <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, country, team..." className="input" />}
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>
        {tab === 'requests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {followRequests.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: 48, marginBottom: 12 }}>🔔</p>
                <p style={{ color: 'var(--text2)', fontWeight: 600 }}>No pending requests</p>
              </div>
            )}
            {followRequests.map((req: any) => (
              <div key={req.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div className="avatar" style={{ width: 50, height: 50, fontSize: 20, border: '2px solid #7b2fff' }}>
                    {req.from?.avatarUrl ? <img src={req.from.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : req.from?.displayName?.[0] || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800 }}>{req.from?.displayName}</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                      {req.from?.nationality && <span style={{ fontSize: 11, color: 'var(--text2)' }}>🌍 {req.from.nationality}</span>}
                      {req.from?.supportedTeam && <span style={{ fontSize: 11, color: '#7b2fff' }}>⚽ {req.from.supportedTeam}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => acceptRequest(req.id)} style={{ flex: 1, padding: '10px', borderRadius: 12, background: '#e8003d', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Accept</button>
                  <button onClick={() => declineRequest(req.id)} style={{ flex: 1, padding: '10px', borderRadius: 12, background: 'var(--bg3)', color: 'var(--text2)', fontWeight: 700, border: '1px solid var(--border)', cursor: 'pointer' }}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'discover' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!search && <p className="section-label">Suggested Fans</p>}
            {loading && [1,2,3,4].map(i => <div key={i} className="card" style={{ height: 80, opacity: 0.3 }}/>)}
            {!loading && users.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: 48, marginBottom: 12 }}>🔍</p>
                <p style={{ color: 'var(--text2)', fontWeight: 600 }}>No fans found</p>
              </div>
            )}
            {users.map(u => {
              const btn = getBtn(u);
              return (
                <div key={u.id} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => router.push(`/fans/${u.id}`)}>
                  <div className="avatar" style={{ width: 50, height: 50, fontSize: 20, border: '2px solid #7b2fff44' }}>
                    {u.avatarUrl ? <img src={u.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.displayName?.[0] || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 800, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.displayName || u.username}</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                      {u.nationality && <span style={{ fontSize: 11, color: 'var(--text2)' }}>🌍 {u.nationality}</span>}
                      {u.supportedTeam && <span style={{ fontSize: 11, color: '#7b2fff', fontWeight: 600 }}>⚽ {u.supportedTeam}</span>}
                    </div>
                    {u.bio && <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</p>}
                    <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{u._count?.followers || 0} followers</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); btn.action && btn.action(); }} disabled={!btn.action || actionLoading === u.id || actionLoading === u.clerkId} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 10, background: btn.bg, color: btn.color, fontWeight: 700, border: 'none', cursor: btn.action ? 'pointer' : 'default', fontSize: 12, opacity: actionLoading === u.id ? 0.6 : 1, transition: 'all 0.2s' }}>
                    {actionLoading === u.id || actionLoading === u.clerkId ? '...' : btn.label}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
