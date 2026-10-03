import { dayKey } from './dates'
import { sortAsc } from './match'
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

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

// ============ Round-robin state ============

export interface RoundState {
  pairs: Pair[]
  /** Pairs that have not met yet in the current (lowest) round. */
  remaining: Pair[]
  /** Games each player has played in the current round. */
  gamesInRound: Map<string, number>
  /** All pairs have met the same number of times: a brand new round starts. */
  fresh: boolean
}

/** Round-robin progress among `ids`, using only matches where both players are in `ids`. */
export function roundState(ids: string[], matches: Match[]): RoundState {
  const pairs = allPairs(ids)
  const counts = new Map(pairs.map(([a, b]) => [pairKey(a, b), 0]))
  for (const m of matches) {
    const key = pairKey(m.home_player_id, m.away_player_id)
    if (counts.has(key)) counts.set(key, counts.get(key)! + 1)
  }
  const min = pairs.length ? Math.min(...counts.values()) : 0
  const remaining = pairs.filter(([a, b]) => counts.get(pairKey(a, b)) === min)

  const gamesInRound = new Map(ids.map((id) => [id, 0]))
  for (const [a, b] of pairs) {
    if (counts.get(pairKey(a, b))! > min) {
      gamesInRound.set(a, gamesInRound.get(a)! + 1)
      gamesInRound.set(b, gamesInRound.get(b)! + 1)
    }
  }

  return { pairs, remaining, gamesInRound, fresh: remaining.length === pairs.length }
}

// ============ Smart draw ============

export type DrawReason = 'open' | 'balance' | 'last'

export interface DrawOptions {
  /** Pairs the draw may land on. */
  candidates: Pair[]
  /** 'open' = new round, anyone vs anyone. Otherwise the system restricts the draw. */
  reason: DrawReason
  /** Players with the fewest games in the current round; they must play next. */
  priorityIds: string[]
}

/**
 * Which matchups the next draw may produce.
 * A brand new round allows any pair. Otherwise only pairs that have not met in this round
 * and include a player with the fewest games in the round.
 */
export function drawOptions(state: RoundState): DrawOptions {
  if (state.fresh) return { candidates: state.pairs, reason: 'open', priorityIds: [] }

  const waiting = [...new Set(state.remaining.flat())]
  const fewest = Math.min(...waiting.map((id) => state.gamesInRound.get(id) ?? 0))
  const priorityIds = waiting.filter((id) => (state.gamesInRound.get(id) ?? 0) === fewest)
  const candidates = state.remaining.filter((pair) => pair.some((id) => priorityIds.includes(id)))

  return { candidates, reason: candidates.length === 1 ? 'last' : 'balance', priorityIds }
}

/** Random pair from the allowed candidates, with the priority player listed first. */
export function drawPair(options: DrawOptions): Pair {
  const [a, b] = pickRandom(options.candidates)
  return options.priorityIds.includes(b) && !options.priorityIds.includes(a) ? [b, a] : [a, b]
}

// ============ Sessions ============

/**
 * Matches played earlier the same day, before this session started, that belong to a round
 * that was still incomplete. The session continues that round instead of starting over.
 */
export function carriedMatches(session: Session, matches: Match[]): Match[] {
  const day = dayKey(session.started_at)
  const ids = new Set(session.player_ids)
  const before = sortAsc(
    matches.filter(
      (m) =>
        m.session_id !== session.id &&
        ids.has(m.home_player_id) &&
        ids.has(m.away_player_id) &&
        dayKey(m.played_at) === day &&
        m.played_at < session.started_at,
    ),
  )
  const state = roundState(session.player_ids, before)
  if (state.fresh) return []
  const open = new Set(state.remaining.map(([a, b]) => pairKey(a, b)))
  const latest = new Map<string, Match>()
  for (const m of before) {
    const key = pairKey(m.home_player_id, m.away_player_id)
    if (!open.has(key)) latest.set(key, m)
  }
  return sortAsc([...latest.values()])
}

/** Pairs still to be played for the session's round-robin to be complete. */
export function sessionRemaining(session: Session, sessionMatches: Match[], carried: Match[]): Pair[] {
  const played = new Set([...carried, ...sessionMatches].map((m) => pairKey(m.home_player_id, m.away_player_id)))
  return allPairs(session.player_ids).filter(([a, b]) => !played.has(pairKey(a, b)))
}
