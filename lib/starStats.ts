import { viewFor } from './match'
import type { Match, Player } from './types'

export interface StarCell {
  played: number
  wins: number
}

export interface StarBreakdown {
  /** Star values that appear in the data, highest first (e.g. 5, 4.5, 4). */
  stars: number[]
  rows: { player: Player; cells: Map<number, StarCell>; totalWins: number }[]
}

/** Wins (and games played) per player, grouped by the star rating of the team the player used. */
export function computeStarBreakdown(players: Player[], matches: Match[]): StarBreakdown {
  const starSet = new Set<number>()
  const rows = players.map((player) => {
    const cells = new Map<number, StarCell>()
    let totalWins = 0
    for (const m of matches) {
      const v = viewFor(m, player.id)
      if (!v) continue
      starSet.add(v.stars)
      const cell = cells.get(v.stars) ?? { played: 0, wins: 0 }
      cell.played++
      if (v.outcome === 'W') {
        cell.wins++
        totalWins++
      }
      cells.set(v.stars, cell)
    }
    return { player, cells, totalWins }
  })
  return {
    stars: [...starSet].sort((a, b) => b - a),
    rows: rows.filter((r) => r.cells.size > 0).sort((a, b) => b.totalWins - a.totalWins),
  }
}
