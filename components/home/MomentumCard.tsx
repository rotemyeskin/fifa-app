import { ChevronLeft, TrendingDown, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { FormBadges } from '@/components/common/FormBadges'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import { Card, CardTitle } from '@/components/ui/card'
import type { Outcome } from '@/lib/match'
import type { Momentum } from '@/lib/streaks'
import type { Player } from '@/lib/types'

export interface MomentumEntry {
  player: Player
  momentum: Momentum
  form: Outcome[]
}

function barColor(score: number): string {
  if (score >= 60) return 'from-neon to-volt'
  if (score >= 40) return 'from-sky-400 to-sky-300'
  return 'from-danger to-orange-400'
}

export function MomentumCard({ entries }: { entries: MomentumEntry[] }) {
  if (entries.length === 0) return null
  return (
    <Card>
      <CardTitle>מומנטום · 6 המשחקים האחרונים</CardTitle>
      <div className="space-y-3">
        {entries.map(({ player, momentum, form }) => (
          <Link key={player.id} href={`/players/${player.id}`} className="group flex items-center gap-3">
            <PlayerAvatar player={player} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-1.5 truncate font-bold">
                  {player.name}
                  <span className="text-xs font-medium text-muted">
                    {momentum.emoji} {momentum.label}
                  </span>
                  {momentum.trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-neon" />}
                  {momentum.trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-danger" />}
                </span>
                <span className="tabular font-black">{momentum.score}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-bg">
                <div
                  className={`h-full rounded-full bg-gradient-to-l ${barColor(momentum.score)}`}
                  style={{ width: `${Math.max(momentum.score, 4)}%` }}
                />
              </div>
              <FormBadges form={form} className="mt-1.5" />
            </div>
            <ChevronLeft className="h-4 w-4 shrink-0 text-muted transition group-hover:text-white" />
          </Link>
        ))}
      </div>
    </Card>
  )
}
