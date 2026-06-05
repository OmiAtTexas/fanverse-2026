'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, UserPlus, X, Zap, Globe, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api/client';
import { cn } from '@/lib/utils';

// ============================================================
// FANVERSE 2026 — FAN MATCHING COMPONENT
// Tinder-style fan discovery with AI match scores
// Mobile-first, thumb-friendly design
// ============================================================

interface FanMatch {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    nationality: string;
    countryFlag: string;
    supportedTeam: string;
    ageRange: string;
    languages: string[];
    interests: string[];
    hostCities: string[];
    isVerified: boolean;
  };
  score: number;
  reasons: Array<{ type: string; label: string; weight: number }>;
  icebreaker: string;
  sharedMatches: string[];
  sharedInterests: string[];
}

interface FanCardProps {
  match: FanMatch;
  onConnect: (userId: string) => void;
  onSkip: (userId: string) => void;
  isLoading: boolean;
}

// Country flag emoji helper
function getTeamEmoji(teamCode: string): string {
  const map: Record<string, string> = {
    BRA: '🇧🇷', ARG: '🇦🇷', FRA: '🇫🇷', GER: '🇩🇪',
    ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', ESP: '🇪🇸', POR: '🇵🇹', ITA: '🇮🇹',
    NED: '🇳🇱', BEL: '🇧🇪', USA: '🇺🇸', MEX: '🇲🇽',
    JPN: '🇯🇵', KOR: '🇰🇷', SEN: '🇸🇳', MAR: '🇲🇦',
    URU: '🇺🇾', COL: '🇨🇴', CHI: '🇨🇱', ECU: '🇪🇨',
  };
  return map[teamCode] ?? '⚽';
}

const INTEREST_EMOJIS: Record<string, string> = {
  food: '🍕', nightlife: '🎉', photography: '📸',
  tactics: '📋', art: '🎨', music: '🎵', shopping: '🛍️',
  history: '🏛️', nature: '🌿', street_food: '🌮', beer: '🍺',
};

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = score > 0.7 ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
    : score > 0.4 ? 'text-amber-400 bg-amber-400/10 border-amber-400/30'
    : 'text-gray-400 bg-gray-400/10 border-gray-400/30';

  return (
    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border', color)}>
      {pct}% match
    </span>
  );
}

