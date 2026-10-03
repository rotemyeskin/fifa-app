import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { MatchForm } from '@/components/match/MatchForm'
import { getMatch, getPlayers } from '@/lib/data'
import { dayKey } from '@/lib/dates'

export const dynamic = 'force-dynamic'

export default async function EditMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [players, match] = await Promise.all([getPlayers(), getMatch(id)])
  if (!match) notFound()

  return (
    <>
      <PageHeader emoji="✏️" title="עריכת משחק" />
      <MatchForm
        players={players}
        matchId={match.id}
        sessionId={match.session_id}
        lockPlayers={Boolean(match.session_id)}
        initial={{ ...match, played_on: dayKey(match.played_at) }}
      />
    </>
  )
}
