import { involves, sortAsc, winnerOf } from './match'
import type { Match, Session } from './types'

export type Pair = [string, string]

export function pairKey(a: string, b: string): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`
}

export function allPairs(ids: string[]): Pair[] {
  const pairs: Pair[] = []
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) pairs.push([ids[i], ids[j]])
  }
  return pairs
}

export function totalSessionMatches(playerCount: number): number {
  return (playerCount * (playerCount - 1)) / 2
}

export function remainingPairs(session: Session, sessionMatches: Match[]): Pair[] {
  const played = new Set(sessionMatches.map((m) => pairKey(m.home_player_id, m.away_player_id)))
  return allPairs(session.player_ids).filter(([a, b]) => !played.has(pairKey(a, b)))
}

/**
 * Next suggested pairing. The first match is the drawn/selected one.
 * After that, the winner of the last match stays on and faces a player who rested.
 * Ties are broken by who has played fewer games in the session.
 */
export function suggestNextPair(session: Session, sessionMatches: Match[]): Pair | null {
  const remaining = remainingPairs(session, sessionMatches)
  if (remaining.length === 0) return null

  if (sessionMatches.length === 0) {
    const firstKey = pairKey(session.first_home_id, session.first_away_id)
    if (remaining.some(([a, b]) => pairKey(a, b) === firstKey)) {
      return [session.first_home_id, session.first_away_id]
    }
  }

  const ordered = sortAsc(sessionMatches)
  const last = ordered[ordered.length - 1]
  if (!last) return remaining[0]

  const lastIds = [last.home_player_id, last.away_player_id]
  const winner = winnerOf(last)
  const gamesPlayed = (id: string) => ordered.filter((m) => involves(m, id)).length

  const scored = remaining.map((pair) => {
    const rested = pair.filter((id) => !lastIds.includes(id)).length
    let score = 0
    if (winner && pair.includes(winner) && rested === 1) score = 3
    else if (!winner && rested === 1) score = 2
    else if (rested === 2) score = 1
    const load = gamesPlayed(pair[0]) + gamesPlayed(pair[1])
    return { pair, score, load }
  })

  scored.sort((a, b) => b.score - a.score || a.load - b.load)
  const [a, b] = scored[0].pair
  // The player continuing from the last match is listed first.
  return lastIds.includes(a) ? [a, b] : [b, a]
}

export function randomPair(ids: string[]): Pair {
  const shuffled = [...ids].sort(() => Math.random() - 0.5)
  return [shuffled[0], shuffled[1]]
}
