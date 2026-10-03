import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Player } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function playerMap(players: Player[]): Map<string, Player> {
  return new Map(players.map((p) => [p.id, p]))
}

export const UNKNOWN_PLAYER: Player = {
  id: 'unknown',
  name: 'לא ידוע',
  emoji: '❔',
  color: '#7d8aa5',
  created_at: '',
}

export function formatStars(stars: number): string {
  return Number.isInteger(stars) ? `${stars}.0` : `${stars}`
}

export function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`
}
