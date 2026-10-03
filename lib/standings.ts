import { POINTS, sortAsc, viewFor, type Outcome } from './match'
import type { Match, Player } from './types'

export interface StandingRow {
  player: Player
  played: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  gd: number
  pts: number
  /** Last five results, oldest first. */
  form: Outcome[]
}

function headToHeadPoints(aId: string, bId: string, matches: Match[]): number {
  let a = 0
  let b = 0
  for (const m of matches) {
    const view = viewFor(m, aId)
    if (!view || view.opponentId !== bId) continue
    a += POINTS[view.outcome]
    b += POINTS[view.outcome === 'W' ? 'L' : view.outcome === 'L' ? 'W' : 'D']
  }
  return b - a
}

/** Order: points → goal difference → goals for → head-to-head points → name. */
export function computeStandings(
  players: Player[],
  matches: Match[],
  options: { onlyActive?: boolean } = {},
): StandingRow[] {
  const rows = new Map<string, StandingRow>(
    players.map((p) => [
      p.id,
      { player: p, played: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: [] },
    ]),
  )

  for (const m of sortAsc(matches)) {
    for (const id of [m.home_player_id, m.away_player_id]) {
      const row = rows.get(id)
      const view = viewFor(m, id)
      if (!row || !view) continue
      row.played++
      row.gf += view.gf
      row.ga += view.ga
      row.pts += POINTS[view.outcome]
      if (view.outcome === 'W') row.w++
      else if (view.outcome === 'D') row.d++
      else row.l++
      row.form.push(view.outcome)
    }
  }

  let list = [...rows.values()].map((r) => ({ ...r, gd: r.gf - r.ga, form: r.form.slice(-5) }))
  if (options.onlyActive) list = list.filter((r) => r.played > 0)

  return list.sort(
    (a, b) =>
      b.pts - a.pts ||
      b.gd - a.gd ||
      b.gf - a.gf ||
      headToHeadPoints(a.player.id, b.player.id, matches) ||
      a.player.name.localeCompare(b.player.name, 'he'),
  )
}

/** The leader, or null if nobody has played. */
export function championOf(rows: StandingRow[]): StandingRow | null {
  const top = rows[0]
  return top && top.played > 0 ? top : null
}
