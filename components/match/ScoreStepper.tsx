'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function ScoreStepper({
  value,
  onChange,
  highlight,
}: {
  value: number
  onChange: (value: number) => void
  highlight?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  function startEditing() {
    setDraft(String(value))
    setEditing(true)
  }

  function commit() {
    const n = Number.parseInt(draft, 10)
    if (Number.isFinite(n)) onChange(Math.max(0, Math.min(99, n)))
    setEditing(false)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        aria-label="הוסף שער"
        onClick={() => onChange(Math.min(99, value + 1))}
        className="flex h-12 w-16 items-center justify-center rounded-xl border border-neon/30 bg-neon/10 text-neon transition active:scale-90"
      >
        <Plus className="h-6 w-6" strokeWidth={3} />
      </button>
      <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden">
        {editing ? (
          <input
            autoFocus
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
            onFocus={(e) => e.target.select()}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
              if (e.key === 'Escape') setEditing(false)
            }}
            aria-label="מספר שערים"
            className="tabular h-20 w-20 rounded-xl border-2 border-neon bg-bg/80 text-center text-6xl font-black text-white outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            aria-label={`${value} שערים, הקישו להזנה ידנית`}
            className="flex h-full w-full items-center justify-center rounded-xl transition hover:bg-white/5"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={value}
                initial={{ y: -30, opacity: 0, scale: 0.6 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 30, opacity: 0, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className={cn('tabular text-7xl font-black', highlight ? 'text-neon text-glow' : 'text-white')}
              >
                {value}
              </motion.span>
            </AnimatePresence>
          </button>
        )}
      </div>
      <button
        type="button"
        aria-label="הורד שער"
        disabled={value === 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-12 w-16 items-center justify-center rounded-xl border border-line bg-card2 text-muted transition active:scale-90 disabled:opacity-30"
      >
        <Minus className="h-6 w-6" strokeWidth={3} />
      </button>
    </div>
  )
}
