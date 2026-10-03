import { formatShortDay } from './dates'
import { isDraw, loserOf, sortAsc, viewFor, winnerOf, type PlayerView } from './match'
import { currentRun, isWin, longestRun } from './streaks'
import type { Match, Player } from './types'
export type StatTone = 'gold' | 'red' | 'green' | 'violet' | 'blue' | 'orange'

export interface FunStat {
  id: string
  emoji: string
  title: string
  description: string
  holder: Player | null
  value: string
  detail?: string
  tone: StatTone
}

interface Ctx {
  players: Player[]
  matches: Match[]
  byId: Map<string, Player>
  views: Map<string, { match: Match; view: PlayerView }[]>
}

type Generator = (ctx: Ctx) => FunStat | null

function buildCtx(players: Player[], matches: Match[]): Ctx {
  const sorted = sortAsc(matches)
  const views = new Map<string, { match: Match; view: PlayerView }[]>()
  for (const p of players) {
    views.set(
      p.id,
      sorted.flatMap((match) => {
        const view = viewFor(match, p.id)
        return view ? [{ match, view }] : []
      }),
    )
  }
  return { players, matches: sorted, byId: new Map(players.map((p) => [p.id, p])), views }
}

/** Player with the highest score (> 0). Secondary breaks ties (higher wins). */
function leader(
  ctx: Ctx,
  score: (games: { match: Match; view: PlayerView }[]) => number,
  options: { minGames?: number; secondary?: (games: { match: Match; view: PlayerView }[]) => number; allowZero?: boolean } = {},
): { player: Player; score: number } | null {
  let best: { player: Player; score: number; secondary: number } | null = null
  for (const player of ctx.players) {
    const games = ctx.views.get(player.id) ?? []
    if (games.length === 0 || games.length < (options.minGames ?? 1)) continue
    const s = score(games)
    if (!Number.isFinite(s) || (!options.allowZero && s <= 0)) continue
    const secondary = options.secondary?.(games) ?? 0
    if (!best || s > best.score || (s === best.score && secondary > best.secondary)) {
      best = { player, score: s, secondary }
    }
  }
  return best
}

const count = (games: { view: PlayerView; match: Match }[], fn: (g: { view: PlayerView; match: Match }) => boolean) =>
  games.filter(fn).length

const choker: Generator = (ctx) => {
  const top = leader(ctx, (g) => count(g, ({ match, view }) => match.extra_time && view.outcome === 'L'), {
    secondary: (g) => -count(g, ({ match, view }) => match.extra_time && view.outcome === 'W'),
  })
  return {
    id: 'choker',
    emoji: '😰',
    title: 'החונק',
    description: 'הכי הרבה הפסדים בהארכה',
    holder: top?.player ?? null,
    value: top ? `${top.score} הפסדים בהארכה` : 'עוד אין',
    tone: 'red',
  }
}

const extraTimeKing: Generator = (ctx) => {
  const top = leader(ctx, (g) => count(g, ({ match, view }) => match.extra_time && view.outcome === 'W'))
  return {
    id: 'et-king',
    emoji: '⏱️',
    title: 'מלך ההארכות',
    description: 'הכי הרבה ניצחונות בהארכה',
    holder: top?.player ?? null,
    value: top ? `${top.score} ניצחונות ב-120 דק׳` : 'עוד אין',
    tone: 'violet',
  }
}

const busDriver: Generator = (ctx) => {
  const top = leader(ctx, (g) => count(g, ({ view }) => view.gf === 0 && view.ga === 0), {
    secondary: (g) => -g.reduce((s, { view }) => s + view.gf, 0) / g.length,
  })
  return {
    id: 'bus-driver',
    emoji: '🚌',
    title: 'נהג האוטובוס',
    description: 'הכי הרבה תיקו 0–0',
    holder: top?.player ?? null,
    value: top ? `${top.score} משחקי 0–0` : 'עוד אין',
    tone: 'orange',
  }
}