function FanCard({ match, onConnect, onSkip, isLoading }: FanCardProps) {
  const { user } = match;
  const [showIcebreaker, setShowIcebreaker] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#222222] border border-[rgba(201,162,39,0.2)] rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-full bg-[rgba(201,162,39,0.1)] border-2 border-[rgba(201,162,39,0.3)] flex items-center justify-center text-2xl">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
            ) : (
              user.countryFlag || '⚽'
            )}
          </div>
          {user.isVerified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#C9A227] rounded-full flex items-center justify-center text-[10px]">
              ✓
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-[#F5F0E8] text-[15px] truncate">{user.displayName}</h3>
            <ScoreBadge score={match.score} />
          </div>
          <p className="text-xs text-[#888888] mb-2">
            @{user.username} · {user.nationality} · {user.ageRange}
          </p>

          {/* Team + languages */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-[rgba(201,162,39,0.1)] text-[#C9A227] px-2 py-0.5 rounded-full border border-[rgba(201,162,39,0.2)]">
              {getTeamEmoji(user.supportedTeam)} {user.supportedTeam}
            </span>
            {user.languages.slice(0, 2).map(lang => (
              <span key={lang} className="text-xs bg-[rgba(255,255,255,0.05)] text-[#888888] px-2 py-0.5 rounded-full">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Match Reasons */}
      {match.reasons.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {match.reasons.map((reason, i) => (
              <span
                key={i}
                className="text-[11px] bg-[rgba(0,99,65,0.15)] text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full"
              >
                ✓ {reason.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Shared interests */}
      {match.sharedInterests.length > 0 && (
        <div className="px-4 pb-3 flex items-center gap-1.5">
          <span className="text-xs text-[#888888]">Both into:</span>
          {match.sharedInterests.slice(0, 4).map(interest => (
            <span key={interest} className="text-base" title={interest}>
              {INTEREST_EMOJIS[interest] ?? '⭐'}
            </span>
          ))}
        </div>
      )}

      {/* Cities */}
      {user.hostCities.length > 0 && (
        <div className="px-4 pb-3 flex items-center gap-1.5">
          <MapPin size={12} className="text-[#888888]" />
          <span className="text-xs text-[#888888]">
            {user.hostCities.slice(0, 3).map(c => c.replace('_', ' ')).join(' · ')}
          </span>
        </div>
      )}

      {/* AI Icebreaker */}
      {match.icebreaker && (
        <div className="mx-4 mb-3">
          <button
            onClick={() => setShowIcebreaker(!showIcebreaker)}
            className="w-full text-left text-xs text-[#C9A227] flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <Zap size={12} />
            {showIcebreaker ? 'Hide' : 'See'} conversation starter
          </button>
          <AnimatePresence>
            {showIcebreaker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="mt-2 text-xs text-[#F5F0E8] bg-[rgba(201,162,39,0.08)] border border-[rgba(201,162,39,0.2)] rounded-xl p-3 leading-relaxed italic">
                  "{match.icebreaker}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={() => onSkip(user.id)}
          disabled={isLoading}
          className="flex-1 py-3.5 flex items-center justify-center gap-2 text-[#888888] hover:text-[#F5F0E8] hover:bg-[rgba(255,255,255,0.04)] transition-all active:scale-95 text-sm"
        >
          <X size={16} />
          <span>Skip</span>
        </button>
        <div className="w-px bg-[rgba(255,255,255,0.06)]" />
        <button
          onClick={() => onConnect(user.id)}
          disabled={isLoading}
          className="flex-1 py-3.5 flex items-center justify-center gap-2 text-[#C9A227] hover:bg-[rgba(201,162,39,0.08)] transition-all active:scale-95 text-sm font-semibold"
        >
          <UserPlus size={16} />
          <span>Connect</span>
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

interface FanMatchingFeedProps {
  cityFilter?: string;
}

export function FanMatchingFeed({ cityFilter }: FanMatchingFeedProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ['fan-matches', cityFilter],
    queryFn: () => api.get<FanMatch[]>('/matching/fans', { params: { city: cityFilter } }),
    staleTime: 5 * 60 * 1000,
  });

  const connectMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      api.post('/matching/connect', { targetUserId }),
    onSuccess: (_, targetUserId) => {
      toast({
        title: '🤝 Connection sent!',
        description: 'They\'ll get notified. Chat when they accept.',
      });
      setSkippedIds(prev => new Set([...prev, targetUserId]));
    },
    onError: () => {
      toast({
        title: 'Something went wrong',
        description: 'Try again in a moment.',
        variant: 'destructive',
      });
    },
  });

  const handleSkip = (userId: string) => {
    setSkippedIds(prev => new Set([...prev, userId]));
  };

  const visibleMatches = (data ?? []).filter(m => !skippedIds.has(m.user.id));

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 skeleton rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-[#888888]">
        <Globe size={32} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">Couldn't load fan matches right now.</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['fan-matches'] })}
          className="mt-3 text-[#C9A227] text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  if (visibleMatches.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="font-semibold text-[#F5F0E8] mb-1">You've seen everyone!</h3>
        <p className="text-sm text-[#888888]">
          Check back tomorrow — new fans arrive daily.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 pb-nav">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-[#888888]">
          {visibleMatches.length} fans found near you
        </p>
        <span className="badge-gold">AI matched</span>
      </div>

      <AnimatePresence mode="popLayout">
        {visibleMatches.map(match => (
          <FanCard
            key={match.user.id}
            match={match}
            onConnect={(userId) => connectMutation.mutate(userId)}
            onSkip={handleSkip}
            isLoading={connectMutation.isPending}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
