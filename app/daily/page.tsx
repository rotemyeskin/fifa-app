import Link from 'next/link'
import { EmptyState } from '@/components/common/EmptyState'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import { PageHeader } from '@/components/layout/PageHeader'
import { MatchCard } from '@/components/match/MatchCard'
import { LeaderHero } from '@/components/standings/LeaderHero'
import { StandingsTable } from '@/components/standings/StandingsTable'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { getMatches, getPlayers } from '@/lib/data'
import { currentYear, dayKey, formatDayKey, todayKey } from '@/lib/dates'
import { championOf, computeStandings } from '@/lib/standings'
import type { Match } from '@/lib/types'
import { playerMap } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DailyChampionPage() {
  const [players, matches] = await Promise.all([getPlayers(), getMatches()])
  const today = todayKey()
  const byId = playerMap(players)

  const byDay = new Map<string, Match[]>()
  for (const m of matches) {
    const key = dayKey(m.played_at)
    byDay.set(key, [...(byDay.get(key) ?? []), m])
  }

  const todayMatches = byDay.get(today) ?? []
  const rows = computeStandings(players, todayMatches, { onlyActive: true })
  const champion = championOf(rows)

  const year = String(currentYear())
  const pastChampions = [...byDay.entries()]
    .filter(([key]) => key !== today)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, dayMatches]) => ({ key, champion: championOf(computeStandings(players, dayMatches, { onlyActive: true })) }))

  const titles = new Map<string, number>()
  for (const { key, champion: c } of pastChampions) {
    if (c && key.startsWith(year)) titles.set(c.player.id, (titles.get(c.player.id) ?? 0) + 1)
  }
  if (champion) titles.set(champion.player.id, (titles.get(champion.player.id) ?? 0) + 1)
  const titleRows = [...titles.entries()].sort((a, b) => b[1] - a[1])

  return (
    <>
      <PageHeader emoji="👑" title="אלוף יומי" subtitle={formatDayKey(today)} />

      <div className="space-y-4">
        {champion ? (
          <LeaderHero
            row={champion}
            title="האלוף של היום"
            emoji="👑"
            subtitle={`${champion.played} משחקים היום`}
          />
        ) : (
          <EmptyState
            emoji="🛋️"
            title="עוד לא שיחקו היום"
            description="ברגע שיירשם המשחק הראשון של היום, כאן יופיע האלוף היומי."
            action={
              <Link href="/session" className={buttonVariants()}>
                פתיחת סשן 🎮
              </Link>
            }
          />
        )}

        {rows.length > 0 && (
          <Card className="p-3">
            <StandingsTable rows={rows} showForm={false} />
          </Card>
        )}

        {todayMatches.length > 0 && (
          <section>
            <CardTitle>המשחקים של היום</CardTitle>
            <div className="space-y-2">
              {todayMatches.map((m) => (
                <MatchCard key={m.id} match={m} byId={byId} />
              ))}
            </div>
          </section>
        )}

        {titleRows.length > 0 && (
          <Card>
            <CardTitle>תארי אלוף יומי · {year}</CardTitle>
            <div className="space-y-2">
              {titleRows.map(([id, n]) => {
                const p = byId.get(id)
                if (!p) return null
                return (
                  <div key={id} className="flex items-center gap-3">
                    <PlayerAvatar player={p} size="sm" />
                    <span className="flex-1 font-semibold">{p.name}</span>
                    <span className="text-lg">{'👑'.repeat(Math.min(n, 5))}</span>
                    <span className="tabular w-8 text-end font-black text-gold">{n}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {pastChampions.length > 0 && (
          <Card>
            <CardTitle>אלופים קודמים</CardTitle>
            <div className="divide-y divide-line">
              {pastChampions.slice(0, 10).map(({ key, champion: c }) => (
                <div key={key} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-muted">{formatDayKey(key, 'short')}</span>
                  {c && (
                    <span className="flex items-center gap-2 font-semibold">
                      {c.player.name}
                      <PlayerAvatar player={c.player} size="xs" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
