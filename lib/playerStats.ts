import { sortAsc, viewFor, type Outcome } from './match'
import type { Match, Player } from './types'

export interface HeadToHead {
  opponent: Player
  played: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
}

export interface PlayerSummary {
  played: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  winRate: number
  avgStars: number
  avgOppStars: number
  form: Outcome[]
  currentStreak: { outcome: Outcome; length: number } | null
  longestWinStreak: number
  extraTime: { played: number; w: number; d: number; l: number }
  favoriteTeam: { team: string; count: number } | null
  biggestWin: Match | null
  headToHead: HeadToHead[]
}

export function summarizePlayer(playerId: string, players: Player[], matches: Match[]): PlayerSummary {
  const games = sortAsc(matches).flatMap((match) => {
    const view = viewFor(match, playerId)
    return view ? [{ match, view }] : []
  })

  const s: PlayerSummary = {
    played: games.length,
    w: 0,
    d: 0,
    l: 0,
    gf: 0,
    ga: 0,
    winRate: 0,
    avgStars: 0,
    avgOppStars: 0,
    form: games.slice(-5).map((g) => g.view.outcome),
    currentStreak: null,
    longestWinStreak: 0,
    extraTime: { played: 0, w: 0, d: 0, l: 0 },
    favoriteTeam: null,
    biggestWin: null,
    headToHead: [],
  }

  const teams = new Map<string, number>()
  const h2h = new Map<string, HeadToHead>()
  let run = 0
  let biggestMargin = 0
  let starsTotal = 0
  let oppStarsTotal = 0

  for (const { match, view } of games) {
    s.gf += view.gf
    s.ga += view.ga
    starsTotal += view.stars
    oppStarsTotal += view.oppStars
    if (view.outcome === 'W') s.w++
    else if (view.outcome === 'D') s.d++
    else s.l++

    run = view.outcome === 'W' ? run + 1 : 0
    s.longestWinStreak = Math.max(s.longestWinStreak, run)

    if (match.extra_time) {
      s.extraTime.played++
      if (view.outcome === 'W') s.extraTime.w++
      else if (view.outcome === 'D') s.extraTime.d++
      else s.extraTime.l++
    }

    const margin = view.gf - view.ga
    if (margin > biggestMargin) {
      biggestMargin = margin
      s.biggestWin = match
    }

    const team = view.team?.trim()
    if (team) teams.set(team, (teams.get(team) ?? 0) + 1)

    const opponent = players.find((p) => p.id === view.opponentId)
    if (opponent) {
      const row = h2h.get(opponent.id) ?? { opponent, played: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }
      row.played++
      row.gf += view.gf
      row.ga += view.ga
      if (view.outcome === 'W') row.w++
      else if (view.outcome === 'D') row.d++
      else row.l++
      h2h.set(opponent.id, row)
    }
  }

  if (games.length > 0) {
    s.winRate = s.w / games.length
    s.avgStars = starsTotal / games.length
    s.avgOppStars = oppStarsTotal / games.length
    const last = games[games.length - 1].view.outcome
    let length = 0
    for (let i = games.length - 1; i >= 0 && games[i].view.outcome === last; i--) length++
    s.currentStreak = { outcome: last, length }
  }

  for (const [team, n] of teams) {
    if (!s.favoriteTeam || n > s.favoriteTeam.count) s.favoriteTeam = { team, count: n }
  }

  s.headToHead = [...h2h.values()].sort((a, b) => b.played - a.played)
  return s
}
