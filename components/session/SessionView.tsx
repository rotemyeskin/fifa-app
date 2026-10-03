'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Flag, PartyPopper, RotateCcw } from 'lucide-react'
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
import { sortAsc } from '@/lib/match'
import {
  drawOptions,
  pairKey,
  roundState,
  sessionRemaining,
  totalSessionMatches,
  type Pair,
} from '@/lib/session'
import { championOf, computeStandings } from '@/lib/standings'
import type { Match, Player, Session } from '@/lib/types'
import { cn, UNKNOWN_PLAYER } from '@/lib/utils'
import { DrawAnimation } from './DrawAnimation'
import { DrawNotice } from './DrawNotice'
import { PairChoices, SessionSetup } from './SessionSetup'

interface Props {
  players: Player[]
  session: Session | null
  sessionMatches: Match[]
  /** Earlier matches today that belong to the round this session is completing. */
  carried: Match[]
  todayMatches: Match[]
  finished: { session: Session; matches: Match[] } | null
}

export function SessionView({ players, session, sessionMatches, carried, todayMatches, finished }: Props) {
  if (session) {
    return (
      <ActiveSession
        key={sessionMatches.length}
        players={players}
        session={session}
        matches={sessionMatches}
        carried={carried}
      />
    )
  }
  return (
    <div className="space-y-6">
      {finished && <FinishedSummary players={players} {...finished} />}
      <SessionSetup players={players} todayMatches={todayMatches} />
    </div>
  )
}

/** How the current matchup was decided, shown as a badge on the matchup card. */
type Source = 'opening' | 'forced' | 'drawn' | 'manual'

function ActiveSession({
  players,
  session,
  matches,
  carried,
}: {
  players: Player[]
  session: Session
  matches: Match[]
  carried: Match[]
}) {
  const [pending, startTransition] = useTransition()
  const byId = new Map(players.map((p) => [p.id, p]))
  const participants = session.player_ids.map((id) => byId.get(id) ?? UNKNOWN_PLAYER)
  const roundMatches = sortAsc([...carried, ...matches])
  const total = totalSessionMatches(session.player_ids.length)
  const remaining = sessionRemaining(session, matches, carried)
  const state = roundState(session.player_ids, roundMatches)
  const options = drawOptions(state)
  const playedCount = total - remaining.length

  const openingPair: Pair = [session.first_home_id, session.first_away_id]
  const openingAvailable =
    matches.length === 0 && remaining.some((p) => pairKey(...p) === pairKey(...openingPair))
  const forcedPair = options.reason === 'last' ? options.candidates[0] : null

  const [chosen, setChosen] = useState<Pair | null>(openingAvailable ? openingPair : forcedPair)
  const [source, setSource] = useState<Source | null>(openingAvailable ? 'opening' : forcedPair ? 'forced' : null)
  const [logging, setLogging] = useState(false)
  const rows = computeStandings(participants, roundMatches)

  function choose(pair: Pair | null, how: Source | null) {
    setChosen(pair)
    setSource(how)
  }

  function abandon() {
    if (!confirm('לסיים את הסשן עכשיו? המשחקים שנרשמו יישמרו.')) return
    startTransition(async () => {
      const res = await abandonSession(session.id)
      if (!res.ok) toast.error(res.error)
    })
  }

  const home = chosen ? byId.get(chosen[0]) ?? UNKNOWN_PLAYER : null
  const away = chosen ? byId.get(chosen[1]) ?? UNKNOWN_PLAYER : null
  const badge = sourceBadge(source, session, options.reason)

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-bold">
            משחק {Math.min(playedCount + 1, total)} מתוך {total}
          </span>
          {carried.length > 0 && (
            <span className="text-xs text-muted">
              {carried.length === 1 ? 'משחק אחד הגיע' : `${carried.length} משחקים הגיעו`} מלפני הסשן
            </span>
          )}
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-bg">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-neon to-volt shadow-neon"
            initial={{ width: 0 }}
            animate={{ width: `${(playedCount / total) * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </Card>

      {home && away && chosen ? (
        <motion.div
          key={pairKey(...chosen)}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'pitch-lines relative overflow-hidden rounded-3xl border bg-card p-5',
            source === 'forced' ? 'border-gold/50 shadow-gold' : 'border-neon/40 shadow-neon',
          )}
        >
          <div className="mb-4 flex flex-col items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-neon">
              {playedCount === 0 ? 'משחק הפתיחה' : 'המשחק הבא'}
            </p>
            {badge && (
              <span className={cn('rounded-full px-3 py-1 text-xs font-bold', badge.className)}>{badge.text}</span>
            )}
          </div>
          <div className="flex items-center justify-around">
            <VsSide player={home} />
            <span className="text-3xl font-black text-muted">{source === 'forced' ? '🔒' : 'VS'}</span>
            <VsSide player={away} />
          </div>
          {!logging && (
            <div className="mt-5 flex gap-2">
              <Button size="lg" className="flex-1" onClick={() => setLogging(true)}>
                רישום תוצאה
              </Button>
              {(source === 'drawn' || source === 'manual') && (
                <Button size="lg" variant="secondary" aria-label="הגרלה מחדש" onClick={() => choose(null, null)}>
                  <RotateCcw className="h-5 w-5" />
                </Button>
              )}
            </div>
          )}
        </motion.div>
      ) : (
        remaining.length > 0 && (
          <Card className="space-y-4">
            <CardTitle className="mb-0">הגרלת המשחק הבא</CardTitle>
            <DrawNotice options={options} state={state} players={players} />
            <DrawAnimation players={players} options={options} result={null} onResult={(pair) => choose(pair, 'drawn')} />
          </Card>
        )
      )}

      {forcedPair && source === 'forced' && <DrawNotice options={options} state={state} players={players} />}

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
          <CardTitle>או לבחור ידנית</CardTitle>
          <PairChoices pairs={remaining} byId={byId} value={chosen} onChange={(pair) => choose(pair, 'manual')} />
        </Card>
      )}

      {roundMatches.length > 0 && (
        <>
          <Card className="p-3">
            <CardTitle className="px-1">טבלת הסבב</CardTitle>
            <StandingsTable rows={rows} showForm={false} />
          </Card>
          <section>
            <CardTitle>שוחקו בסבב</CardTitle>
            <div className="space-y-2">
              {[...roundMatches].reverse().map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  byId={byId}
                  editable
                  badge={m.session_id === session.id ? undefined : 'שוחק לפני הסשן'}
                />
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

function sourceBadge(
  source: Source | null,
  session: Session,
  reason: ReturnType<typeof drawOptions>['reason'],
): { text: string; className: string } | null {
  switch (source) {
    case 'forced':
      return { text: '🔒 נקבע ע״י המערכת להשלמת הסבב', className: 'bg-gold/15 text-gold' }
    case 'drawn':
      return reason === 'balance'
        ? { text: '🎯 הגרלה חכמה: מאזנת את הסבב', className: 'bg-violet/15 text-violet' }
        : { text: '🎲 הוגרל', className: 'bg-violet/15 text-violet' }
    case 'manual':
      return { text: '✋ נבחר ידנית', className: 'bg-card2 text-muted' }
    case 'opening':
      return session.first_draw === 'random'
        ? { text: '🎲 נקבע בהגרלת הפתיחה', className: 'bg-violet/15 text-violet' }
        : { text: '✋ נבחר ידנית בפתיחה', className: 'bg-card2 text-muted' }
    default:
      return null
  }
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
