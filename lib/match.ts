import type { Match } from './types'

export type Outcome = 'W' | 'D' | 'L'

export interface PlayerView {
  isHome: boolean
  opponentId: string
  gf: number
  ga: number
  stars: number
  oppStars: number
  team: string | null
  outcome: Outcome
}

export function involves(m: Match, playerId: string): boolean {
  return m.home_player_id === playerId || m.away_player_id === playerId
}

export function isDraw(m: Match): boolean {
  return m.home_goals === m.away_goals
}

export function winnerOf(m: Match): string | null {
  if (m.home_goals > m.away_goals) return m.home_player_id
  if (m.away_goals > m.home_goals) return m.away_player_id
  return null
}

export function loserOf(m: Match): string | null {
  if (m.home_goals > m.away_goals) return m.away_player_id
  if (m.away_goals > m.home_goals) return m.home_player_id
  return null
}

export function viewFor(m: Match, playerId: string): PlayerView | null {
  if (!involves(m, playerId)) return null
  const isHome = m.home_player_id === playerId
  const gf = isHome ? m.home_goals : m.away_goals
  const ga = isHome ? m.away_goals : m.home_goals
  return {
    isHome,
    opponentId: isHome ? m.away_player_id : m.home_player_id,
    gf,
    ga,
    stars: isHome ? m.home_stars : m.away_stars,
    oppStars: isHome ? m.away_stars : m.home_stars,
    team: isHome ? m.home_team : m.away_team,
    outcome: gf > ga ? 'W' : gf < ga ? 'L' : 'D',
  }
}

export function sortAsc(matches: Match[]): Match[] {
  return [...matches].sort(
    (a, b) =>
      a.played_at.localeCompare(b.played_at) || a.created_at.localeCompare(b.created_at),
  )
}

export function sortDesc(matches: Match[]): Match[] {
  return sortAsc(matches).reverse()
}

export const POINTS: Record<Outcome, number> = { W: 3, D: 1, L: 0 }
