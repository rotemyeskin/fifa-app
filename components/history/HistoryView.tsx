'use client'

import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { MatchCard } from '@/components/match/MatchCard'
import { Card } from '@/components/ui/card'
import { Chip } from '@/components/ui/chip'
import { Select } from '@/components/ui/input'
import { dayKey, formatDayKey, yearOf } from '@/lib/dates'
import { involves, isDraw, viewFor } from '@/lib/match'
import type { Match, Player } from '@/lib/types'

export function HistoryView({ players, matches }: { players: Player[]; matches: Match[] }) {
  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players])
  const years = useMemo(() => [...new Set(matches.map((m) => yearOf(m.played_at)))].sort((a, b) => b - a), [matches])

  const [playerId, setPlayerId] = useState<string | null>(null)
  const [opponentId, setOpponentId] = useState<string | null>(null)
  const [year, setYear] = useState<number | null>(null)
  const [onlyExtraTime, setOnlyExtraTime] = useState(false)
  const [onlyDraws, setOnlyDraws] = useState(false)

  const filtered = useMemo(
    () =>
      matches.filter(
        (m) =>
          (!playerId || involves(m, playerId)) &&
          (!opponentId || involves(m, opponentId)) &&
          (!year || yearOf(m.played_at) === year) &&
          (!onlyExtraTime || m.extra_time) &&
          (!onlyDraws || isDraw(m)),
      ),
    [matches, playerId, opponentId, year, onlyExtraTime, onlyDraws],
  )

  const groups = useMemo(() => {
    const map = new Map<string, Match[]>()
    for (const m of filtered) {
      const key = dayKey(m.played_at)
      map.set(key, [...(map.get(key) ?? []), m])
    }
    return [...map.entries()]
  }, [filtered])

  const record = useMemo(() => {
    if (!playerId) return null
    let w = 0
    let d = 0
    let l = 0
    for (const m of filtered) {
      const v = viewFor(m, playerId)
      if (!v) continue
      if (v.outcome === 'W') w++
      else if (v.outcome === 'D') d++
      else l++
    }
    return { w, d, l }
  }, [filtered, playerId])

  function selectPlayer(id: string | null) {
    setPlayerId(id)
    if (id === null || id === opponentId) setOpponentId(null)
  }

  const player = playerId ? byId.get(playerId) : null
  const opponent = opponentId ? byId.get(opponentId) : null

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <Chip active={!playerId} onClick={() => selectPlayer(null)}>
            כולם
          </Chip>
          {players.map((p) => (
            <Chip key={p.id} active={playerId === p.id} onClick={() => selectPlayer(p.id)}>
              {p.emoji} {p.name}
            </Chip>
          ))}
        </div>

        {playerId && (
          <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4">
            <span className="shrink-0 text-xs text-muted">נגד:</span>
            <Chip active={!opponentId} onClick={() => setOpponentId(null)}>
              כל היריבים
            </Chip>
            {players
              .filter((p) => p.id !== playerId)
              .map((p) => (
                <Chip key={p.id} active={opponentId === p.id} onClick={() => setOpponentId(p.id)}>
                  {p.emoji} {p.name}
                </Chip>
              ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {years.length > 1 && (
            <Select
              value={year ?? ''}
              onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)}
              aria-label="שנה"
            >
              <option value="">כל השנים</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          )}
          <Chip active={onlyExtraTime} onClick={() => setOnlyExtraTime((v) => !v)}>
            ⏱️ הארכה
          </Chip>
          <Chip active={onlyDraws} onClick={() => setOnlyDraws((v) => !v)}>
            🤝 תיקו
          </Chip>
        </div>
      </Card>

      {player && record && (
        <div className="flex items-center justify-between rounded-2xl border border-line bg-card2 px-4 py-3 text-sm">
          <span className="font-bold">
            {player.name}
            {opponent ? ` נגד ${opponent.name}` : ''}
          </span>
          <span className="tabular flex gap-3 font-bold">
            <span className="text-neon">{record.w} נ׳</span>
            <span className="text-muted">{record.d} ת׳</span>
            <span className="text-danger">{record.l} ה׳</span>
          </span>
        </div>
      )}

      <p className="text-xs text-muted">{filtered.length} משחקים</p>

      {groups.length === 0 ? (
        <EmptyState emoji="🔍" title="לא נמצאו משחקים" description="נסו לשנות את הסינון" />
      ) : (
        groups.map(([key, dayMatches], gi) => (
          <motion.section
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(gi, 6) * 0.04 }}
          >
            <h3 className="sticky top-0 z-10 -mx-4 mb-2 bg-bg/85 px-4 py-2 text-sm font-bold text-muted backdrop-blur">
              {formatDayKey(key)}
            </h3>
            <div className="space-y-2">
              {dayMatches.map((m) => (
                <MatchCard key={m.id} match={m} byId={byId} editable />
              ))}
            </div>
          </motion.section>
        ))
      )}
    </div>
  )
}
