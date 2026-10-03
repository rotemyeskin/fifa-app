import { computeDaily } from './daily'
import { dayKey, todayKey } from './dates'
import { computeFunStats } from './funStats'
import { isDraw, loserOf, sortAsc, viewFor, winnerOf, type Outcome } from './match'
import { computeStandings } from './standings'
import { computeMomentum, currentRun, isLoss, isUnbeaten, isWin, isWinless } from './streaks'
import type { Match, Player } from './types'

export type HeadlineTone = 'gold' | 'green' | 'red' | 'violet' | 'blue' | 'orange'

export interface Headline {
  id: string
  emoji: string
  text: string
  playerId?: string
  tone: HeadlineTone
}

function margin(m: Match): number {
  return Math.abs(m.home_goals - m.away_goals)
}

function scoreline(m: Match): string {
  return `${Math.max(m.home_goals, m.away_goals)}–${Math.min(m.home_goals, m.away_goals)}`
}

/** Bigger margin first, then more goals by the winner, then most recent. */
function byThrashing(a: Match, b: Match): number {
  return (
    margin(b) - margin(a) ||
    Math.max(b.home_goals, b.away_goals) - Math.max(a.home_goals, a.away_goals) ||
    b.played_at.localeCompare(a.played_at)
  )
}

/**
 * Broadcast-style headlines for the home banner.
 * Streaks and momentum use all matches; records and the table use the current season only.
 */
