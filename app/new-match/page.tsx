import { Swords } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader'
import { MatchForm } from '@/components/match/MatchForm'
import { buttonVariants } from '@/components/ui/button'
import { getActiveSession, getPlayers } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function NewMatchPage() {
  const [players, session] = await Promise.all([getPlayers(), getActiveSession()])

  if (players.length < 2) {
    return (
      <>
        <PageHeader emoji="⚽" title="משחק חדש" />
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

  return (
    <>
      <PageHeader emoji="⚽" title="משחק חדש" subtitle="משחק רגיל: 90 דקות" />
      {session && (
        <Link
          href="/session"
          className="mb-4 flex items-center gap-3 rounded-2xl border border-violet/40 bg-violet/10 p-3 text-sm"
        >
          <Swords className="h-5 w-5 shrink-0 text-violet" />
          <span>
            יש סשן פעיל. כדי שהמשחק ייספר בסבב, רשמו אותו ממסך הסשן ←
          </span>
        </Link>
      )}
      <MatchForm players={players} />
    </>
  )
}
