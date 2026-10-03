'use client'

import { motion } from 'framer-motion'
import { Dices } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import { Button } from '@/components/ui/button'
import { drawPair, type DrawOptions, type Pair } from '@/lib/session'
import type { Player } from '@/lib/types'
import { cn, UNKNOWN_PLAYER } from '@/lib/utils'

/** Slot-machine style draw. Only lands on the pairs allowed by `options`. */
export function DrawAnimation({
  players,
  options,
  result,
  onResult,
}: {
  players: Player[]
  options: DrawOptions
  result: Pair | null
  onResult: (pair: Pair) => void
}) {
  const [rolling, setRolling] = useState(false)
  const [shown, setShown] = useState<Pair | null>(result)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const byId = new Map(players.map((p) => [p.id, p]))
  const canDraw = options.candidates.length > 0

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  useEffect(() => setShown(result), [result])

  function roll() {
    if (!canDraw) return
    setRolling(true)
    let delay = 55
    const tick = () => {
      setShown(drawPair(options))
      delay *= 1.13
      if (delay < 420) {
        timer.current = setTimeout(tick, delay)
      } else {
        const final = drawPair(options)
        setShown(final)
        setRolling(false)
        onResult(final)
      }
    }
    tick()
  }

  const home = shown ? byId.get(shown[0]) ?? UNKNOWN_PLAYER : null
  const away = shown ? byId.get(shown[1]) ?? UNKNOWN_PLAYER : null

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          'pitch-lines relative flex h-40 w-full items-center justify-around overflow-hidden rounded-2xl border bg-bg/60 transition-colors',
          rolling ? 'border-violet/60' : result ? 'border-neon/50 shadow-neon' : 'border-line',
        )}
      >
        {home && away ? (
          <>
            <Slot key={`h-${home.id}-${rolling}`} player={home} done={!rolling} />
            <motion.span
              animate={rolling ? { rotate: [0, 10, -10, 0] } : { scale: [1, 1.3, 1] }}
              transition={{ duration: 0.4, repeat: rolling ? Infinity : 0 }}
              className="text-2xl font-black text-muted"
            >
              VS
            </motion.span>
            <Slot key={`a-${away.id}-${rolling}`} player={away} done={!rolling} />
          </>
        ) : (
          <span className="text-6xl opacity-60">🎲</span>
        )}
      </div>

      <Button variant="violet" size="lg" className="w-full" onClick={roll} disabled={rolling || !canDraw}>
        <Dices className={cn('h-6 w-6', rolling && 'animate-spin')} />
        {rolling ? 'מגרילים...' : result ? 'הגרלה מחדש' : 'הגרילו את המשחק!'}
      </Button>
    </div>
  )
}

function Slot({ player, done }: { player: Player; done: boolean }) {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0, filter: 'blur(4px)' }}
      animate={{ y: 0, opacity: 1, filter: 'blur(0px)', scale: done ? [1, 1.15, 1] : 1 }}
      transition={{ duration: 0.18 }}
      className="flex flex-col items-center gap-2"
    >
      <PlayerAvatar player={player} size="lg" glow={done} />
      <span className="text-sm font-bold">{player.name}</span>
    </motion.div>
  )
}
