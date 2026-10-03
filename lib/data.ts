import { getDb } from './supabase'
import type { Match, Player, Session } from './types'

const PAGE_SIZE = 1000

type MatchRow = Omit<Match, 'home_stars' | 'away_stars'> & {
  home_stars: number | string
  away_stars: number | string
}

function normalizeMatch(row: MatchRow): Match {
  return { ...row, home_stars: Number(row.home_stars), away_stars: Number(row.away_stars) }
}

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await getDb().from('players').select('*').order('created_at')
  if (error) throw new Error(error.message)
  return (data ?? []) as Player[]
}

/** All matches, newest first. Paginates past PostgREST's 1000-row cap. */
export async function getMatches(): Promise<Match[]> {
  const all: Match[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await getDb()
      .from('matches')
      .select('*')
      .order('played_at', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(error.message)
    const rows = (data ?? []) as MatchRow[]
    all.push(...rows.map(normalizeMatch))
    if (rows.length < PAGE_SIZE) break
  }
  return all
}

export async function getMatch(id: string): Promise<Match | null> {
  const { data, error } = await getDb().from('matches').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? normalizeMatch(data as MatchRow) : null
}

export async function getLatestSession(): Promise<Session | null> {
  const { data, error } = await getDb()
    .from('sessions')
    .select('*')
    .neq('status', 'abandoned')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as Session) ?? null
}

export async function getActiveSession(): Promise<Session | null> {
  const { data, error } = await getDb()
    .from('sessions')
    .select('*')
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as Session) ?? null
}

export async function getSessionMatches(sessionId: string): Promise<Match[]> {
  const { data, error } = await getDb()
    .from('matches')
    .select('*')
    .eq('session_id', sessionId)
    .order('played_at')
  if (error) throw new Error(error.message)
  return ((data ?? []) as MatchRow[]).map(normalizeMatch)
}
