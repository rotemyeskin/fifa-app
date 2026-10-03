'use client'

import { Dices, Hand } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { startSession } from '@/app/actions'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import { PlayerPicker } from '@/components/match/PlayerPicker'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Chip } from '@/components/ui/chip'
import { totalSessionMatches, type Pair } from '@/lib/session'
import type { Player } from '@/lib/types'
import { cn } from '@/lib/utils'
import { DrawAnimation } from './DrawAnimation'

type Mode = 'random' | 'manual'

export function SessionSetup({ players }: { players: Player[] }) {
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState<string[]>(players.map((p) => p.id))
  const [mode, setMode] = useState<Mode>('random')
  const [drawn, setDrawn] = useState<Pair | null>(null)
  const [manualHome, setManualHome] = useState(players[0]?.id ?? '')
  const [manualAway, setManualAway] = useState(players[1]?.id ?? '')

  const participants = players.filter((p) => selected.includes(p.id))
  const total = totalSessionMatches(participants.length)
  const manualValid =
    manualHome !== manualAway && selected.includes(manualHome) && selected.includes(manualAway)
  const first: Pair | null = mode === 'random' ? drawn : manualValid ? [manualHome, manualAway] : null

  function toggle(id: string) {
    setDrawn(null)
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

  function start() {
    if (!first) return
    startTransition(async () => {
      const res = await startSession({
        playerIds: selected,
        firstHomeId: first[0],
        firstAwayId: first[1],
        draw: mode,
      })
      if (!res.ok) toast.error(res.error)
      else toast.success('הסשן התחיל! בהצלחה 🎮')
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
          {participants.length >= 2
            ? `סבב מלא: כל אחד נגד כל אחד פעם אחת · ${total} משחקים`
            : 'בחרו לפחות שני שחקנים'}
        </p>
      </Card>

      {participants.length >= 2 && (
        <Card>
          <CardTitle>המשחק הראשון</CardTitle>
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-bg/60 p-1">
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
            <DrawAnimation participants={participants} result={drawn} onResult={setDrawn} />
          ) : (
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
              <PlayerPicker players={participants} value={manualHome} onChange={(id) => pickManual('home', id)} disabledId={manualAway} />
              <span className="pt-3 text-sm font-black text-muted">VS</span>
              <PlayerPicker players={participants} value={manualAway} onChange={(id) => pickManual('away', id)} disabledId={manualHome} />
            </div>
          )}
        </Card>
      )}

      {first && (
        <Button size="lg" className="w-full" disabled={pending} onClick={start}>
          {pending ? 'פותחים...' : 'יאללה, מתחילים! ⚽'}
          <span className="flex -space-x-2 space-x-reverse">
            {first.map((id) => {
              const p = players.find((x) => x.id === id)
              return p ? <PlayerAvatar key={id} player={p} size="xs" /> : null
            })}
          </span>
        </Button>
      )}
    </div>
  )
}
