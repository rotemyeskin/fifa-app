import { PageHeader } from '@/components/layout/PageHeader'
import { PlayersManager } from '@/components/players/PlayersManager'
import { getMatches, getPlayers } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function PlayersPage() {
  const [players, matches] = await Promise.all([getPlayers(), getMatches()])
  const games: Record<string, number> = {}
  for (const m of matches) {
    games[m.home_player_id] = (games[m.home_player_id] ?? 0) + 1
    games[m.away_player_id] = (games[m.away_player_id] ?? 0) + 1
  }
  return (
    <>
      <PageHeader emoji="👥" title="שחקנים" subtitle={`${players.length} שחקנים בליגה`} />
      <PlayersManager players={players} games={games} />
    </>
  )
}
