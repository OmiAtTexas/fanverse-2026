'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { BottomNav } from '@/components/ui/BottomNav';
import { useRouter } from 'next/navigation';

export default function FanProfilePage({ params }: { params: { id: string } }) {
  const { userId } = useAuth();
  const router = useRouter();
  const [fan, setFan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${params.id}`, {
      headers: { 'x-user-id': userId },
    })
      .then(r => r.json())
      .then(data => { setFan(data); setLoading(false); });
  }, [params.id, userId]);

  const sendRequest = async () => {
    setActionLoading(true);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${params.id}/follow-request`, {
      method: 'POST', headers: { 'x-user-id': userId || '' },
    });
    setFan((f: any) => ({ ...f, followStatus: 'requested' }));
    setActionLoading(false);
  };

  const startChat = async () => {
    setActionLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/dm/${fan.clerkId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId || '' },
      body: JSON.stringify({ content: '👋 Hey!' }),
    });
    const data = await res.json();
    setActionLoading(false);
    if (data.conversationId) router.push(`/messages/${data.conversationId}`);
    else router.push('/messages');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text2)' }}>Loading...</p>
    </div>
  );

  if (!fan) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text2)' }}>Fan not found</p>
    </div>
  );

  return (
    <div className="page">
      <header className="app-header">
        <div className="app-header-inner" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#7b2fff', padding: 0 }}>←</button>
          <h1 className="fifa-font" style={{ fontSize: 22, color: '#7b2fff' }}>PROFILE</h1>
        </div>
      </header>

      <main className="inner">
        {/* Profile header */}
        <div style={{ background: 'linear-gradient(135deg, #7b2fff22, #e8003d22)', border: '1px solid #7b2fff33', borderRadius: 24, padding: 24, marginBottom: 20, textAlign: 'center' }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', border: '3px solid #7b2fff', margin: '0 auto 14px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)', fontSize: 36, fontWeight: 800, color: '#7b2fff' }}>
            {fan.avatarUrl ? <img src={fan.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : fan.displayName?.[0] || '?'}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>{fan.displayName || fan.username}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            {fan.nationality && <span style={{ fontSize: 13, color: 'var(--text2)' }}>🌍 {fan.nationality}</span>}
            {fan.supportedTeam && <span style={{ fontSize: 13, color: '#7b2fff', fontWeight: 700 }}>⚽ {fan.supportedTeam}</span>}
          </div>
          {fan.bio && <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 12 }}>{fan.bio}</p>}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 20, fontWeight: 900 }}>{fan._count?.followers || 0}</p>
              <p style={{ fontSize: 11, color: 'var(--text3)' }}>Followers</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 20, fontWeight: 900 }}>{fan._count?.following || 0}</p>
              <p style={{ fontSize: 11, color: 'var(--text3)' }}>Following</p>
            </div>
          </div>

          {fan.clerkId !== userId && (
            <div style={{ display: 'flex', gap: 10 }}>
              {fan.canChat ? (
                <button onClick={startChat} disabled={actionLoading} style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#00c2a8', color: '#000', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: 14 }}>
                  💬 Message
                </button>
              ) : fan.followStatus === 'following' ? (
                <button disabled style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--bg3)', color: 'var(--text2)', fontWeight: 700, border: '1px solid var(--border)', fontSize: 14 }}>
                  ✓ Following
                </button>
              ) : fan.followStatus === 'requested' ? (
                <button disabled style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--bg3)', color: 'var(--text2)', fontWeight: 700, border: '1px solid var(--border)', fontSize: 14 }}>
                  ⏳ Requested
                </button>
              ) : (
                <button onClick={sendRequest} disabled={actionLoading} style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#7b2fff', color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: 14 }}>
                  {actionLoading ? '...' : '+ Follow'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Interests */}
        {fan.interests?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p className="section-label">Interests</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {fan.interests.map((i: string) => (
                <span key={i} className="pill active">{i}</span>
              ))}
            </div>
          </div>
        )}

        {/* Host cities */}
        {fan.hostCities?.length > 0 && (
          <div>
            <p className="section-label">Visiting</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {fan.hostCities.map((c: string) => (
                <span key={c} className="pill">📍 {c.replace(/_/g,' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
