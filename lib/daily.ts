import { dayKey } from './dates'
import { sortAsc } from './match'
import { allPairs, pairKey, type Pair } from './session'
import { championOf, computeStandings, type StandingRow } from './standings'
import type { Match, Player } from './types'

export interface PairProgress {
  pair: Pair
  played: number
}

export interface DailyResult {
  /** Players who played at least one match that day. */
  participants: Player[]
  /** Number of complete round-robins (every pair met N times). */
  sessions: number
  /** The first N matches of every pair, chronological. These are the only ones that count. */
  counted: Match[]
  /** Extra matches waiting for the round-robin to be completed. Still count for the annual table. */
  excluded: Match[]
  pairs: PairProgress[]
  /** One standings table per completed round-robin: round k = the k-th meeting of every pair. */
  rounds: DailyRound[]
  rows: StandingRow[]
  champion: StandingRow | null
}

export function groupByDay(matches: Match[]): Map<string, Match[]> {
  const byDay = new Map<string, Match[]>()
  for (const m of matches) {
    const key = dayKey(m.played_at)
    byDay.set(key, [...(byDay.get(key) ?? []), m])
  }
  return byDay
}

export interface DailyChampionDay extends DailyResult {
  day: string
}

/** Every day that produced a champion, newest first. */
export function dailyChampionHistory(players: Player[], matches: Match[]): DailyChampionDay[] {
  return [...groupByDay(matches).entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([day, dayMatches]) => ({ day, ...computeDaily(players, dayMatches) }))
    .filter((d) => d.champion !== null)
}

export interface TitleRow {
  player: Player
  total: number
  thisYear: number
  lastWon: string | null
}

export function dailyTitleCounts(players: Player[], history: DailyChampionDay[], year: number): TitleRow[] {
  return players
    .map((player) => {
      const won = history.filter((d) => d.champion?.player.id === player.id)
      return {
        player,
        total: won.length,
        thisYear: won.filter((d) => d.day.startsWith(String(year))).length,
        lastWon: won[0]?.day ?? null,
      }
    })
    .sort((a, b) => b.total - a.total || b.thisYear - a.thisYear)
}

export interface DailyRound {
  index: number
  matches: Match[]
  rows: StandingRow[]
  winner: StandingRow | null
}

/**
 * Daily Champion standings, normalized to completed round-robins.
 * N = the minimum number of meetings over all pairs of that day's participants.
 * Only the first N meetings of each pair count, so every player is judged on the same schedule.
 */
export function computeDaily(players: Player[], dayMatches: Match[]): DailyResult {
  const sorted = sortAsc(dayMatches)
  const ids = new Set<string>()
  for (const m of sorted) {
    ids.add(m.home_player_id)
    ids.add(m.away_player_id)
  }
  const participants = players.filter((p) => ids.has(p.id))

  const byPair = new Map<string, Match[]>()
  for (const m of sorted) {
    const key = pairKey(m.home_player_id, m.away_player_id)
    byPair.set(key, [...(byPair.get(key) ?? []), m])
  }

  const pairs = allPairs(participants.map((p) => p.id)).map((pair) => ({
    pair,
    played: byPair.get(pairKey(...pair))?.length ?? 0,
  }))
  const sessions = pairs.length > 0 ? Math.min(...pairs.map((p) => p.played)) : 0

  const countedIds = new Set(
    pairs.flatMap(({ pair }) => (byPair.get(pairKey(...pair)) ?? []).slice(0, sessions).map((m) => m.id)),
  )
  const counted = sorted.filter((m) => countedIds.has(m.id))
  const excluded = sorted.filter((m) => !countedIds.has(m.id))
  const rows = sessions > 0 ? computeStandings(participants, counted) : []

  const rounds: DailyRound[] = Array.from({ length: sessions }, (_, k) => {
    const roundMatches = sortAsc(pairs.map(({ pair }) => byPair.get(pairKey(...pair))![k]))
    const roundRows = computeStandings(participants, roundMatches)
    return { index: k + 1, matches: roundMatches, rows: roundRows, winner: championOf(roundRows) }
  })

  return { participants, sessions, counted, excluded, pairs, rounds, rows, champion: championOf(rows) }
}
