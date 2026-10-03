import { Crown, History } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/common/EmptyState'
import { Logo } from '@/components/common/Logo'
import { HeadlinesBanner } from '@/components/home/HeadlinesBanner'
import { MomentumCard, type MomentumEntry } from '@/components/home/MomentumCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { MatchCard } from '@/components/match/MatchCard'
import { StandingsTable } from '@/components/standings/StandingsTable'
import { YearSelect } from '@/components/standings/YearSelect'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { getMatches, getPlayers } from '@/lib/data'
import { currentYear, yearOf } from '@/lib/dates'
import { computeHeadlines } from '@/lib/headlines'
import { sortAsc, viewFor } from '@/lib/match'
import { computeStandings } from '@/lib/standings'
import { computeMomentum } from '@/lib/streaks'
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
  const byId = playerMap(players)
  const isCurrent = year === thisYear
  const headlines = isCurrent ? computeHeadlines(players, matches, yearMatches) : []
  const maxPlayed = Math.max(0, ...rows.map((r) => r.played))
  const missing = rows
    .filter((r) => r.played < maxPlayed)
    .map((r) => ({ name: r.player.name, count: maxPlayed - r.played }))

  const sortedAll = sortAsc(matches)
  const momentum: MomentumEntry[] = players
    .map((player) => {
      const outcomes = sortedAll.flatMap((m) => {
        const v = viewFor(m, player.id)
        return v ? [v.outcome] : []
      })
      const value = computeMomentum(outcomes)
      return value ? { player, momentum: value, form: outcomes.slice(-6) } : null
    })
    .filter((e): e is MomentumEntry => e !== null)
    .sort((a, b) => b.momentum.score - a.momentum.score)

  return (
    <>
      <div className="mb-4 flex items-center gap-2.5">
        <Logo className="h-11 w-11 drop-shadow-[0_0_12px_rgba(44,245,138,0.45)]" />
        <div className="leading-tight">
          <p className="text-lg font-black tracking-tight">ליגת הפיפא</p>
          <p className="text-[11px] text-muted">{players.map((p) => p.name).join(' · ')}</p>
        </div>
      </div>
      <PageHeader
        emoji="🏆"
        title="טבלת הליגה"
        subtitle={`עונת ${year} · ${yearMatches.length} משחקים${isCurrent ? ' · מתאפסת ב-1 בינואר' : ''}`}
        action={<YearSelect years={years} value={year} />}
      />

      <div className="space-y-4">
        <HeadlinesBanner headlines={headlines} />

        <Card className="p-3">
          <StandingsTable rows={rows} showForm={false} showMissing />
          {missing.length > 0 && (
            <div className="mx-1 mt-2 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold">
              ⚠️ לא כולם שיחקו אותו מספר משחקים:{' '}
              {missing
                .map(({ name, count }) => `ל${name} ${count === 1 ? 'חסר משחק אחד' : `חסרים ${count} משחקים`}`)
                .join(' · ')}
            </div>
          )}
          <p className="mt-2 px-1 text-[11px] text-muted">
            ניצחון 3 · תיקו 1 · הפסד 0 · שוויון נשבר לפי הפרש שערים, שערי זכות ומפגשים ישירים
          </p>
        </Card>

        {isCurrent && <MomentumCard entries={momentum} />}

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
