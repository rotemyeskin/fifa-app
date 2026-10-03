'use client'

import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { FormBadges } from '@/components/common/FormBadges'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import type { StandingRow } from '@/lib/standings'
import { cn, signed } from '@/lib/utils'

const COLUMNS = [
  { key: 'played', label: 'מש׳', title: 'משחקים' },
  { key: 'w', label: 'נ׳', title: 'ניצחונות' },
  { key: 'd', label: 'ת׳', title: 'תיקו' },
  { key: 'l', label: 'ה׳', title: 'הפסדים' },
  { key: 'gf', label: 'זכ׳', title: 'שערי זכות' },
  { key: 'ga', label: 'חו׳', title: 'שערי חובה' },
  { key: 'gd', label: 'הפ׳', title: 'הפרש שערים' },
] as const

const RANK_STYLE = ['text-gold', 'text-slate-300', 'text-amber-600']

export function StandingsTable({ rows, showForm = true }: { rows: StandingRow[]; showForm?: boolean }) {
  return (
    <div className="no-scrollbar -mx-1 overflow-x-auto">
      <table className="w-full min-w-[340px] border-separate border-spacing-y-1.5 px-1 text-center text-sm">
        <thead>
          <tr className="text-[11px] font-bold text-muted">
            <th className="w-7 pb-1">#</th>
            <th className="pb-1 text-start">שחקן</th>
            {COLUMNS.map((c) => (
              <th key={c.key} title={c.title} className="w-8 pb-1">
                {c.label}
              </th>
            ))}
            <th title="נקודות" className="w-10 pb-1 text-neon">
              נק׳
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const leader = i === 0 && row.played > 0
            return (
              <motion.tr
                key={row.player.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 30 }}
                className={cn('bg-card2/80', leader && 'bg-gradient-to-l from-gold/15 to-card2/80')}
              >
                <td className={cn('rounded-s-xl py-3 text-base font-black', RANK_STYLE[i] ?? 'text-muted')}>
                  {i + 1}
                </td>
                <td className="py-2 text-start">
                  <Link href={`/players/${row.player.id}`} className="group flex items-center gap-2">
                    <PlayerAvatar player={row.player} size="sm" glow={leader} />
                    <span className="min-w-0">
                      <span className="flex items-center gap-0.5 truncate font-bold underline-offset-4 group-hover:text-neon group-hover:underline">
                        {row.player.name}
                        <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-muted group-hover:text-neon" />
                      </span>
                      {showForm && <FormBadges form={row.form} className="mt-0.5" />}
                    </span>
                  </Link>
                </td>
                {COLUMNS.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      'tabular py-2 text-muted',
                      c.key === 'gd' && row.gd > 0 && 'text-neon',
                      c.key === 'gd' && row.gd < 0 && 'text-danger',
                    )}
                  >
                    {c.key === 'gd' ? signed(row.gd) : row[c.key]}
                  </td>
                ))}
                <td className="tabular rounded-e-xl py-2 text-lg font-black text-white">{row.pts}</td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
