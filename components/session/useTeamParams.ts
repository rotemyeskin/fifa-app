'use client'

import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_PREFS, STAR_OPTIONS, TEAM_TYPES, type TeamParams, type TeamParamsPrefs } from '@/lib/teamParams'

const PREFS_KEY = 'fifa:team-params-prefs'
const DRAWN_KEY = 'fifa:team-params-drawn'

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function sanitize(prefs: Partial<TeamParamsPrefs> | null): TeamParamsPrefs {
  const stars = (prefs?.stars ?? []).filter((s) => STAR_OPTIONS.includes(s))
  const teamType = TEAM_TYPES.some((t) => t.id === prefs?.teamType) ? prefs!.teamType! : DEFAULT_PREFS.teamType
  return {
    enabled: Boolean(prefs?.enabled),
    stars: stars.length ? stars : DEFAULT_PREFS.stars,
    teamType,
  }
}

/** Draw preferences, remembered on this device. Starts from defaults to keep server and client renders equal. */
export function useTeamParamsPrefs() {
  const [prefs, setPrefs] = useState<TeamParamsPrefs>(DEFAULT_PREFS)

  useEffect(() => {
    setPrefs(sanitize(readJson<TeamParamsPrefs>(PREFS_KEY)))
  }, [])

  const update = useCallback((patch: Partial<TeamParamsPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch }
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return [prefs, update] as const
}

/** Team params drawn for a specific matchup, so they survive starting the session or a page reload. */
export function saveDrawnParams(matchupKey: string, params: TeamParams | null) {
  if (params) window.localStorage.setItem(DRAWN_KEY, JSON.stringify({ matchupKey, params }))
  else window.localStorage.removeItem(DRAWN_KEY)
}

export function loadDrawnParams(matchupKey: string): TeamParams | null {
  const stored = readJson<{ matchupKey: string; params: TeamParams }>(DRAWN_KEY)
  return stored?.matchupKey === matchupKey ? stored.params : null
}
