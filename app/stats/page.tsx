import { PageHeader } from '@/components/layout/PageHeader'
import { DailyTitlesCard } from '@/components/stats/DailyTitlesCard'
import { StatsView } from '@/components/stats/StatsView'
import { dailyChampionHistory, dailyTitleCounts } from '@/lib/daily'
import { getMatches, getPlayers } from '@/lib/data'
import { currentYear } from '@/lib/dates'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const [players, matches] = await Promise.all([getPlayers(), getMatches()])
  const year = currentYear()
  const titles = dailyTitleCounts(players, dailyChampionHistory(players, matches), year)
  return (
    <>
      <PageHeader emoji="✨" title="סטטיסטיקות מגניבות" subtitle="הנתונים שאף אחד לא ביקש, וכולם צריכים" />
      <div className="space-y-4">
        <DailyTitlesCard rows={titles} year={year} />
        <StatsView players={players} matches={matches} year={year} />
      </div>
    </>
  )
}
