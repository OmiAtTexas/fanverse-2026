'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { BottomNav } from '@/components/ui/BottomNav';

export default function GroupsPage() {
  const { userId } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', citySlug: '' });
  const [creating, setCreating] = useState(false);

  const cities = ['dallas','new_york','los_angeles','miami','houston','atlanta','boston','philadelphia','kansas_city','seattle','san_francisco','mexico_city','guadalajara','monterrey','toronto','vancouver'];

  const load = () => {
    const url = search.length >= 2
      ? `${process.env.NEXT_PUBLIC_API_URL}/groups?search=${search}`
      : `${process.env.NEXT_PUBLIC_API_URL}/groups`;
    fetch(url).then(r => r.json()).then(data => {
      setGroups(Array.isArray(data) ? data : []);
      setLoading(false);
    });
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
    <div className="min-h-screen bg-black text-white pb-20">
      <header className="sticky top-0 bg-black border-b border-yellow-900 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-yellow-500 tracking-widest uppercase">Fan Groups</h1>
            <p className="text-xs text-gray-500">Connect with fans in your city</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="bg-yellow-500 text-black font-bold px-3 py-1.5 rounded-xl text-xs">+ Create</button>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search groups..." className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-600" />
      </header>

      {showCreate && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-end">
          <div className="bg-gray-900 border-t border-gray-700 rounded-t-3xl p-6 w-full space-y-4">
            <h2 className="text-lg font-bold text-yellow-500">Create a Fan Group</h2>
            <input value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} placeholder="Group name e.g. Brazil Fans Dallas 🇧🇷" className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-600" />
            <input value={newGroup.description} onChange={e => setNewGroup({...newGroup, description: e.target.value})} placeholder="What's this group about?" className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-600" />
            <select value={newGroup.citySlug} onChange={e => setNewGroup({...newGroup, citySlug: e.target.value})} className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-600">
              <option value="">Select host city</option>
              {cities.map(c => <option key={c} value={c}>{c.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)} className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold">Cancel</button>
              <button onClick={create} disabled={creating || !newGroup.name || !newGroup.citySlug} className="flex-1 bg-yellow-500 text-black py-3 rounded-xl font-bold disabled:opacity-50">
                {creating ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="px-4 py-4 space-y-3">
        {loading && <p className="text-center text-gray-500 py-8 animate-pulse">Loading groups...</p>}
        {!loading && groups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-5xl mb-3">👥</p>
            <p className="text-gray-400 font-medium">No groups yet</p>
            <p className="text-gray-600 text-sm mt-1">Be the first to create a fan group!</p>
            <button onClick={() => setShowCreate(true)} className="mt-4 bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl">Create First Group</button>
          </div>
        )}
        {groups.map(g => (
          <a href={`/groups/${g.id}`} key={g.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-start gap-3 block hover:border-yellow-800 transition-all">
            <div className="w-12 h-12 rounded-xl bg-yellow-900/30 border border-yellow-900 flex items-center justify-center text-2xl flex-shrink-0">
              ⚽
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm">{g.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{g.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-gray-500">👥 {g._count?.members || 0} members</span>
                <span className="text-xs text-gray-500">📍 {g.citySlug?.replace(/_/g,' ')}</span>
              </div>
            </div>
            <span className="text-gray-600">›</span>
          </a>
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
