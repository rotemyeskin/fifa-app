'use client'

import { Dices, Hand, Shuffle } from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { startSession } from '@/app/actions'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import { PlayerPicker } from '@/components/match/PlayerPicker'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Chip } from '@/components/ui/chip'
import { drawOptions, pairKey, roundState, type Pair } from '@/lib/session'
import type { Match, Player } from '@/lib/types'
import { cn, UNKNOWN_PLAYER } from '@/lib/utils'
import { todayKey } from '@/lib/dates'
import { drawTeamParams, type TeamParams } from '@/lib/teamParams'
import { DrawAnimation } from './DrawAnimation'
import { DrawNotice } from './DrawNotice'
import { MatchupSummary } from './MatchupSummary'
import { TeamParamsConfig } from './TeamParamsConfig'
import { saveDrawnParams, useTeamParamsPrefs } from './useTeamParams'

type Mode = 'random' | 'manual'

export function SessionSetup({ players, todayMatches }: { players: Player[]; todayMatches: Match[] }) {
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState<string[]>(players.map((p) => p.id))
  const [mode, setMode] = useState<Mode>('random')
  const [drawn, setDrawn] = useState<Pair | null>(null)
  const [manualHome, setManualHome] = useState(players[0]?.id ?? '')
  const [manualAway, setManualAway] = useState(players[1]?.id ?? '')
  const [manualPair, setManualPair] = useState<Pair | null>(null)
  const [prefs, updatePrefs] = useTeamParamsPrefs()
  const [params, setParams] = useState<TeamParams | null>(null)

  const byId = new Map(players.map((p) => [p.id, p]))
  const participants = players.filter((p) => selected.includes(p.id))
  const state = useMemo(() => roundState(selected, todayMatches), [selected, todayMatches])
  const options = useMemo(() => drawOptions(state), [state])
  const toPlay = state.remaining.length

  const forcedPair = options.reason === 'last' ? options.candidates[0] : null
  const manualFree = state.fresh
  const manualValid = manualHome !== manualAway && selected.includes(manualHome) && selected.includes(manualAway)
  const first: Pair | null =
    forcedPair ?? (mode === 'random' ? drawn : manualFree ? (manualValid ? [manualHome, manualAway] : null) : manualPair)

  function toggle(id: string) {
    setDrawn(null)
    setManualPair(null)
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  function pickManual(side: 'home' | 'away', id: string) {
    if (side === 'home') {
      if (id === manualAway) setManualAway(manualHome)
      setManualHome(id)
    } else {
      if (id === manualHome) setManualHome(manualAway)
      setManualAway(id)
    }
  }

  function onDrawn(pair: Pair) {
    setDrawn(pair)
    setParams(prefs.enabled ? drawTeamParams(prefs) : null)
  }

  function start() {
    if (!first) return
    saveDrawnParams(`${todayKey()}:${pairKey(...first)}`, prefs.enabled ? params : null)
    startTransition(async () => {
      const res = await startSession({
        playerIds: selected,
        firstHomeId: first[0],
        firstAwayId: first[1],
        draw: forcedPair || mode === 'random' ? 'random' : 'manual',
      })
      if (!res.ok) toast.error(res.error)
      else toast.success(state.fresh ? 'הסשן התחיל! בהצלחה 🎮' : 'ממשיכים את הסבב של היום 🎮')
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>מי משחק בסשן?</CardTitle>
        <div className="flex flex-wrap gap-2">
          {players.map((p) => (
            <Chip key={p.id} active={selected.includes(p.id)} onClick={() => toggle(p.id)}>
              <span>{p.emoji}</span>
              {p.name}
            </Chip>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          {participants.length < 2
            ? 'בחרו לפחות שני שחקנים'
            : state.fresh
              ? `סבב מלא: כל אחד נגד כל אחד פעם אחת · ${toPlay} משחקים`
              : `הסבב של היום עוד לא הושלם · נשארו ${toPlay === 1 ? 'משחק אחד' : `${toPlay} משחקים`} להשלמתו`}
        </p>
      </Card>

      {participants.length >= 2 && (
        <Card className="space-y-4">
          <CardTitle className="mb-0">המשחק הראשון</CardTitle>
          <DrawNotice options={options} state={state} players={players} />
          <TeamParamsConfig prefs={prefs} onChange={updatePrefs} />

          {forcedPair ? (
            <ForcedPair pair={forcedPair} byId={byId} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-bg/60 p-1">
                {(
                  [
                    { id: 'random', label: 'הגרלה', icon: Dices },
                    { id: 'manual', label: 'בחירה ידנית', icon: Hand },
                  ] as const
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMode(id)}
                    className={cn(
                      'flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-bold transition',
                      mode === id ? 'bg-card2 text-white shadow' : 'text-muted',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              {mode === 'random' ? (
                <DrawAnimation players={players} options={options} result={drawn} onResult={onDrawn} />
              ) : manualFree ? (
                <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
                  <PlayerPicker players={participants} value={manualHome} onChange={(id) => pickManual('home', id)} disabledId={manualAway} />
                  <span className="pt-3 text-sm font-black text-muted">VS</span>
                  <PlayerPicker players={participants} value={manualAway} onChange={(id) => pickManual('away', id)} disabledId={manualHome} />
                </div>
              ) : (
                <PairChoices pairs={state.remaining} byId={byId} value={manualPair} onChange={setManualPair} />
              )}
            </>
          )}

          {first && (
            <div className="space-y-2">
              <MatchupSummary pair={first} params={prefs.enabled ? params : null} byId={byId} />
              {prefs.enabled && (
                <Button variant="outline" className="w-full" onClick={() => setParams(drawTeamParams(prefs))}>
                  <Shuffle className="h-4 w-4" />
                  {params ? 'הגרלת נתוני קבוצות מחדש' : 'הגרלת דירוג וסוג קבוצה'}
                </Button>
              )}
            </div>
          )}
        </Card>
      )}

      {first && (
        <Button size="lg" className="w-full" disabled={pending} onClick={start}>
          {pending ? 'פותחים...' : state.fresh ? 'יאללה, מתחילים! ⚽' : 'ממשיכים את הסבב ⚽'}
          <span className="flex -space-x-2 space-x-reverse">
            {first.map((id) => {
              const p = byId.get(id)
              return p ? <PlayerAvatar key={id} player={p} size="xs" /> : null
            })}
          </span>
        </Button>
      )}
    </div>
  )
}

export function ForcedPair({ pair, byId }: { pair: Pair; byId: Map<string, Player> }) {
  const [a, b] = pair.map((id) => byId.get(id) ?? UNKNOWN_PLAYER)
  return (
    <div className="pitch-lines flex h-36 items-center justify-around rounded-2xl border border-gold/40 bg-bg/60">
      <div className="flex flex-col items-center gap-2">
        <PlayerAvatar player={a} size="lg" glow />
        <span className="text-sm font-bold">{a.name}</span>
      </div>
      <span className="text-2xl">🔒</span>
      <div className="flex flex-col items-center gap-2">
        <PlayerAvatar player={b} size="lg" glow />
        <span className="text-sm font-bold">{b.name}</span>
      </div>
    </div>
  )
}

/** Manual pick restricted to pairs that keep the round balanced. */
export function PairChoices({
  pairs,
  byId,
  value,
  onChange,
}: {
  pairs: Pair[]
  byId: Map<string, Player>
  value: Pair | null
  onChange: (pair: Pair) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">אפשר לבחור רק משחק שעוד חסר בסבב:</p>
      <div className="flex flex-wrap gap-2">
        {pairs.map((pair) => {
          const [a, b] = pair.map((id) => byId.get(id) ?? UNKNOWN_PLAYER)
          const active = value !== null && pairKey(...value) === pairKey(...pair)
          return (
            <button
              key={pairKey(...pair)}
              type="button"
              onClick={() => onChange(pair)}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition',
                active ? 'border-neon/60 bg-neon/10 text-neon' : 'border-line bg-card2 text-muted',
              )}
            >
              {a.emoji} {a.name}
              <span className="text-[10px] opacity-60">נגד</span>
              {b.name} {b.emoji}
            </button>
          )
        })}
      </div>
    </div>
  )
}
