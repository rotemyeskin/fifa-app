import { yearOf } from './dates'
import { POINTS, sortAsc, viewFor, type Outcome, type PlayerView } from './match'
import { computeStandings } from './standings'
import { computeMomentum, currentRun, isLoss, isUnbeaten, isWin, longestRun, type Momentum } from './streaks'
import type { Match, Player } from './types'

export interface HeadToHead {
  opponent: Player
  played: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  pts: number
  form: Outcome[]
  biggestWin: Match | null
  biggestLoss: Match | null
  lastMatch: Match | null
}

export interface SeasonLine {
  year: number
  rank: number
  played: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  pts: number
}

export interface PlayerSummary {
  played: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  pts: number
  winRate: number
  avgStars: number
  avgOppStars: number
  form: Outcome[]
  momentum: Momentum | null
  currentStreak: { outcome: Outcome; length: number } | null
  currentUnbeaten: number
  longestWinStreak: number
  longestUnbeaten: number
  longestLossStreak: number
  cleanSheets: number
  blanks: number
  underdogWins: number
  extraTime: { played: number; w: number; d: number; l: number }
  favoriteTeam: { team: string; count: number } | null
  biggestWin: Match | null
  biggestLoss: Match | null
  mostGoals: Match | null
  headToHead: HeadToHead[]
  seasons: SeasonLine[]
}

type Game = { match: Match; view: PlayerView }

function biggestBy(games: Game[], pick: (g: Game) => number): Match | null {
  let best: Game | null = null
  for (const g of games) {
    const value = pick(g)
    if (value > 0 && (!best || value > pick(best) || (value === pick(best) && g.view.gf > best.view.gf))) best = g
  }
  return best?.match ?? null
}

export function summarizePlayer(playerId: string, players: Player[], matches: Match[]): PlayerSummary {
  const games: Game[] = sortAsc(matches).flatMap((match) => {
    const view = viewFor(match, playerId)
    return view ? [{ match, view }] : []
  })
  const outcomes = games.map((g) => g.view.outcome)
  const count = (fn: (g: Game) => boolean) => games.filter(fn).length

  const w = count((g) => g.view.outcome === 'W')
  const d = count((g) => g.view.outcome === 'D')
  const l = games.length - w - d
  const sum = (fn: (g: Game) => number) => games.reduce((s, g) => s + fn(g), 0)
  const n = games.length || 1

  const lastOutcome = outcomes[outcomes.length - 1]
  const teams = new Map<string, number>()
  for (const { view } of games) {
    const team = view.team?.trim()
    if (team) teams.set(team, (teams.get(team) ?? 0) + 1)
  }
  let favoriteTeam: PlayerSummary['favoriteTeam'] = null
  for (const [team, c] of teams) if (!favoriteTeam || c > favoriteTeam.count) favoriteTeam = { team, count: c }

  const etGames = games.filter((g) => g.match.extra_time)

  return {
    played: games.length,
    w,
    d,
    l,
    gf: sum((g) => g.view.gf),
    ga: sum((g) => g.view.ga),
    pts: w * 3 + d,
    winRate: games.length ? w / games.length : 0,
    avgStars: sum((g) => g.view.stars) / n,
    avgOppStars: sum((g) => g.view.oppStars) / n,
    form: outcomes.slice(-5),
    momentum: computeMomentum(outcomes),
    currentStreak: lastOutcome
      ? { outcome: lastOutcome, length: currentRun(outcomes, (o) => o === lastOutcome) }
      : null,
    currentUnbeaten: currentRun(outcomes, isUnbeaten),
    longestWinStreak: longestRun(outcomes, isWin),
    longestUnbeaten: longestRun(outcomes, isUnbeaten),
    longestLossStreak: longestRun(outcomes, isLoss),
    cleanSheets: count((g) => g.view.ga === 0),
    blanks: count((g) => g.view.gf === 0),
    underdogWins: count((g) => g.view.outcome === 'W' && g.view.stars < g.view.oppStars),
    extraTime: {
      played: etGames.length,
      w: etGames.filter((g) => g.view.outcome === 'W').length,
      d: etGames.filter((g) => g.view.outcome === 'D').length,
      l: etGames.filter((g) => g.view.outcome === 'L').length,
    },
    favoriteTeam,
    biggestWin: biggestBy(games, (g) => g.view.gf - g.view.ga),
    biggestLoss: biggestBy(games, (g) => g.view.ga - g.view.gf),
    mostGoals: biggestBy(games, (g) => g.view.gf),
    headToHead: headToHead(games, players),
    seasons: seasons(playerId, players, matches),
  }
}

function headToHead(games: Game[], players: Player[]): HeadToHead[] {
  const rows: HeadToHead[] = []
  for (const opponent of players) {
    const vs = games.filter((g) => g.view.opponentId === opponent.id)
    if (vs.length === 0) continue
    const outcomes = vs.map((g) => g.view.outcome)
    rows.push({
      opponent,
      played: vs.length,
      w: outcomes.filter((o) => o === 'W').length,
      d: outcomes.filter((o) => o === 'D').length,
      l: outcomes.filter((o) => o === 'L').length,
      gf: vs.reduce((s, g) => s + g.view.gf, 0),
      ga: vs.reduce((s, g) => s + g.view.ga, 0),
      pts: outcomes.reduce((s, o) => s + POINTS[o], 0),
      form: outcomes.slice(-5),
      biggestWin: biggestBy(vs, (g) => g.view.gf - g.view.ga),
      biggestLoss: biggestBy(vs, (g) => g.view.ga - g.view.gf),
      lastMatch: vs[vs.length - 1].match,
    })
  }
  return rows.sort((a, b) => b.played - a.played)
}

function seasons(playerId: string, players: Player[], matches: Match[]): SeasonLine[] {
  const years = [...new Set(matches.map((m) => yearOf(m.played_at)))].sort((a, b) => b - a)
  const lines: SeasonLine[] = []
  for (const year of years) {
    const rows = computeStandings(players, matches.filter((m) => yearOf(m.played_at) === year))
    const index = rows.findIndex((r) => r.player.id === playerId)
    const row = rows[index]
    if (!row || row.played === 0) continue
    lines.push({ year, rank: index + 1, played: row.played, w: row.w, d: row.d, l: row.l, gf: row.gf, ga: row.ga, pts: row.pts })
  }
  return lines
}
