'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import type { Headline, HeadlineTone } from '@/lib/headlines'
import { cn } from '@/lib/utils'

const TONES: Record<HeadlineTone, string> = {
  gold: 'from-gold/25 border-gold/30',
  green: 'from-neon/20 border-neon/30',
  red: 'from-danger/25 border-danger/30',
  violet: 'from-violet/25 border-violet/30',
  blue: 'from-sky-500/20 border-sky-500/30',
  orange: 'from-orange-500/25 border-orange-500/30',
}

const INTERVAL_MS = 5000

export function HeadlinesBanner({ headlines }: { headlines: Headline[] }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [paused, setPaused] = useState(false)
  const count = headlines.length

  const step = useCallback(
    (dir: 1 | -1) => {
      setDirection(dir)
      setIndex((i) => (i + dir + count) % count)
    },
    [count],
  )

  useEffect(() => {
    if (count <= 1 || paused) return
    const timer = setInterval(() => step(1), INTERVAL_MS)
    return () => clearInterval(timer)
  }, [count, paused, step])

  if (count === 0) return null
  const current = headlines[index % count]

  const body = (
    <div className="flex min-h-[3.5rem] items-center gap-3">
      <span className="text-3xl">{current.emoji}</span>
      <p className="flex-1 text-[15px] font-semibold leading-snug">{current.text}</p>
    </div>
  )

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-bl to-card transition-colors duration-500',
        TONES[current.tone],
      )}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 w-1/3 animate-shimmer bg-gradient-to-l from-transparent via-white/[0.06] to-transparent" />

      <div className="relative flex items-center gap-1 px-1.5 py-3">
        {count > 1 && (
          <button
            type="button"
            aria-label="הקודם"
            onClick={() => step(-1)}
            className="shrink-0 rounded-lg p-1.5 text-muted transition hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * 40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {current.playerId ? (
                <Link href={`/players/${current.playerId}`}>{body}</Link>
              ) : (
                body
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {count > 1 && (
          <button
            type="button"
            aria-label="הבא"
            onClick={() => step(1)}
            className="shrink-0 rounded-lg p-1.5 text-muted transition hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {count > 1 && (
        <div className="relative flex justify-center gap-1 pb-2.5">
          {headlines.map((h, i) => (
            <span
              key={h.id}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === index % count ? 'w-4 bg-white' : 'w-1.5 bg-white/25',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
