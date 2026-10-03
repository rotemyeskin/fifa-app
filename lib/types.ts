export interface Player {
  id: string
  name: string
  emoji: string
  color: string
  created_at: string
}

export interface Match {
  id: string
  session_id: string | null
  home_player_id: string
  away_player_id: string
  home_goals: number
  away_goals: number
  home_team: string | null
  away_team: string | null
  home_stars: number
  away_stars: number
  extra_time: boolean
  played_at: string
  created_at: string
}

export type SessionStatus = 'active' | 'completed' | 'abandoned'

export interface Session {
  id: string
  player_ids: string[]
  first_home_id: string
  first_away_id: string
  first_draw: 'random' | 'manual'
  status: SessionStatus
  started_at: string
  completed_at: string | null
}

export interface MatchInput {
  home_player_id: string
  away_player_id: string
  home_goals: number
  away_goals: number
  home_team: string | null
  away_team: string | null
  home_stars: number
  away_stars: number
  extra_time: boolean
  /** YYYY-MM-DD (Israel time). null = keep existing / now. */
  played_on: string | null
  session_id: string | null
}

export interface PlayerInput {
  name: string
  emoji: string
  color: string
}

export type ActionResult = { ok: true } | { ok: false; error: string }
