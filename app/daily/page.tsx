import { Check, Hourglass } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/common/EmptyState'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import { PageHeader } from '@/components/layout/PageHeader'
import { MatchCard } from '@/components/match/MatchCard'
import { LeaderHero } from '@/components/standings/LeaderHero'
import { StandingsTable } from '@/components/standings/StandingsTable'
import { DailyTitlesCard } from '@/components/stats/DailyTitlesCard'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { computeDaily, dailyChampionHistory, dailyTitleCounts, groupByDay } from '@/lib/daily'
import { getMatches, getPlayers } from '@/lib/data'
import { currentYear, formatDayKey, todayKey } from '@/lib/dates'
import { cn, playerMap, UNKNOWN_PLAYER } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DailyChampionPage({ searchParams }: { searchParams: Promise<{ day?: string }> }) {
  const { day: dayParam } = await searchParams
  const [players, matches] = await Promise.all([getPlayers(), getMatches()])
  const today = todayKey()
  const day = dayParam && /^\d{4}-\d{2}-\d{2}$/.test(dayParam) ? dayParam : today
  const isToday = day === today
  const byId = playerMap(players)

  const dayMatches = groupByDay(matches).get(day) ?? []
  const { champion, rows, sessions, excluded, pairs, rounds } = computeDaily(players, dayMatches)
  const excludedIds = new Set(excluded.map((m) => m.id))

  const year = currentYear()
  const history = dailyChampionHistory(players, matches)
  const titles = dailyTitleCounts(players, history, year)

  return (
    <>
      <PageHeader
        emoji="👑"
        title="אלוף יומי"
        subtitle={formatDayKey(day)}
        action={
          !isToday && (
            <Link href="/daily" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
              להיום
            </Link>
          )
        }
      />

      <div className="space-y-4">
        {champion ? (
          <LeaderHero
            row={champion}
            title={isToday ? 'האלוף של היום' : 'אלוף היום'}
            emoji="👑"
            subtitle={sessions === 1 ? 'אחרי סבב מלא אחד' : `אחרי ${sessions} סבבים מלאים`}
          />
        ) : (
          <EmptyState
            emoji={dayMatches.length ? '⏳' : '🛋️'}
            title={dayMatches.length ? 'הסבב הראשון עוד לא הושלם' : isToday ? 'עוד לא שיחקו היום' : 'לא שוחקו משחקים ביום הזה'}
            description="האלוף היומי נקבע רק לפי סבבים מלאים, שבהם כל שחקן שיחק נגד כל אחד מהאחרים."
            action={
              isToday && (
                <Link href="/session" className={buttonVariants()}>
                  {dayMatches.length ? 'המשך סשן 🎮' : 'פתיחת סשן 🎮'}
                </Link>
              )
            }
          />
        )}

        {pairs.length > 0 && (excluded.length > 0 || isToday) && (
          <Card>
            <CardTitle>סבב {sessions + 1} בתהליך</CardTitle>
            <div className="flex flex-wrap gap-2">
              {pairs.map(({ pair, played }) => {
                const done = played > sessions
                const a = byId.get(pair[0]) ?? UNKNOWN_PLAYER
                const b = byId.get(pair[1]) ?? UNKNOWN_PLAYER
                return (
                  <span
                    key={pair.join(':')}
                    className={cn(
                      'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold',
                      done ? 'border-neon/40 bg-neon/10 text-neon' : 'border-line bg-card2 text-muted',
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : <Hourglass className="h-3.5 w-3.5" />}
                    {a.name} נגד {b.name}
                  </span>
                )
              })}
            </div>
            {excluded.length > 0 && (
              <p className="mt-3 text-xs text-muted">
                {excluded.length === 1 ? 'משחק אחד ממתין' : `${excluded.length} משחקים ממתינים`} להשלמת הסבב ולא
                נספרים לאלוף היומי. בטבלה השנתית הם כבר נספרים.
              </p>
            )}
          </Card>
        )}

        {rows.length > 0 && (
          <Card className="p-3">
            <CardTitle className="px-1">טבלת היום · {sessions === 1 ? 'סבב אחד' : `${sessions} סבבים`}</CardTitle>
            <StandingsTable rows={rows} showForm={false} />
          </Card>
        )}

        {rounds.length > 1 && (
          <section className="space-y-3">
            <CardTitle>טבלה לפי סבב</CardTitle>
            {rounds.map((round) => (
              <Card key={round.index} className="p-3">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="font-black">סבב {round.index}</h3>
                  {round.winner && (
                    <span className="flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-bold text-gold">
                      🏆 {round.winner.player.name}
                    </span>
                  )}
                </div>
                <StandingsTable rows={round.rows} showForm={false} />
                <div className="mt-2 flex flex-wrap gap-1.5 px-1">
                  {round.matches.map((m) => {
                    const h = byId.get(m.home_player_id) ?? UNKNOWN_PLAYER
                    const a = byId.get(m.away_player_id) ?? UNKNOWN_PLAYER
                    return (
                      <span key={m.id} className="tabular rounded-lg bg-bg/60 px-2 py-1 text-[11px] text-muted">
                        {h.name} {m.home_goals}:{m.away_goals} {a.name}
                        {m.extra_time ? ' ⏱️' : ''}
                      </span>
                    )
                  })}
                </div>
              </Card>
            ))}
          </section>
        )}

        {dayMatches.length > 0 && (
          <section>
            <CardTitle>{isToday ? 'המשחקים של היום' : 'המשחקים של היום הזה'}</CardTitle>
            <div className="space-y-2">
              {dayMatches.map((m) => (
                <MatchCard key={m.id} match={m} byId={byId} badge={excludedIds.has(m.id) ? 'ממתין להשלמת סבב' : undefined} />
              ))}
            </div>
          </section>
        )}

        <DailyTitlesCard rows={titles} year={year} />

        {history.length > 0 && (
          <Card>
            <CardTitle>אלופים קודמים</CardTitle>
            <div className="divide-y divide-line">
              {history.slice(0, 15).map((d) => (
                <Link
                  key={d.day}
                  href={`/daily?day=${d.day}`}
                  className={cn('flex items-center justify-between py-2.5 text-sm hover:text-gold', d.day === day && 'text-gold')}
                >
                  <span className="text-muted">
                    {formatDayKey(d.day, 'short')} · {d.sessions === 1 ? 'סבב אחד' : `${d.sessions} סבבים`}
                  </span>
                  {d.champion && (
                    <span className="flex items-center gap-2 font-semibold">
                      {d.champion.player.name}
                      <PlayerAvatar player={d.champion.player} size="xs" />
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
