'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Flag, PartyPopper } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { abandonSession } from '@/app/actions'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import { MatchCard } from '@/components/match/MatchCard'
import { MatchForm } from '@/components/match/MatchForm'
import { LeaderHero } from '@/components/standings/LeaderHero'
import { StandingsTable } from '@/components/standings/StandingsTable'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { pairKey, remainingPairs, suggestNextPair, totalSessionMatches, type Pair } from '@/lib/session'
import { championOf, computeStandings } from '@/lib/standings'
import type { Match, Player, Session } from '@/lib/types'
import { cn, UNKNOWN_PLAYER } from '@/lib/utils'
import { SessionSetup } from './SessionSetup'

interface Props {
  players: Player[]
  session: Session | null
  sessionMatches: Match[]
  finished: { session: Session; matches: Match[] } | null
}

export function SessionView({ players, session, sessionMatches, finished }: Props) {
  if (session) {
    return <ActiveSession key={sessionMatches.length} players={players} session={session} matches={sessionMatches} />
  }
  return (
    <div className="space-y-6">
      {finished && <FinishedSummary players={players} {...finished} />}
      <SessionSetup players={players} />
    </div>
  )
}

function ActiveSession({ players, session, matches }: { players: Player[]; session: Session; matches: Match[] }) {
  const [pending, startTransition] = useTransition()
  const byId = new Map(players.map((p) => [p.id, p]))
  const participants = session.player_ids.map((id) => byId.get(id) ?? UNKNOWN_PLAYER)
  const total = totalSessionMatches(session.player_ids.length)
  const remaining = remainingPairs(session, matches)
  const suggested = suggestNextPair(session, matches)
  const [chosen, setChosen] = useState<Pair | null>(suggested)
  const [logging, setLogging] = useState(false)
  const rows = computeStandings(participants, matches)
  const progress = matches.length / total

  function abandon() {
    if (!confirm('לסיים את הסשן עכשיו? המשחקים שנרשמו יישמרו.')) return
    startTransition(async () => {
      const res = await abandonSession(session.id)
      if (!res.ok) toast.error(res.error)
    })
  }

  const home = chosen ? byId.get(chosen[0]) ?? UNKNOWN_PLAYER : null
  const away = chosen ? byId.get(chosen[1]) ?? UNKNOWN_PLAYER : null

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-bold">
            משחק {Math.min(matches.length + 1, total)} מתוך {total}
          </span>
          <span className="text-muted">{session.first_draw === 'random' ? '🎲 פתיחה בהגרלה' : '✋ פתיחה ידנית'}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-bg">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-neon to-volt shadow-neon"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </Card>

      {home && away && chosen && (
        <motion.div
          key={pairKey(...chosen)}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pitch-lines relative overflow-hidden rounded-3xl border border-neon/40 bg-card p-5 shadow-neon"
        >
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-neon">
            {matches.length === 0 ? 'משחק הפתיחה' : 'המשחק הבא'}
          </p>
          <div className="flex items-center justify-around">
            <VsSide player={home} />
            <span className="text-3xl font-black text-muted">VS</span>
            <VsSide player={away} />
          </div>
          {!logging && (
            <Button size="lg" className="mt-5 w-full" onClick={() => setLogging(true)}>
              רישום תוצאה
            </Button>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {logging && chosen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <MatchForm
              key={pairKey(...chosen)}
              players={players}
              sessionId={session.id}
              lockPlayers
              initial={{ home_player_id: chosen[0], away_player_id: chosen[1] }}
              onSaved={() => setLogging(false)}
            />
            <Button variant="ghost" className="mt-2 w-full" onClick={() => setLogging(false)}>
              ביטול
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {remaining.length > 1 && !logging && (
        <Card>
          <CardTitle>או לבחור משחק אחר</CardTitle>
          <div className="flex flex-wrap gap-2">
            {remaining.map(([a, b]) => {
              const active = chosen !== null && pairKey(a, b) === pairKey(...chosen)
              const pa = byId.get(a) ?? UNKNOWN_PLAYER
              const pb = byId.get(b) ?? UNKNOWN_PLAYER
              return (
                <button
                  key={pairKey(a, b)}
                  type="button"
                  onClick={() => setChosen(active ? chosen : [a, b])}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
                    active ? 'border-neon/60 bg-neon/10 text-neon' : 'border-line bg-card2 text-muted',
                  )}
                >
                  {pa.emoji} {pa.name}
                  <span className="text-[10px] opacity-60">נגד</span>
                  {pb.name} {pb.emoji}
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {matches.length > 0 && (
        <>
          <Card className="p-3">
            <CardTitle className="px-1">טבלת הסשן</CardTitle>
            <StandingsTable rows={rows} showForm={false} />
          </Card>
          <section>
            <CardTitle>שוחקו בסשן</CardTitle>
            <div className="space-y-2">
              {[...matches].reverse().map((m) => (
                <MatchCard key={m.id} match={m} byId={byId} editable />
              ))}
            </div>
          </section>
        </>
      )}

      <Button variant="destructive" className="w-full" disabled={pending} onClick={abandon}>
        <Flag className="h-4 w-4" />
        סיום הסשן מוקדם
      </Button>
    </div>
  )
}

function VsSide({ player }: { player: Player }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <PlayerAvatar player={player} size="xl" glow />
      <span className="text-lg font-black">{player.name}</span>
    </div>
  )
}

function FinishedSummary({ players, session, matches }: { players: Player[]; session: Session; matches: Match[] }) {
  const participants = players.filter((p) => session.player_ids.includes(p.id))
  const rows = computeStandings(participants, matches)
  const champion = championOf(rows)
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-lg font-black">
        <PartyPopper className="h-6 w-6 text-gold" />
        הסשן האחרון הסתיים!
      </div>
      {champion && <LeaderHero row={champion} title="אלוף הסשן" emoji="🏆" />}
      <Card className="p-3">
        <StandingsTable rows={rows} showForm={false} />
      </Card>
    </div>
  )
}
