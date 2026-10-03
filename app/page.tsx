import { Crown, History } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader'
import { MatchCard } from '@/components/match/MatchCard'
import { LeaderHero } from '@/components/standings/LeaderHero'
import { StandingsTable } from '@/components/standings/StandingsTable'
import { YearSelect } from '@/components/standings/YearSelect'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { getMatches, getPlayers } from '@/lib/data'
import { currentYear, yearOf } from '@/lib/dates'
import { championOf, computeStandings } from '@/lib/standings'
import { playerMap } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AnnualTablePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>
}) {
  const { year: yearParam } = await searchParams
  const [players, matches] = await Promise.all([getPlayers(), getMatches()])

  if (players.length < 2) {
    return (
      <>
        <PageHeader emoji="⚽" title="ליגת הפיפא" />
        <EmptyState
          emoji="🎮"
          title="ברוכים הבאים לליגה!"
          description="כדי להתחיל צריך להוסיף לפחות שני שחקנים."
          action={
            <Link href="/players" className={buttonVariants()}>
              הוספת שחקנים
            </Link>
          }
        />
      </>
    )
  }

  const thisYear = currentYear()
  const years = [...new Set([thisYear, ...matches.map((m) => yearOf(m.played_at))])].sort((a, b) => b - a)
  const year = years.includes(Number(yearParam)) ? Number(yearParam) : thisYear
  const yearMatches = matches.filter((m) => yearOf(m.played_at) === year)
  const rows = computeStandings(players, yearMatches)
  const leader = championOf(rows)
  const byId = playerMap(players)
  const isCurrent = year === thisYear

  return (
    <>
      <PageHeader
        emoji="🏆"
        title="טבלת הליגה"
        subtitle={`עונת ${year} · ${yearMatches.length} משחקים${isCurrent ? ' · מתאפסת ב-1 בינואר' : ''}`}
        action={<YearSelect years={years} value={year} />}
      />

      <div className="space-y-4">
        {leader && (
          <LeaderHero
            row={leader}
            title={isCurrent ? 'מוביל העונה' : `אלוף ${year}`}
            emoji={isCurrent ? '👑' : '🏆'}
          />
        )}

        <Card className="p-3">
          <StandingsTable rows={rows} />
          <p className="mt-2 px-1 text-[11px] text-muted">
            ניצחון 3 · תיקו 1 · הפסד 0 · שוויון נשבר לפי הפרש שערים, שערי זכות ומפגשים ישירים
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/daily" className={buttonVariants({ variant: 'secondary', size: 'lg', className: 'text-base' })}>
            <Crown className="h-5 w-5 text-gold" />
            אלוף יומי
          </Link>
          <Link href="/history" className={buttonVariants({ variant: 'secondary', size: 'lg', className: 'text-base' })}>
            <History className="h-5 w-5 text-sky-400" />
            היסטוריה
          </Link>
        </div>

        {yearMatches.length > 0 && (
          <section>
            <CardTitle>משחקים אחרונים</CardTitle>
            <div className="space-y-2">
              {yearMatches.slice(0, 3).map((m) => (
                <MatchCard key={m.id} match={m} byId={byId} showDate />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
