'use client';

import { formatMatchTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamCode: string;
  awayTeamCode: string;
  kickoffAt: string;
  venue: string;
  cityName: string;
  stage: string;
  status?: string;
}

export function MatchCard({ match, compact = false }: { match: Match; compact?: boolean }) {
  const isLive = match.status === 'LIVE';

  return (
    <div className={cn('card-dark relative overflow-hidden', compact ? 'p-3' : 'p-4')}>
      {isLive && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-wc-red px-1.5 py-0.5 rounded text-white text-[10px] font-bold">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      )}

      <div className="flex items-center justify-between">
        {/* Home team */}
        <div className="flex flex-col items-center gap-1 flex-1">
          <img
            src={`https://flagcdn.com/48x36/${match.homeTeamCode?.toLowerCase()}.png`}
            alt={match.homeTeam}
            className="w-10 h-7 object-cover rounded shadow"
          />
          <span className={cn('font-bebas tracking-wide', compact ? 'text-base' : 'text-xl')}>
            {match.homeTeam}
          </span>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center px-3">
          <span className="text-xl font-bebas text-muted">VS</span>
          <span className="text-[10px] text-muted text-center">{match.stage}</span>
        </div>

        {/* Away team */}
        <div className="flex flex-col items-center gap-1 flex-1">
          <img
            src={`https://flagcdn.com/48x36/${match.awayTeamCode?.toLowerCase()}.png`}
            alt={match.awayTeam}
            className="w-10 h-7 object-cover rounded shadow"
          />
          <span className={cn('font-bebas tracking-wide', compact ? 'text-base' : 'text-xl')}>
            {match.awayTeam}
          </span>
        </div>
      </div>

      {!compact && (
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
          <span>📍 {match.venue}, {match.cityName}</span>
          <span>🕐 {formatMatchTime(match.kickoffAt)}</span>
        </div>
      )}

      {compact && (
        <p className="text-xs text-muted mt-1.5">📍 {match.cityName} · {formatMatchTime(match.kickoffAt)}</p>
      )}
    </div>
  );
}
