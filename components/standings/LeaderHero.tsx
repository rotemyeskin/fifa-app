'use client'

import { motion } from 'framer-motion'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import type { StandingRow } from '@/lib/standings'
import { cn } from '@/lib/utils'

export function LeaderHero({
  row,
  title,
  emoji = '👑',
  subtitle,
  className,
}: {
  row: StandingRow
  title: string
  emoji?: string
  subtitle?: string
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-bl from-gold/20 via-card to-card p-5 shadow-gold',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 w-1/3 animate-shimmer bg-gradient-to-l from-transparent via-white/10 to-transparent" />
      </div>
      <div className="relative flex items-center gap-4">
        <div className="relative">
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 animate-float text-3xl">{emoji}</span>
          <PlayerAvatar player={row.player} size="xl" glow />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-gold">{title}</p>
          <p className="truncate text-3xl font-black">{row.player.name}</p>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          <div className="tabular mt-2 flex gap-3 text-sm">
            <span className="font-black text-gold">{row.pts} נק׳</span>
            <span className="text-muted">
              {row.w}-{row.d}-{row.l}
            </span>
            <span className="text-muted">
              {row.gf}:{row.ga}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
