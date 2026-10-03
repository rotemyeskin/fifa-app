import Link from 'next/link'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader'
import { SessionView } from '@/components/session/SessionView'
import { buttonVariants } from '@/components/ui/button'
import { getLatestSession, getPlayers, getSessionMatches } from '@/lib/data'
import { dayKey, todayKey } from '@/lib/dates'

export const dynamic = 'force-dynamic'

export default async function SessionPage() {
  const [players, latest] = await Promise.all([getPlayers(), getLatestSession()])

  if (players.length < 2) {
    return (
      <>
        <PageHeader emoji="⚔️" title="סשן" />
        <EmptyState
          emoji="👥"
          title="צריך לפחות שני שחקנים"
          action={
            <Link href="/players" className={buttonVariants()}>
              הוספת שחקנים
            </Link>
          }
        />
      </>
    )
  }

  const latestMatches = latest ? await getSessionMatches(latest.id) : []
  const active = latest?.status === 'active' ? latest : null
  const finishedToday =
    latest?.status === 'completed' && latest.completed_at && dayKey(latest.completed_at) === todayKey()
      ? { session: latest, matches: latestMatches }
      : null

  return (
    <>
      <PageHeader
        emoji="⚔️"
        title="סשן"
        subtitle={active ? 'סבב פעיל: כל אחד נגד כל אחד' : 'פתיחת סבב חדש'}
      />
      <SessionView
        players={players}
        session={active}
        sessionMatches={active ? latestMatches : []}
        finished={finishedToday}
      />
    </>
  )
}
