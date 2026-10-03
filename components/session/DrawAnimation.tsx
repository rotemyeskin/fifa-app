'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Dices } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import { Button } from '@/components/ui/button'
import { randomPair, type Pair } from '@/lib/session'
import type { Player } from '@/lib/types'
import { cn } from '@/lib/utils'

/** Slot-machine style draw for the first match. */
export function DrawAnimation({
  participants,
  result,
  onResult,
}: {
  participants: Player[]
  result: Pair | null
  onResult: (pair: Pair) => void
}) {
  const [rolling, setRolling] = useState(false)
  const [shown, setShown] = useState<Pair | null>(result)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const byId = new Map(participants.map((p) => [p.id, p]))
  const ids = participants.map((p) => p.id)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  useEffect(() => setShown(result), [result])

  function roll() {
    if (ids.length < 2) return
    setRolling(true)
    let delay = 55
    const tick = () => {
      setShown(randomPair(ids))
      delay *= 1.13
      if (delay < 420) {
        timer.current = setTimeout(tick, delay)
      } else {
        const final = randomPair(ids)
        setShown(final)
        setRolling(false)
        onResult(final)
      }
    }
    tick()
  }

  const home = shown ? byId.get(shown[0]) : undefined
  const away = shown ? byId.get(shown[1]) : undefined

  return (
    <div className="flex flex-col items-center gap-5">
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

      <Button variant="violet" size="lg" className="w-full" onClick={roll} disabled={rolling || ids.length < 2}>
        <Dices className={cn('h-6 w-6', rolling && 'animate-spin')} />
        {rolling ? 'מגרילים...' : result ? 'הגרלה מחדש' : 'הגרילו מי פותח!'}
      </Button>
    </div>
  )
}

function Slot({ player, done }: { player: Player; done: boolean }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={player.id}
        initial={{ y: -40, opacity: 0, filter: 'blur(4px)' }}
        animate={{ y: 0, opacity: 1, filter: 'blur(0px)', scale: done ? [1, 1.15, 1] : 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="flex flex-col items-center gap-2"
      >
        <PlayerAvatar player={player} size="lg" glow={done} />
        <span className="text-sm font-bold">{player.name}</span>
      </motion.div>
    </AnimatePresence>
  )
}
