import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import { Card, CardTitle } from '@/components/ui/card'
import type { StarBreakdown } from '@/lib/starStats'
import { cn, formatStars } from '@/lib/utils'

/** Wins per team star rating. Each cell: wins (big) and games played with that rating (small). */
export function StarWinsTable({ data, title = 'ניצחונות לפי דירוג הקבוצה' }: { data: StarBreakdown; title?: string }) {
  if (data.rows.length === 0) return null
  const best = new Map<number, number>()
  for (const star of data.stars) {
    best.set(star, Math.max(...data.rows.map((r) => r.cells.get(star)?.wins ?? 0)))
  }

  return (
    <Card className="p-3">
      <CardTitle className="px-1">⭐ {title}</CardTitle>
      <div className="no-scrollbar overflow-x-auto">
        <table className="w-full min-w-[300px] border-separate border-spacing-y-1.5 text-center text-sm">
          <thead>
            <tr className="text-[11px] font-bold text-muted">
              <th className="pb-1 text-start">שחקן</th>
              {data.stars.map((s) => (
                <th key={s} className="pb-1 text-gold">
                  {formatStars(s)}★
                </th>
              ))}
              <th className="pb-1 text-neon">סה״כ</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map(({ player, cells, totalWins }) => (
              <tr key={player.id} className="bg-card2/80">
                <td className="rounded-s-xl py-2 ps-2 text-start">
                  <span className="flex items-center gap-2">
                    <PlayerAvatar player={player} size="xs" />
                    <span className="truncate font-bold">{player.name}</span>
                  </span>
                </td>
                {data.stars.map((s) => {
                  const cell = cells.get(s)
                  const top = cell && cell.wins > 0 && cell.wins === best.get(s)
                  return (
                    <td key={s} className="tabular py-2">
                      {cell ? (
                        <span className="flex flex-col items-center leading-tight">
                          <span className={cn('text-base font-black', top ? 'text-gold' : 'text-white')}>{cell.wins}</span>
                          <span className="text-[10px] text-muted">מתוך {cell.played}</span>
                        </span>
                      ) : (
                        <span className="text-muted/50">—</span>
                      )}
                    </td>
                  )
                })}
                <td className="tabular rounded-e-xl py-2 text-lg font-black">{totalWins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-1 px-1 text-[11px] text-muted">המספר הגדול: ניצחונות · הקטן: משחקים עם הדירוג הזה</p>
    </Card>
  )
}
