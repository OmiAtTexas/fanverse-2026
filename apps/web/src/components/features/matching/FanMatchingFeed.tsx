'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, UserPlus, X, Zap, Globe, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useApi } from '@/lib/api';
import { getInitials } from '@/lib/utils';

interface Fan {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  nationality?: string;
  supportedTeam?: string;
  languages?: string[];
  interests?: string[];
  matchScore?: number;
  icebreaker?: string;
  reasons?: string[];
}

export function FanMatchingFeed() {
  const { request } = useApi();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: fans = [], isLoading } = useQuery({
    queryKey: ['matching', 'suggestions'],
    queryFn: () => request<Fan[]>('/matching/suggestions?limit=20'),
  });

  const connectMutation = useMutation({
    mutationFn: (fanId: string) =>
      request(`/matching/connect/${fanId}`, { method: 'POST' }),
    onSuccess: (_, fanId) => {
      const fan = fans[currentIndex];
      toast.success(`Connection request sent to ${fan?.firstName}!`);
      setCurrentIndex((i) => i + 1);
      queryClient.invalidateQueries({ queryKey: ['matching'] });
    },
  });

  const skipFan = () => setCurrentIndex((i) => i + 1);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted text-sm">Finding fans near you...</div>
      </div>
    );
  }

  const fan = fans[currentIndex];

  if (!fan) {
    return (
      <div className="card-dark p-8 text-center">
        <p className="text-4xl mb-3">🎉</p>
        <p className="font-semibold">You've seen everyone!</p>
        <p className="text-sm text-muted mt-1">Check back later for new fans</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card-dark p-5">
        {/* Fan header */}
        <div className="flex items-start gap-4">
          {fan.avatarUrl ? (
            <img
              src={fan.avatarUrl}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover border-2 border-gold/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-surface-alt flex items-center justify-center text-gold font-bebas text-2xl border-2 border-gold/30">
              {getInitials(fan.firstName, fan.lastName)}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {fan.firstName} {fan.lastName}
              </h3>
              {fan.matchScore && (
                <span className="badge-gold">
                  {Math.round(fan.matchScore * 100)}% match
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted">
              {fan.nationality && (
                <span className="flex items-center gap-1">
                  <Globe size={12} /> {fan.nationality}
                </span>
              )}
              {fan.supportedTeam && (
                <span className="flex items-center gap-1">
                  ⚽ {fan.supportedTeam}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Icebreaker */}
        {fan.icebreaker && (
          <div className="mt-4 bg-gold/5 border border-gold/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-gold" />
              <span className="text-xs text-gold font-medium">Icebreaker</span>
            </div>
            <p className="text-sm text-foreground">{fan.icebreaker}</p>
          </div>
        )}

        {/* Reasons */}
        {fan.reasons && fan.reasons.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {fan.reasons.map((r, i) => (
              <span key={i} className="text-xs bg-surface-alt border border-border rounded-full px-3 py-1 text-muted">
                {r}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={skipFan}
            className="flex-1 btn-secondary py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <X size={18} />
            Skip
          </button>
          <button
            onClick={() => connectMutation.mutate(fan.id)}
            disabled={connectMutation.isPending}
            className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus size={18} />
            Connect
          </button>
        </div>
      </div>

      {/* Progress */}
      <p className="text-center text-xs text-muted">
        {currentIndex + 1} of {fans.length} fans
      </p>
    </div>
  );
}