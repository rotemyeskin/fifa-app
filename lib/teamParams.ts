export type TeamType = 'clubs' | 'national' | 'any'

export const TEAM_TYPES: { id: TeamType; label: string; emoji: string }[] = [
  { id: 'clubs', label: 'קבוצות רגילות', emoji: '🏟️' },
  { id: 'national', label: 'נבחרות', emoji: '🌍' },
  { id: 'any', label: 'כל האפשרויות', emoji: '🎲' },
]

export const STAR_OPTIONS = [2.5, 3, 3.5, 4, 4.5, 5]

export interface TeamParamsPrefs {
  enabled: boolean
  stars: number[]
  teamType: TeamType
}

export const DEFAULT_PREFS: TeamParamsPrefs = { enabled: false, stars: [4, 4.5, 5], teamType: 'any' }

/** The drawn constraints for one match: both players pick a team of this rating and type. */
export interface TeamParams {
  stars: number
  teamType: TeamType
}

export function drawTeamParams(prefs: TeamParamsPrefs): TeamParams {
  const pool = prefs.stars.length ? prefs.stars : DEFAULT_PREFS.stars
  return { stars: pool[Math.floor(Math.random() * pool.length)], teamType: prefs.teamType }
}

export function teamTypeLabel(type: TeamType): string {
  return TEAM_TYPES.find((t) => t.id === type)?.label ?? ''
}