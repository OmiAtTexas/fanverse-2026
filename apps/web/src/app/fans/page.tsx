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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/follow-requests`, {
      headers: { 'x-user-id': userId || '' }
    });
    const data = await res.json();
    setFollowRequests(Array.isArray(data) ? data : []);
  };

  useEffect(() => { if (userId) { load(); loadRequests(); } }, [userId]);
  useEffect(() => {
    const t = setTimeout(() => { if (userId) load(search); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const sendRequest = async (userId_: string) => {
    setActionLoading(userId_);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId_}/follow-request`, {
      method: 'POST', headers: { 'x-user-id': userId || '' },
    });
    setUsers(u => u.map(x => x.id === userId_ ? { ...x, followStatus: 'requested' } : x));
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
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/follow-requests/${requestId}/accept`, {
      method: 'POST', headers: { 'x-user-id': userId || '' },
    });
    loadRequests();
  };

  const declineRequest = async (requestId: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/follow-requests/${requestId}/decline`, {
      method: 'POST', headers: { 'x-user-id': userId || '' },
    });
    loadRequests();
  };

  const getFollowButton = (u: any) => {
    if (u.followStatus === 'following' && u.followsMe) return { label: '💬 Message', action: () => startChat(u.clerkId), style: 'bg-yellow-500 text-black' };
    if (u.followStatus === 'following') return { label: '✓ Following', action: null, style: 'bg-gray-700 text-gray-300' };
    if (u.followStatus === 'requested') return { label: '⏳ Requested', action: null, style: 'bg-gray-700 text-gray-400' };
    return { label: '+ Follow', action: () => sendRequest(u.id), style: 'bg-yellow-500 text-black' };
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <header className="sticky top-0 bg-black/95 backdrop-blur border-b border-yellow-900/50 px-4 py-3">
        <h1 className="text-2xl font-black text-yellow-500 tracking-widest uppercase">Find Fans</h1>
        <div className="flex gap-2 mt-2">
          <button onClick={() => setTab('discover')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${tab === 'discover' ? 'bg-yellow-500 text-black' : 'bg-gray-900 text-gray-400'}`}>
            Discover
          </button>
          <button onClick={() => { setTab('requests'); loadRequests(); }} className={`flex-1 py-2 rounded-xl text-xs font-bold relative ${tab === 'requests' ? 'bg-yellow-500 text-black' : 'bg-gray-900 text-gray-400'}`}>
            Requests
            {followRequests.length > 0 && <span className="absolute -top-1.5 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{followRequests.length}</span>}
          </button>
        </div>
        {tab === 'discover' && (
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, country, team..." className="w-full mt-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-600" />
        )}
      </header>

      <main className="px-4 py-4 space-y-3">
        {tab === 'requests' && (
          <>
            {followRequests.length === 0 && (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">🔔</p>
                <p className="text-gray-400 font-medium">No pending requests</p>
                <p className="text-gray-600 text-sm mt-1">When someone follows you, they'll appear here</p>
              </div>
            )}
            {followRequests.map((req: any) => (
              <div key={req.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-full bg-yellow-900/30 border border-yellow-900/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {req.from?.avatarUrl
                      ? <img src={req.from.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : <span className="text-yellow-500 font-bold text-xl">{req.from?.displayName?.[0] || '?'}</span>
                    }
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{req.from?.displayName}</p>
                    <div className="flex gap-2 mt-0.5 flex-wrap">
                      {req.from?.nationality && <span className="text-xs text-gray-400">🌍 {req.from.nationality}</span>}
                      {req.from?.supportedTeam && <span className="text-xs text-yellow-600">⚽ {req.from.supportedTeam}</span>}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Wants to follow you</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => acceptRequest(req.id)} className="flex-1 bg-yellow-500 text-black font-bold py-2.5 rounded-xl text-sm">Accept</button>
                  <button onClick={() => declineRequest(req.id)} className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 font-bold py-2.5 rounded-xl text-sm">Decline</button>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'discover' && (
          <>
            {!search && <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Suggested Fans</p>}
            {loading && <p className="text-center text-gray-500 py-8 animate-pulse">Finding fans...</p>}
            {!loading && users.length === 0 && (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">🔍</p>
                <p className="text-gray-400 font-medium">No fans found</p>
                <p className="text-gray-600 text-sm mt-1">Try a different search term</p>
              </div>
            )}
            {users.map(u => {
              const btn = getFollowButton(u);
              return (
                <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-yellow-900/30 border border-yellow-900/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {u.avatarUrl
                      ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : <span className="text-yellow-500 font-bold text-xl">{u.displayName?.[0] || '?'}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{u.displayName || u.username}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {u.nationality && <span className="text-xs text-gray-400">🌍 {u.nationality}</span>}
                      {u.supportedTeam && <span className="text-xs text-yellow-600 font-medium">⚽ {u.supportedTeam}</span>}
                    </div>
                    {u.bio && <p className="text-xs text-gray-500 mt-1 truncate">{u.bio}</p>}
                    <p className="text-[10px] text-gray-600 mt-1">{u._count?.followers || 0} followers</p>
                  </div>
                  <button
                    onClick={btn.action || undefined}
                    disabled={!btn.action || actionLoading === u.id || actionLoading === u.clerkId}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60 ${btn.style}`}
                  >
                    {actionLoading === u.id || actionLoading === u.clerkId ? '...' : btn.label}
                  </button>
                </div>
              );
            })}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
