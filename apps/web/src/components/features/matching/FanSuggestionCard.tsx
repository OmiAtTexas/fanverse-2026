'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';

interface Fan {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  nationality?: string;
  supportedTeam?: string;
  matchScore?: number;
  icebreaker?: string;
}

export function FanSuggestionCard({ fan }: { fan: Fan }) {
  const { request } = useApi();
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);

  const connectMutation = useMutation({
    mutationFn: () => request(`/matching/connect/${fan.id}`, { method: 'POST' }),
    onSuccess: () => {
      setConnected(true);
      toast.success(`Connection request sent to ${fan.firstName}!`);
      queryClient.invalidateQueries({ queryKey: ['matching', 'suggestions'] });
    },
  });

  return (
    <div className="card-dark flex-shrink-0 w-40 p-3 flex flex-col items-center text-center gap-2">
      {fan.avatarUrl ? (
        <img src={fan.avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-gold/30" />
      ) : (
        <div className="w-14 h-14 rounded-full bg-surface-alt flex items-center justify-center text-gold font-bebas text-xl border-2 border-gold/30">
          {getInitials(fan.firstName, fan.lastName)}
        </div>
      )}
      <div>
        <p className="font-medium text-sm leading-tight">{fan.firstName}</p>
        <p className="text-xs text-muted">{fan.nationality}</p>
      </div>
      {fan.matchScore && (
        <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-medium">
          {Math.round(fan.matchScore * 100)}% match
        </span>
      )}
      <button
        onClick={() => connectMutation.mutate()}
        disabled={connected || connectMutation.isPending}
        className="w-full btn-primary text-xs py-1.5 rounded-lg disabled:opacity-50"
      >
        {connected ? '✓ Sent' : 'Connect'}
      </button>
    </div>
  );
}
