import Link from 'next/link'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader'
import { SessionView } from '@/components/session/SessionView'
import { buttonVariants } from '@/components/ui/button'
import { getLatestSession, getMatches, getPlayers } from '@/lib/data'
import { dayKey, todayKey } from '@/lib/dates'
import { sortAsc } from '@/lib/match'
import { carriedMatches } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function SessionPage() {
  const [players, latest, matches] = await Promise.all([getPlayers(), getLatestSession(), getMatches()])

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

  const today = todayKey()
  const todayMatches = sortAsc(matches.filter((m) => dayKey(m.played_at) === today))
  const latestMatches = latest ? sortAsc(matches.filter((m) => m.session_id === latest.id)) : []
  const carried = latest ? carriedMatches(latest, matches) : []
  const active = latest?.status === 'active' ? latest : null
  const finishedToday =
    latest?.status === 'completed' && latest.completed_at && dayKey(latest.completed_at) === today
      ? { session: latest, matches: [...carried, ...latestMatches] }
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
        carried={active ? carried : []}
        todayMatches={todayMatches}
        finished={finishedToday}
      />
    </>
  )
}
