'use client'

import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import { computeFunStats, computeTotals, type FunStat, type StatTone } from '@/lib/funStats'
import { yearOf } from '@/lib/dates'
import type { Match, Player } from '@/lib/types'
import { cn } from '@/lib/utils'

const TONES: Record<StatTone, string> = {
  gold: 'from-gold/25 border-gold/30',
  red: 'from-danger/25 border-danger/30',
  green: 'from-neon/20 border-neon/30',
  violet: 'from-violet/25 border-violet/30',
  blue: 'from-sky-500/20 border-sky-500/30',
  orange: 'from-orange-500/25 border-orange-500/30',
}

export function StatsView({ players, matches, year }: { players: Player[]; matches: Match[]; year: number }) {
  const [scope, setScope] = useState<'year' | 'all'>('year')
  const scoped = useMemo(
    () => (scope === 'year' ? matches.filter((m) => yearOf(m.played_at) === year) : matches),
    [scope, matches, year],
  )
  const stats = useMemo(() => computeFunStats(players, scoped), [players, scoped])
  const totals = useMemo(() => computeTotals(scoped), [scoped])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-card p-1">
        {(
          [
            { id: 'year', label: `עונת ${year}` },
            { id: 'all', label: 'כל הזמנים' },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setScope(id)}
            className={cn(
              'h-10 rounded-lg text-sm font-bold transition',
              scope === id ? 'bg-card2 text-white shadow' : 'text-muted',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Total label="משחקים" value={totals.matches} />
        <Total label="שערים" value={totals.goals} />
        <Total label="ממוצע" value={totals.avgGoals.toFixed(1)} />
        <Total label="הארכות" value={totals.extraTime} />
      </div>

      {stats.length === 0 ? (
        <EmptyState emoji="📊" title="עוד אין נתונים" description="שחקו כמה משחקים והסטטיסטיקות יתחילו להופיע" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {stats.map((s, i) => (
            <StatCard key={`${scope}-${s.id}`} stat={s} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function Total({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-line bg-card px-2 py-3 text-center">
      <div className="tabular text-xl font-black">{value}</div>
      <div className="text-[11px] text-muted">{label}</div>
    </div>
  )
}

function StatCard({ stat, index }: { stat: FunStat; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 260, damping: 24 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-bl to-card p-4',
        TONES[stat.tone],
        !stat.holder && 'opacity-60',
      )}
    >
      <span className="pointer-events-none absolute -left-3 -top-3 text-7xl opacity-15">{stat.emoji}</span>
      <div className="relative flex items-start gap-3">
        <span className="text-3xl">{stat.emoji}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-black">{stat.title}</h3>
          <p className="text-xs text-muted">{stat.description}</p>
        </div>
      </div>
      <div className="relative mt-4 flex items-center gap-3">
        {stat.holder ? (
          <>
            <PlayerAvatar player={stat.holder} size="md" glow />
            <div className="min-w-0">
              <p className="truncate font-bold">{stat.holder.name}</p>
              <p className="text-sm font-black text-white/90">{stat.value}</p>
              {stat.detail && <p className="truncate text-xs text-muted">{stat.detail}</p>}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">{stat.value}</p>
        )}
      </div>
    </motion.div>
  )
}
