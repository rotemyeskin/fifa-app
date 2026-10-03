import { HistoryView } from '@/components/history/HistoryView'
import { PageHeader } from '@/components/layout/PageHeader'
import { getMatches, getPlayers } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const [players, matches] = await Promise.all([getPlayers(), getMatches()])
  return (
    <>
      <PageHeader emoji="📜" title="היסטוריית משחקים" subtitle={`${matches.length} משחקים בסך הכול`} />
      <HistoryView players={players} matches={matches} />
    </>
  )
}
