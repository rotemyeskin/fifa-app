import { Pencil } from 'lucide-react'
import Link from 'next/link'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import { Stars } from '@/components/common/Stars'
import { formatShortDay, formatTime } from '@/lib/dates'
import { winnerOf } from '@/lib/match'
import type { Match, Player } from '@/lib/types'
import { cn, UNKNOWN_PLAYER } from '@/lib/utils'

export function MatchCard({
  match,
  byId,
  editable,
  showDate,
}: {
  match: Match
  byId: Map<string, Player>
  editable?: boolean
  showDate?: boolean
}) {
  const home = byId.get(match.home_player_id) ?? UNKNOWN_PLAYER
  const away = byId.get(match.away_player_id) ?? UNKNOWN_PLAYER
  const winner = winnerOf(match)

  return (
    <div className="relative rounded-2xl border border-line bg-card/80 p-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Side player={home} team={match.home_team} stars={match.home_stars} state={stateOf(winner, home.id)} />
        <div className="flex flex-col items-center">
          <div className="tabular flex items-center gap-1.5 text-2xl font-black">
            <span className={winner === home.id ? 'text-neon' : undefined}>{match.home_goals}</span>
            <span className="text-muted">:</span>
            <span className={winner === away.id ? 'text-neon' : undefined}>{match.away_goals}</span>
          </div>
          {match.extra_time && (
            <span className="mt-0.5 rounded-full bg-violet/20 px-2 py-0.5 text-[10px] font-bold text-violet">
              הארכה
            </span>
          )}
          <span className="mt-1 text-[10px] text-muted">
            {showDate ? `${formatShortDay(match.played_at)} · ` : ''}
            {formatTime(match.played_at)}
          </span>
        </div>
        <Side player={away} team={match.away_team} stars={match.away_stars} state={stateOf(winner, away.id)} />
      </div>
      {editable && (
        <Link
          href={`/matches/${match.id}/edit`}
          aria-label="עריכת משחק"
          className="absolute left-2 top-2 rounded-lg p-1.5 text-muted transition hover:bg-line hover:text-white"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}

type SideState = 'win' | 'loss' | 'draw'

function stateOf(winner: string | null, id: string): SideState {
  return winner === null ? 'draw' : winner === id ? 'win' : 'loss'
}

function Side({
  player,
  team,
  stars,
  state,
}: {
  player: Player
  team: string | null
  stars: number
  state: SideState
}) {
  return (
    <div className={cn('flex min-w-0 flex-col items-center gap-1 text-center', state === 'loss' && 'opacity-60')}>
      <PlayerAvatar player={player} size="sm" glow={state === 'win'} />
      <span className="max-w-full truncate text-sm font-bold">{player.name}</span>
      {team && <span className="max-w-full truncate text-[11px] text-muted">{team}</span>}
      <Stars value={stars} size={10} />
    </div>
  )
}
