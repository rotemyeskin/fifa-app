import { POINTS, type Outcome } from './match'

export type OutcomePredicate = (o: Outcome) => boolean

export const isWin: OutcomePredicate = (o) => o === 'W'
export const isLoss: OutcomePredicate = (o) => o === 'L'
export const isUnbeaten: OutcomePredicate = (o) => o !== 'L'
export const isWinless: OutcomePredicate = (o) => o !== 'W'

/** Length of the run that ends with the most recent result. Outcomes are oldest first. */
export function currentRun(outcomes: Outcome[], pred: OutcomePredicate): number {
  let run = 0
  for (let i = outcomes.length - 1; i >= 0 && pred(outcomes[i]); i--) run++
  return run
}

export function longestRun(outcomes: Outcome[], pred: OutcomePredicate): number {
  let best = 0
  let run = 0
  for (const o of outcomes) {
    run = pred(o) ? run + 1 : 0
    best = Math.max(best, run)
  }
  return best
}

export interface Momentum {
  /** 0–100, recency-weighted share of available points. */
  score: number
  label: string
  emoji: string
  trend: 'up' | 'down' | 'flat'
}

const MOMENTUM_WINDOW = 6

/** Weighted form over the last six games: the most recent game counts six times as much as the oldest. */
export function computeMomentum(outcomes: Outcome[]): Momentum | null {
  const recent = outcomes.slice(-MOMENTUM_WINDOW)
  if (recent.length === 0) return null

  let earned = 0
  let possible = 0
  recent.forEach((o, i) => {
    const weight = i + 1
    earned += weight * POINTS[o]
    possible += weight * 3
  })
  const score = Math.round((earned / possible) * 100)

  const avg = (list: Outcome[]) => (list.length ? list.reduce((s, o) => s + POINTS[o], 0) / list.length : 0)
  const last3 = outcomes.slice(-3)
  const prev3 = outcomes.slice(-6, -3)
  const delta = prev3.length === 3 ? avg(last3) - avg(prev3) : 0
  const trend = delta > 0.3 ? 'up' : delta < -0.3 ? 'down' : 'flat'

  const [label, emoji] =
    score >= 80 ? ['בוער', '🔥'] : score >= 60 ? ['בעלייה', '📈'] : score >= 40 ? ['יציב', '😐'] : score >= 20 ? ['מתקרר', '📉'] : ['קפוא', '🥶']

  return { score, label, emoji, trend }
}
