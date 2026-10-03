'use server'

import { revalidatePath } from 'next/cache'
import { playedAtForDay, todayKey } from '@/lib/dates'
import { getMatches } from '@/lib/data'
import { carriedMatches, sessionRemaining } from '@/lib/session'
import { getDb } from '@/lib/supabase'
import type { ActionResult, MatchInput, PlayerInput, Session } from '@/lib/types'
import { validateMatch, validatePlayer } from '@/lib/validation'

function fail(error: unknown): ActionResult {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  return { ok: false, error: 'משהו השתבש, נסו שוב' }
}

function refreshAll() {
  revalidatePath('/', 'layout')
}

function matchRow(input: MatchInput) {
  return {
    home_player_id: input.home_player_id,
    away_player_id: input.away_player_id,
    home_goals: input.home_goals,
    away_goals: input.away_goals,
    home_team: input.home_team?.trim() || null,
    away_team: input.away_team?.trim() || null,
    home_stars: input.home_stars,
    away_stars: input.away_stars,
    extra_time: input.extra_time,
  }
}

async function completeSessionIfDone(sessionId: string) {
  const db = getDb()
  const { data: session, error } = await db.from('sessions').select('*').eq('id', sessionId).single()
  if (error || !session) return
  const s = session as Session
  if (s.status !== 'active') return
  const all = await getMatches()
  const sessionMatches = all.filter((m) => m.session_id === sessionId)
  if (sessionRemaining(s, sessionMatches, carriedMatches(s, all)).length === 0) {
    await db
      .from('sessions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', sessionId)
  }
}

// ============ Matches ============

export async function createMatch(input: MatchInput): Promise<ActionResult> {
  const invalid = validateMatch(input)
  if (invalid) return { ok: false, error: invalid }
  try {
    const playedAt =
      !input.played_on || input.played_on === todayKey()
        ? new Date().toISOString()
        : playedAtForDay(input.played_on)
    const { error } = await getDb()
      .from('matches')
      .insert({ ...matchRow(input), session_id: input.session_id, played_at: playedAt })
    if (error) throw error
    if (input.session_id) await completeSessionIfDone(input.session_id)
    refreshAll()
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function updateMatch(id: string, input: MatchInput): Promise<ActionResult> {
  const invalid = validateMatch(input)
  if (invalid) return { ok: false, error: invalid }
  try {
    const { error } = await getDb()
      .from('matches')
      .update({
        ...matchRow(input),
        ...(input.played_on ? { played_at: playedAtForDay(input.played_on) } : {}),
      })
      .eq('id', id)
    if (error) throw error
    refreshAll()
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function deleteMatch(id: string): Promise<ActionResult> {
  try {
    const db = getDb()
    const { data: match } = await db.from('matches').select('session_id').eq('id', id).maybeSingle()
    const { error } = await db.from('matches').delete().eq('id', id)
    if (error) throw error
    // A deleted game re-opens a completed session's round-robin.
    if (match?.session_id) {
      await db
        .from('sessions')
        .update({ status: 'active', completed_at: null })
        .eq('id', match.session_id)
        .eq('status', 'completed')
    }
    refreshAll()
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

// ============ Sessions ============

export async function startSession(params: {
  playerIds: string[]
  firstHomeId: string
  firstAwayId: string
  draw: 'random' | 'manual'
}): Promise<ActionResult> {
  const { playerIds, firstHomeId, firstAwayId, draw } = params
  if (playerIds.length < 2) return { ok: false, error: 'צריך לפחות שני שחקנים' }
  if (firstHomeId === firstAwayId || !playerIds.includes(firstHomeId) || !playerIds.includes(firstAwayId)) {
    return { ok: false, error: 'המשחק הראשון לא תקין' }
  }
  try {
    const db = getDb()
    await db.from('sessions').update({ status: 'abandoned' }).eq('status', 'active')
    const { error } = await db.from('sessions').insert({
      player_ids: playerIds,
      first_home_id: firstHomeId,
      first_away_id: firstAwayId,
      first_draw: draw,
    })
    if (error) throw error
    refreshAll()
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function abandonSession(id: string): Promise<ActionResult> {
  try {
    const { error } = await getDb().from('sessions').update({ status: 'abandoned' }).eq('id', id)
    if (error) throw error
    refreshAll()
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

// ============ Players ============

export async function createPlayer(input: PlayerInput): Promise<ActionResult> {
  const invalid = validatePlayer(input)
  if (invalid) return { ok: false, error: invalid }
  try {
    const { error } = await getDb()
      .from('players')
      .insert({ name: input.name.trim(), emoji: input.emoji, color: input.color })
    if (error?.code === '23505') return { ok: false, error: 'כבר קיים שחקן בשם הזה' }
    if (error) throw error
    refreshAll()
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function updatePlayer(id: string, input: PlayerInput): Promise<ActionResult> {
  const invalid = validatePlayer(input)
  if (invalid) return { ok: false, error: invalid }
  try {
    const { error } = await getDb()
      .from('players')
      .update({ name: input.name.trim(), emoji: input.emoji, color: input.color })
      .eq('id', id)
    if (error?.code === '23505') return { ok: false, error: 'כבר קיים שחקן בשם הזה' }
    if (error) throw error
    refreshAll()
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export async function deletePlayer(id: string): Promise<ActionResult> {
  try {
    const { error } = await getDb().from('players').delete().eq('id', id)
    if (error?.code === '23503') return { ok: false, error: 'אי אפשר למחוק שחקן שיש לו משחקים' }
    if (error) throw error
    refreshAll()
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}
