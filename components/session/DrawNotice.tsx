import type { DrawOptions, RoundState } from '@/lib/session'
import type { Player } from '@/lib/types'
import { cn } from '@/lib/utils'

/** Explains why the system limited or fixed the next matchup. */
export function DrawNotice({
  options,
  state,
  players,
}: {
  options: DrawOptions
  state: RoundState
  players: Player[]
}) {
  const name = (id: string) => players.find((p) => p.id === id)?.name ?? '?'

  if (options.reason === 'open') {
    return (
      <Notice tone="open" icon="🎲" title="סבב חדש: הגרלה פתוחה">
        כל השחקנים שיחקו אותו מספר משחקים, אז כל אחד יכול לפגוש כל אחד.
      </Notice>
    )
  }

  if (options.reason === 'last') {
    const [a, b] = options.candidates[0]
    return (
      <Notice tone="forced" icon="🔒" title="נקבע ע״י המערכת">
        {name(a)} נגד {name(b)} הוא המשחק האחרון שחסר כדי להשלים את הסבב.
      </Notice>
    )
  }

  const priority = options.priorityIds.map(name)
  const fewest = state.gamesInRound.get(options.priorityIds[0]) ?? 0
  const opponents = options.candidates.map(([a, b]) => name(a === options.priorityIds[0] ? b : a))
  const who = priority.length === 1 ? priority[0] : priority.join(' ו')
  const reason =
    fewest === 0
      ? priority.length === 1
        ? 'עוד לא שיחק בסבב הזה'
        : 'עוד לא שיחקו בסבב הזה'
      : priority.length === 1
        ? 'שיחק הכי מעט משחקים בסבב'
        : 'שיחקו הכי מעט משחקים בסבב'

  return (
    <Notice tone="balance" icon="🎯" title="הגרלה חכמה להשלמת הסבב">
      {who} {reason}, ולכן חייב{priority.length > 1 ? 'ים' : ''} לשחק עכשיו.
      {priority.length === 1 && opponents.length > 0 && <> היריב יוגרל בין {opponents.join(' ל')}.</>}
    </Notice>
  )
}

function Notice({
  tone,
  icon,
  title,
  children,
}: {
  tone: 'open' | 'balance' | 'forced'
  icon: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border p-3 text-sm',
        tone === 'open' && 'border-line bg-bg/40',
        tone === 'balance' && 'border-violet/40 bg-violet/10',
        tone === 'forced' && 'border-gold/40 bg-gold/10',
      )}
    >
      <span className="text-xl">{icon}</span>
      <div>
        <p className={cn('font-bold', tone === 'balance' && 'text-violet', tone === 'forced' && 'text-gold')}>{title}</p>
        <p className="mt-0.5 text-xs text-muted">{children}</p>
      </div>
    </div>
  )
}
