'use client'

import { motion } from 'framer-motion'
import type { Pair } from '@/lib/session'
import { TEAM_TYPES, type TeamParams } from '@/lib/teamParams'
import type { Player } from '@/lib/types'
import { formatStars, UNKNOWN_PLAYER } from '@/lib/utils'

/** One line with everything that was drawn: "Yeskin vs Ido | 4.5★ | National teams". */
export function MatchupSummary({
  pair,
  params,
  byId,
}: {
  pair: Pair
  params: TeamParams | null
  byId: Map<string, Player>
}) {
  const [a, b] = pair.map((id) => byId.get(id) ?? UNKNOWN_PLAYER)
  const type = params ? TEAM_TYPES.find((t) => t.id === params.teamType) : null

  return (
    <motion.div
      key={`${pair.join(':')}-${params?.stars}-${params?.teamType}`}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 rounded-xl border border-line bg-bg/70 px-3 py-2.5 text-sm font-bold"
    >
      <span>
        {a.name} <span className="font-normal text-muted">נגד</span> {b.name}
      </span>
      {params && type && (
        <>
          <span className="text-muted/50">|</span>
          <span className="tabular rounded-lg bg-gold/15 px-2 py-0.5 text-gold">{formatStars(params.stars)} ★</span>
          <span className="text-muted/50">|</span>
          <span className="rounded-lg bg-sky-500/15 px-2 py-0.5 text-sky-300">
            {type.emoji} {type.label}
          </span>
        </>
      )}
    </motion.div>
  )
}
