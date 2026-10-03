export const TIME_ZONE = 'Asia/Jerusalem'

const dayKeyFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const longDayFormat = new Intl.DateTimeFormat('he-IL', {
  timeZone: TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const shortDayFormat = new Intl.DateTimeFormat('he-IL', {
  timeZone: TIME_ZONE,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const timeFormat = new Intl.DateTimeFormat('he-IL', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
})

/** YYYY-MM-DD in Israel time. */
export function dayKey(date: Date | string): string {
  return dayKeyFormat.format(new Date(date))
}

export function yearOf(date: Date | string): number {
  return Number(dayKey(date).slice(0, 4))
}

export function todayKey(): string {
  return dayKey(new Date())
}

export function currentYear(): number {
  return yearOf(new Date())
}

/** Noon is always inside the same Israeli calendar day regardless of DST (+02:00 / +03:00). */
export function playedAtForDay(day: string): string {
  return new Date(`${day}T12:00:00+02:00`).toISOString()
}

export function formatLongDay(date: Date | string): string {
  return longDayFormat.format(new Date(date))
}

export function formatShortDay(date: Date | string): string {
  return shortDayFormat.format(new Date(date))
}

export function formatTime(date: Date | string): string {
  return timeFormat.format(new Date(date))
}

/** Format a YYYY-MM-DD key without timezone drift. */
export function formatDayKey(key: string, style: 'long' | 'short' = 'long'): string {
  const date = playedAtForDay(key)
  return style === 'long' ? formatLongDay(date) : formatShortDay(date)
}
