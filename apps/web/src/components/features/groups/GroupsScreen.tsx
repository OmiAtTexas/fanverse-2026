'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { BottomNav } from '@/components/ui/BottomNav';
import { Search, Plus } from 'lucide-react';

const CITY_FILTERS = ['All', 'Dallas', 'Los Angeles', 'New York', 'Miami', 'Atlanta', 'Vancouver', 'Mexico City'];

export function GroupsScreen() {
  const { request } = useApi();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All');

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups', city],
    queryFn: () => request<any[]>(`/groups${city !== 'All' ? `?city=${city.toLowerCase().replace(' ', '-')}` : ''}`),
  });

  const filtered = groups?.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="font-bebas text-2xl tracking-wider">FAN GROUPS</h1>
          <button className="btn-primary p-2 rounded-xl">
            <Plus size={20} />
          </button>
        </div>
        <div className="relative mt-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups..."
            className="input-dark pl-9 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-2 pb-1">
          {CITY_FILTERS.map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                city === c ? 'bg-gold text-black' : 'bg-surface border border-border text-muted'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 py-4 space-y-3">
        {isLoading && [1,2,3].map(i => (
          <div key={i} className="card-dark p-4 h-24 animate-pulse bg-surface" />
        ))}
        {filtered?.map((group) => (
          <div key={group.id} className="card-dark-hover p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-surface-alt flex items-center justify-center text-2xl flex-shrink-0">
                {group.emoji || '⚽'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-tight">{group.name}</h3>
                <p className="text-xs text-muted mt-0.5 line-clamp-2">{group.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted">👥 {group._count?.members || group.memberCount} members</span>
                  <span className="text-xs text-muted">📍 {group.citySlug}</span>
                </div>
              </div>
              <button className="btn-primary text-xs px-3 py-1.5 rounded-lg flex-shrink-0">Join</button>
            </div>
          </div>
        ))}
        {filtered?.length === 0 && (
          <div className="text-center py-12 text-muted">
            <p className="text-4xl mb-2">🔍</p>
            <p>No groups found</p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
