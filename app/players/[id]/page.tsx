import { notFound } from 'next/navigation'
import { FormBadges } from '@/components/common/FormBadges'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import { MatchCard } from '@/components/match/MatchCard'
import { Card, CardTitle } from '@/components/ui/card'
import { getMatches, getPlayers } from '@/lib/data'
import { currentYear, yearOf } from '@/lib/dates'
import { involves } from '@/lib/match'
import { summarizePlayer } from '@/lib/playerStats'
import { computeStandings } from '@/lib/standings'
import { formatStars, playerMap, signed } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STREAK_LABEL = { W: 'ניצחונות', D: 'תיקו', L: 'הפסדים' } as const

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [players, matches] = await Promise.all([getPlayers(), getMatches()])
  const player = players.find((p) => p.id === id)
  if (!player) notFound()

  const s = summarizePlayer(id, players, matches)
  const year = currentYear()
  const rows = computeStandings(players, matches.filter((m) => yearOf(m.played_at) === year))
  const rank = rows.findIndex((r) => r.player.id === id) + 1
  const byId = playerMap(players)
  const recent = matches.filter((m) => involves(m, id)).slice(0, 5)

  const tiles = [
    { label: 'משחקים', value: s.played },
    { label: 'אחוז ניצחון', value: `${Math.round(s.winRate * 100)}%` },
    { label: 'הפרש שערים', value: signed(s.gf - s.ga) },
    { label: 'שערים למשחק', value: s.played ? (s.gf / s.played).toFixed(1) : '0' },
    { label: 'ממוצע כוכבים', value: `${formatStars(Math.round(s.avgStars * 10) / 10)}★` },
    { label: 'רצף שיא', value: s.longestWinStreak },
  ]

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-3xl border border-line p-6 text-center"
        style={{ background: `radial-gradient(circle at 50% 0%, ${player.color}40, transparent 70%)` }}
      >
        <PlayerAvatar player={player} size="xl" glow className="mx-auto" />
        <h1 className="mt-3 text-3xl font-black">{player.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {rank > 0 && s.played > 0 ? `מקום ${rank} בעונת ${year}` : 'עוד לא שיחק העונה'}
        </p>
        <div className="tabular mt-4 flex justify-center gap-6 text-lg font-black">
          <span className="text-neon">{s.w} נ׳</span>
          <span className="text-muted">{s.d} ת׳</span>
          <span className="text-danger">{s.l} ה׳</span>
        </div>
        <FormBadges form={s.form} className="mt-3 justify-center" />
        {s.currentStreak && s.currentStreak.length >= 2 && (
          <p className="mt-2 text-xs text-muted">
            {s.currentStreak.outcome === 'W' ? '🔥' : s.currentStreak.outcome === 'L' ? '🧊' : '😐'} רצף של{' '}
            {s.currentStreak.length} {STREAK_LABEL[s.currentStreak.outcome]}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-line bg-card px-2 py-3 text-center">
            <div className="tabular text-xl font-black">{t.value}</div>
            <div className="text-[11px] text-muted">{t.label}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardTitle>פרטים</CardTitle>
        <dl className="space-y-2 text-sm">
          <Row label="שערי זכות / חובה" value={`${s.gf} / ${s.ga}`} />
          <Row
            label="הארכות (נ-ת-ה)"
            value={s.extraTime.played ? `${s.extraTime.w}-${s.extraTime.d}-${s.extraTime.l}` : 'אין'}
          />
          <Row label="קבוצה אהובה" value={s.favoriteTeam ? `${s.favoriteTeam.team} (${s.favoriteTeam.count})` : 'אין'} />
          <Row label="ממוצע כוכבי היריב" value={`${formatStars(Math.round(s.avgOppStars * 10) / 10)}★`} />
          {s.biggestWin && (
            <Row
              label="הניצחון הגדול"
              value={`${Math.max(s.biggestWin.home_goals, s.biggestWin.away_goals)}–${Math.min(s.biggestWin.home_goals, s.biggestWin.away_goals)}`}
            />
          )}
        </dl>
      </Card>

      {s.headToHead.length > 0 && (
        <Card>
          <CardTitle>ראש בראש</CardTitle>
          <div className="space-y-3">
            {s.headToHead.map((h) => {
              const total = h.played || 1
              return (
                <div key={h.opponent.id}>
                  <div className="mb-1.5 flex items-center gap-2 text-sm">
                    <PlayerAvatar player={h.opponent} size="xs" />
                    <span className="flex-1 font-semibold">נגד {h.opponent.name}</span>
                    <span className="tabular text-xs text-muted">
                      {h.w}-{h.d}-{h.l} · {h.gf}:{h.ga}
                    </span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-bg">
                    <div className="bg-neon" style={{ width: `${(h.w / total) * 100}%` }} />
                    <div className="bg-muted/50" style={{ width: `${(h.d / total) * 100}%` }} />
                    <div className="bg-danger" style={{ width: `${(h.l / total) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {recent.length > 0 && (
        <section>
          <CardTitle>משחקים אחרונים</CardTitle>
          <div className="space-y-2">
            {recent.map((m) => (
              <MatchCard key={m.id} match={m} byId={byId} showDate />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}
