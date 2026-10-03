import type { MatchInput, PlayerInput } from './types'

export function validStars(stars: number): boolean {
  return Number.isFinite(stars) && stars >= 0 && stars <= 5 && Number.isInteger(stars * 2)
}

export function validateMatch(input: MatchInput): string | null {
  if (!input.home_player_id || !input.away_player_id) return 'יש לבחור שני שחקנים'
  if (input.home_player_id === input.away_player_id) return 'שחקן לא יכול לשחק נגד עצמו'
  for (const goals of [input.home_goals, input.away_goals]) {
    if (!Number.isInteger(goals) || goals < 0 || goals > 99) return 'מספר השערים לא תקין'
  }
  if (!validStars(input.home_stars) || !validStars(input.away_stars)) {
    return 'דירוג הכוכבים חייב להיות בין 0 ל-5 בקפיצות של חצי'
  }
  if (input.played_on && !/^\d{4}-\d{2}-\d{2}$/.test(input.played_on)) return 'תאריך לא תקין'
  return null
}

export function validatePlayer(input: PlayerInput): string | null {
  const name = input.name.trim()
  if (!name) return 'יש להזין שם'
  if (name.length > 30) return 'השם ארוך מדי'
  if (!/^#[0-9a-fA-F]{6}$/.test(input.color)) return 'צבע לא תקין'
  return null
}
