import Link from 'next/link'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import { Card, CardTitle } from '@/components/ui/card'
import type { TitleRow } from '@/lib/daily'
import { formatDayKey } from '@/lib/dates'
import { cn } from '@/lib/utils'

export function DailyTitlesCard({ rows, year }: { rows: TitleRow[]; year: number }) {
  if (!rows.some((r) => r.total > 0)) return null
  const max = Math.max(...rows.map((r) => r.total))

  return (
    <Card className="border-gold/30 bg-gradient-to-bl from-gold/10 to-card">
      <CardTitle>👑 תארי אלוף יומי · כל הזמנים</CardTitle>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <Link key={r.player.id} href={`/players/${r.player.id}`} className="group flex items-center gap-3">
            <span className={cn('w-4 text-center text-sm font-black', i === 0 ? 'text-gold' : 'text-muted')}>{i + 1}</span>
            <PlayerAvatar player={r.player} size="sm" glow={i === 0 && r.total > 0} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-bold group-hover:text-gold">{r.player.name}</span>
                <span className="tabular text-xs text-muted">{r.thisYear} ב-{year}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-gold to-amber-300"
                  style={{ width: `${max ? (r.total / max) * 100 : 0}%` }}
                />
              </div>
              {r.lastWon && <p className="mt-1 text-[11px] text-muted">אחרון: {formatDayKey(r.lastWon, 'short')}</p>}
            </div>
            <span className="tabular w-10 text-end text-2xl font-black text-gold">{r.total}</span>
          </Link>
        ))}
      </div>
    </Card>
  )
}
