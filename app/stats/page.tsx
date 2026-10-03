import { PageHeader } from '@/components/layout/PageHeader'
import { StatsView } from '@/components/stats/StatsView'
import { getMatches, getPlayers } from '@/lib/data'
import { currentYear } from '@/lib/dates'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const [players, matches] = await Promise.all([getPlayers(), getMatches()])
  return (
    <>
      <PageHeader emoji="✨" title="סטטיסטיקות מגניבות" subtitle="הנתונים שאף אחד לא ביקש, וכולם צריכים" />
      <StatsView players={players} matches={matches} year={currentYear()} />
    </>
  )
}