const underdog: Generator = (ctx) => {
  const isUnderdogWin = ({ view }: { view: PlayerView }) => view.outcome === 'W' && view.stars < view.oppStars
  const top = leader(ctx, (g) => count(g, isUnderdogWin), {
    secondary: (g) => g.filter(isUnderdogWin).reduce((s, { view }) => s + (view.oppStars - view.stars), 0),
  })
  return {
    id: 'underdog',
    emoji: '🐶',
    title: 'האנדרדוג',
    description: 'ניצחונות עם קבוצה חלשה יותר (פחות כוכבים)',
    holder: top?.player ?? null,
    value: top ? `${top.score} ניצחונות הפתעה` : 'עוד אין',
    tone: 'green',
  }
}

const biggestThrashing: Generator = (ctx) => {
  let best: Match | null = null
  for (const m of ctx.matches) {
    if (isDraw(m)) continue
    const diff = Math.abs(m.home_goals - m.away_goals)
    const bestDiff = best ? Math.abs(best.home_goals - best.away_goals) : -1
    const winnerGoals = Math.max(m.home_goals, m.away_goals)
    const bestWinnerGoals = best ? Math.max(best.home_goals, best.away_goals) : -1
    if (diff > bestDiff || (diff === bestDiff && winnerGoals > bestWinnerGoals)) best = m
  }
  if (!best) return null
  const winner = ctx.byId.get(winnerOf(best)!) ?? null
  const loser = ctx.byId.get(loserOf(best)!)
  const hi = Math.max(best.home_goals, best.away_goals)
  const lo = Math.min(best.home_goals, best.away_goals)
  return {
    id: 'thrashing',
    emoji: '💥',
    title: 'הדריסה הגדולה',
    description: 'ההפרש הגדול ביותר במשחק אחד',
    holder: winner,
    value: `${hi}–${lo}`,
    detail: `נגד ${loser?.name ?? '?'} · ${formatShortDay(best.played_at)}`,
    tone: 'red',
  }
}

const goalFest: Generator = (ctx) => {
  let best: Match | null = null
  for (const m of ctx.matches) {
    if (!best || m.home_goals + m.away_goals > best.home_goals + best.away_goals) best = m
  }
  if (!best || best.home_goals + best.away_goals === 0) return null
  const home = ctx.byId.get(best.home_player_id)
  const away = ctx.byId.get(best.away_player_id)
  return {
    id: 'goal-fest',
    emoji: '🎆',
    title: 'משחק הזיקוקים',
    description: 'המשחק עם הכי הרבה שערים',
    holder: ctx.byId.get(winnerOf(best) ?? best.home_player_id) ?? null,
    value: `${best.home_goals}–${best.away_goals}`,
    detail: `${home?.name ?? '?'} נגד ${away?.name ?? '?'} · ${best.home_goals + best.away_goals} שערים`,
    tone: 'orange',
  }
}

const goalMachine: Generator = (ctx) => {
  const top = leader(ctx, (g) => g.reduce((s, { view }) => s + view.gf, 0) / g.length, { minGames: 3 })
  return {
    id: 'goal-machine',
    emoji: '🎯',
    title: 'מכונת השערים',
    description: 'ממוצע השערים הגבוה ביותר למשחק (מינ׳ 3 משחקים)',
    holder: top?.player ?? null,
    value: top ? `${top.score.toFixed(2)} למשחק` : 'עוד אין',
    tone: 'green',
  }
}

const theWall: Generator = (ctx) => {
  const top = leader(ctx, (g) => -g.reduce((s, { view }) => s + view.ga, 0) / g.length, {
    minGames: 3,
    allowZero: true,
  })
  return {
    id: 'wall',
    emoji: '🧱',
    title: 'החומה',
    description: 'הכי מעט ספיגות בממוצע (מינ׳ 3 משחקים)',
    holder: top?.player ?? null,
    value: top ? `${Math.abs(top.score).toFixed(2)} ספיגות למשחק` : 'עוד אין',
    tone: 'blue',
  }
}

const longestStreak: Generator = (ctx) => {
  const top = leader(ctx, (g) => longestRun(g.map(({ view }) => view.outcome), isWin))
  if (!top || top.score < 2) return null
  return {
    id: 'streak',
    emoji: '🚀',
    title: 'הרצף הארוך',
    description: 'רצף הניצחונות הארוך ביותר',
    holder: top.player,
    value: `${top.score} ניצחונות ברצף`,
    tone: 'violet',
  }
}

