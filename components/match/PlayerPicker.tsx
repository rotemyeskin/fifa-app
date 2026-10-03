'use client'

import { motion } from 'framer-motion'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import type { Player } from '@/lib/types'
import { cn } from '@/lib/utils'

export function PlayerPicker({
  players,
  value,
  onChange,
  disabledId,
  locked,
}: {
  players: Player[]
  value: string
  onChange: (id: string) => void
  disabledId?: string
  locked?: boolean
}) {
  const shown = locked ? players.filter((p) => p.id === value) : players
  return (
    <div className="flex flex-col gap-2">
      {shown.map((p) => {
        const selected = p.id === value
        const taken = p.id === disabledId
        return (
          <motion.button
            key={p.id}
            type="button"
            whileTap={{ scale: 0.96 }}
            disabled={locked}
            onClick={() => onChange(p.id)}
            className={cn(
              'flex items-center gap-2 rounded-xl border p-2 text-start transition-all',
              selected ? 'border-transparent bg-card2' : 'border-line bg-bg/40',
              taken && !selected && 'opacity-40',
            )}
            style={selected ? { boxShadow: `0 0 0 2px ${p.color}, 0 0 20px -6px ${p.color}` } : undefined}
          >
            <PlayerAvatar player={p} size="sm" />
            <span className={cn('truncate text-sm font-semibold', selected ? 'text-white' : 'text-muted')}>
              {p.name}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