export function computeHeadlines(players: Player[], allMatches: Match[], seasonMatches: Match[]): Headline[] {
  if (allMatches.length === 0) return []
  const byId = new Map(players.map((p) => [p.id, p]))
  const name = (id: string | null) => (id ? byId.get(id)?.name ?? '?' : '?')
  const headlines: Headline[] = []
  const sortedAll = sortAsc(allMatches)

  const last = sortedAll[sortedAll.length - 1]
  const lastWinner = winnerOf(last)
  headlines.push({
    id: 'last',
    emoji: '⚽',
    text: lastWinner
      ? `המשחק האחרון: ${name(lastWinner)} ניצח את ${name(loserOf(last))} ${scoreline(last)}${last.extra_time ? ' אחרי הארכה' : ''}`
      : `המשחק האחרון: ${name(last.home_player_id)} ו${name(last.away_player_id)} סיימו בתיקו ${scoreline(last)}${last.extra_time ? ' גם אחרי הארכה' : ''}`,
    playerId: lastWinner ?? undefined,
    tone: 'blue',
  })

  const rows = computeStandings(players, seasonMatches)
  const [first, second] = rows
  if (first && second && first.played > 0) {
    const gap = first.pts - second.pts
    headlines.push(
      gap > 0
        ? { id: 'leader', emoji: '👑', text: `${first.player.name} מוביל את הטבלה בפער ${gap} נק׳`, playerId: first.player.id, tone: 'gold' }
        : { id: 'leader', emoji: '⚔️', text: `צמוד בצמרת: ${first.player.name} ו${second.player.name} שווים בנקודות`, playerId: first.player.id, tone: 'gold' },
    )
  }

  const today = todayKey()
  const todayMatches = allMatches.filter((m) => dayKey(m.played_at) === today)
  if (todayMatches.length > 0) {
    const { champion } = computeDaily(players, todayMatches)
    const played = todayMatches.length === 1 ? 'היום שוחק משחק אחד' : `היום שוחקו ${todayMatches.length} משחקים`
    headlines.push({
      id: 'today',
      emoji: '☀️',
      text: champion
        ? `${played}, ו${champion.player.name} מוביל את טבלת האלוף היומי`
        : `${played}, והסבב הראשון עוד לא הושלם`,
      playerId: champion?.player.id,
      tone: 'gold',
    })
  }

  const momentums: { player: Player; score: number; emoji: string }[] = []
  for (const p of players) {
    const outcomes: Outcome[] = sortedAll.flatMap((m) => {
      const v = viewFor(m, p.id)
      return v ? [v.outcome] : []
    })
    if (outcomes.length === 0) continue

    const wins = currentRun(outcomes, isWin)
    const losses = currentRun(outcomes, isLoss)
    const unbeaten = currentRun(outcomes, isUnbeaten)
    const winless = currentRun(outcomes, isWinless)
    if (wins >= 2) headlines.push({ id: `win-run-${p.id}`, emoji: '🔥', text: `${p.name} ב-${wins} ניצחונות רצופים`, playerId: p.id, tone: 'orange' })
    else if (unbeaten >= 3) headlines.push({ id: `unbeaten-${p.id}`, emoji: '🛡️', text: `${p.name} ללא הפסד ב-${unbeaten} המשחקים האחרונים`, playerId: p.id, tone: 'green' })
    if (losses >= 2) headlines.push({ id: `loss-run-${p.id}`, emoji: '🥶', text: `${p.name} הפסיד ${losses} משחקים ברצף`, playerId: p.id, tone: 'red' })
    else if (winless >= 3) headlines.push({ id: `winless-${p.id}`, emoji: '😬', text: `${p.name} בלי ניצחון ב-${winless} משחקים`, playerId: p.id, tone: 'red' })

    const momentum = computeMomentum(outcomes)
    if (momentum && outcomes.length >= 3) momentums.push({ player: p, score: momentum.score, emoji: momentum.emoji })
  }

  momentums.sort((a, b) => b.score - a.score)
  const hot = momentums[0]
  const cold = momentums[momentums.length - 1]
  if (hot && hot.score >= 60) {
    headlines.push({ id: 'momentum-hot', emoji: '📈', text: `המומנטום אצל ${hot.player.name}: ${hot.score}%`, playerId: hot.player.id, tone: 'green' })
  }
  if (cold && cold !== hot && cold.score <= 35) {
    headlines.push({ id: 'momentum-cold', emoji: '📉', text: `${cold.player.name} במשבר מומנטום (${cold.score}%)`, playerId: cold.player.id, tone: 'red' })
  }

  const decisive = seasonMatches.filter((m) => !isDraw(m)).sort(byThrashing)
  const biggest = decisive[0]
  if (biggest) {
    headlines.push({
      id: 'biggest-win',
      emoji: '💥',
      text: `הניצחון הגדול של העונה: ${name(winnerOf(biggest))} ${scoreline(biggest)} על ${name(loserOf(biggest))}`,
      playerId: winnerOf(biggest) ?? undefined,
      tone: 'orange',
    })
  }

  for (const p of players) {
    const worst = decisive.find((m) => loserOf(m) === p.id && m !== biggest && margin(m) >= 2)
    if (!worst) continue
    headlines.push({
      id: `biggest-loss-${p.id}`,
      emoji: '😵',
      text: `ההפסד הכי כואב של ${p.name} העונה: ${scoreline(worst)} מול ${name(winnerOf(worst))}`,
      playerId: p.id,
      tone: 'red',
    })
  }

  const scorer = rows.filter((r) => r.played > 0).sort((a, b) => b.gf - a.gf)[0]
  if (scorer && scorer.gf > 0) {
    headlines.push({ id: 'scorer', emoji: '🎯', text: `${scorer.player.name} מלך השערים של העונה עם ${scorer.gf} שערים`, playerId: scorer.player.id, tone: 'green' })
  }

  const defense = rows.filter((r) => r.played >= 3).sort((a, b) => a.ga / a.played - b.ga / b.played)[0]
  if (defense) {
    headlines.push({
      id: 'defense',
      emoji: '🧱',
      text: `ההגנה הטובה בליגה: ${defense.player.name} עם ${(defense.ga / defense.played).toFixed(1)} ספיגות למשחק`,
      playerId: defense.player.id,
      tone: 'blue',
    })
  }

  const FUN_IDS = new Set(['nemesis', 'choker', 'underdog', 'bus-driver', 'et-king'])
  for (const stat of computeFunStats(players, seasonMatches)) {
    if (!FUN_IDS.has(stat.id) || !stat.holder) continue
    headlines.push({
      id: `fun-${stat.id}`,
      emoji: stat.emoji,
      text: `${stat.title}: ${stat.holder.name} · ${stat.value}${stat.detail ? ` (${stat.detail})` : ''}`,
      playerId: stat.holder.id,
      tone: 'violet',
    })
  }

  return headlines
}