const onFire: Generator = (ctx) => {
  const top = leader(ctx, (g) => currentRun(g.map(({ view }) => view.outcome), isWin))
  if (!top || top.score < 2) return null
  return {
    id: 'on-fire',
    emoji: '🔥',
    title: 'בוער',
    description: 'רצף ניצחונות פעיל כרגע',
    holder: top.player,
    value: `${top.score} ניצחונות ברצף`,
    tone: 'orange',
  }
}

const drawMaster: Generator = (ctx) => {
  const top = leader(ctx, (g) => count(g, ({ view }) => view.outcome === 'D'))
  return {
    id: 'draws',
    emoji: '🤝',
    title: 'אמן התיקו',
    description: 'הכי הרבה תוצאות תיקו',
    holder: top?.player ?? null,
    value: top ? `${top.score} תיקו` : 'עוד אין',
    tone: 'blue',
  }
}

const nemesis: Generator = (ctx) => {
  let best: { a: Player; b: Player; w: number; d: number; l: number } | null = null
  for (const a of ctx.players) {
    for (const b of ctx.players) {
      if (a.id === b.id) continue
      const games = (ctx.views.get(a.id) ?? []).filter(({ view }) => view.opponentId === b.id)
      if (games.length < 3) continue
      const w = count(games, ({ view }) => view.outcome === 'W')
      const d = count(games, ({ view }) => view.outcome === 'D')
      const l = games.length - w - d
      const margin = w - l
      if (margin <= 0) continue
      if (!best || margin > best.w - best.l || (margin === best.w - best.l && w > best.w)) {
        best = { a, b, w, d, l }
      }
    }
  }
  if (!best) return null
  return {
    id: 'nemesis',
    emoji: '👹',
    title: 'הסיוט',
    description: 'השליטה הגדולה ביותר על יריב ספציפי (מינ׳ 3 מפגשים)',
    holder: best.a,
    value: `${best.w}–${best.d}–${best.l}`,
    detail: `הסיוט של ${best.b.name}`,
    tone: 'red',
  }
}

const loyalist: Generator = (ctx) => {
  let best: { player: Player; team: string; n: number } | null = null
  for (const player of ctx.players) {
    const counts = new Map<string, number>()
    for (const { view } of ctx.views.get(player.id) ?? []) {
      const team = view.team?.trim()
      if (team) counts.set(team, (counts.get(team) ?? 0) + 1)
    }
    for (const [team, n] of counts) {
      if (n >= 3 && (!best || n > best.n)) best = { player, team, n }
    }
  }
  if (!best) return null
  return {
    id: 'loyal',
    emoji: '💍',
    title: 'הנאמן',
    description: 'הקבוצה שנבחרה הכי הרבה פעמים',
    holder: best.player,
    value: best.team,
    detail: `${best.n} משחקים`,
    tone: 'gold',
  }
}

const GENERATORS: Generator[] = [
  biggestThrashing,
  choker,
  busDriver,
  underdog,
  onFire,
  extraTimeKing,
  goalMachine,
  theWall,
  nemesis,
  longestStreak,
  drawMaster,
  goalFest,
  loyalist,
]

export function computeFunStats(players: Player[], matches: Match[]): FunStat[] {
  if (matches.length === 0) return []
  const ctx = buildCtx(players, matches)
  return GENERATORS.map((g) => g(ctx)).filter((s): s is FunStat => s !== null)
}

export interface Totals {
  matches: number
  goals: number
  avgGoals: number
  extraTime: number
  draws: number
}

export function computeTotals(matches: Match[]): Totals {
  const goals = matches.reduce((s, m) => s + m.home_goals + m.away_goals, 0)
  return {
    matches: matches.length,
    goals,
    avgGoals: matches.length ? goals / matches.length : 0,
    extraTime: matches.filter((m) => m.extra_time).length,
    draws: matches.filter(isDraw).length,
  }
}
