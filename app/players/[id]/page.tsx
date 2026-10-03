import { TrendingDown, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FormBadges } from '@/components/common/FormBadges'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import { MatchCard } from '@/components/match/MatchCard'
import { Card, CardTitle } from '@/components/ui/card'
import { dailyChampionHistory } from '@/lib/daily'
import { getMatches, getPlayers } from '@/lib/data'
import { computeStarBreakdown } from '@/lib/starStats'
import { currentYear, formatShortDay } from '@/lib/dates'
import { involves, viewFor } from '@/lib/match'
import { summarizePlayer } from '@/lib/playerStats'
import type { Match, Player } from '@/lib/types'
import { cn, formatStars, playerMap, signed } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STREAK_LABEL = { W: 'ניצחונות', D: 'תיקו', L: 'הפסדים' } as const

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [players, matches] = await Promise.all([getPlayers(), getMatches()])
  const player = players.find((p) => p.id === id)
  if (!player) notFound()

  const s = summarizePlayer(id, players, matches)
  const year = currentYear()
  const thisSeason = s.seasons.find((x) => x.year === year)
  const byId = playerMap(players)
  const recent = matches.filter((m) => involves(m, id)).slice(0, 5)
  const dailyTitles = dailyChampionHistory(players, matches).filter((d) => d.champion?.player.id === id).length
  const starRow = computeStarBreakdown([player], matches).rows[0]

  const tiles = [
    { label: 'משחקים', value: s.played },
    { label: 'אחוז ניצחון', value: `${Math.round(s.winRate * 100)}%` },
    { label: 'הפרש שערים', value: signed(s.gf - s.ga) },
    { label: 'שערים למשחק', value: s.played ? (s.gf / s.played).toFixed(1) : '0' },
    { label: 'ספיגות למשחק', value: s.played ? (s.ga / s.played).toFixed(1) : '0' },
    { label: 'ממוצע כוכבים', value: `${formatStars(Math.round(s.avgStars * 10) / 10)}★` },
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
          {thisSeason ? `מקום ${thisSeason.rank} בעונת ${year} · ${thisSeason.pts} נק׳` : 'עוד לא שיחק העונה'}
        </p>
        <div className="tabular mt-4 flex justify-center gap-6 text-lg font-black">
          <span className="text-neon">{s.w} נ׳</span>
          <span className="text-muted">{s.d} ת׳</span>
          <span className="text-danger">{s.l} ה׳</span>
        </div>
        {dailyTitles > 0 && (
          <Link
            href="/daily"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold"
          >
            👑 {dailyTitles === 1 ? 'תואר אלוף יומי אחד' : `${dailyTitles} תארי אלוף יומי`}
          </Link>
        )}
        <FormBadges form={s.form} className="mt-3 justify-center" />
        {s.currentStreak && s.currentStreak.length >= 2 && (
          <p className="mt-2 text-xs text-muted">
            {s.currentStreak.outcome === 'W' ? '🔥' : s.currentStreak.outcome === 'L' ? '🧊' : '😐'} רצף נוכחי של{' '}
            {s.currentStreak.length} {STREAK_LABEL[s.currentStreak.outcome]}
          </p>
        )}
      </div>

      {s.momentum && (
        <Card>
          <CardTitle>מומנטום</CardTitle>
          <div className="flex items-center gap-4">
            <MomentumGauge score={s.momentum.score} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-xl font-black">
                {s.momentum.emoji} {s.momentum.label}
                {s.momentum.trend === 'up' && <TrendingUp className="h-5 w-5 text-neon" />}
                {s.momentum.trend === 'down' && <TrendingDown className="h-5 w-5 text-danger" />}
              </p>
              <p className="mt-1 text-xs text-muted">
                אחוז הנקודות מ-6 המשחקים האחרונים, כשהמשחק האחרון שווה הכי הרבה.
                {s.momentum.trend === 'up' && ' המגמה בעלייה לעומת 3 המשחקים שלפני.'}
                {s.momentum.trend === 'down' && ' המגמה בירידה לעומת 3 המשחקים שלפני.'}
              </p>
              {s.currentUnbeaten >= 2 && (
                <p className="mt-1 text-xs font-semibold text-neon">🛡️ {s.currentUnbeaten} משחקים ללא הפסד</p>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-2">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-xl border border-line bg-card px-2 py-3 text-center">
            <div className="tabular text-xl font-black">{t.value}</div>
            <div className="text-[11px] text-muted">{t.label}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardTitle>שיאים אישיים</CardTitle>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <RecordTile emoji="💥" label="הניצחון הגדול" match={s.biggestWin} playerId={id} byId={byId} />
          <RecordTile emoji="😵" label="ההפסד הכי כואב" match={s.biggestLoss} playerId={id} byId={byId} />
          <RecordTile emoji="🎯" label="הכי הרבה שערים במשחק" match={s.mostGoals} playerId={id} byId={byId} />
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <Stat label="🚀 רצף ניצחונות שיא" value={s.longestWinStreak} />
          <Stat label="🛡️ רצף ללא הפסד" value={s.longestUnbeaten} />
          <Stat label="🥶 רצף הפסדים שיא" value={s.longestLossStreak} />
          <Stat label="🧤 משחקים בלי לספוג" value={s.cleanSheets} />
          <Stat label="🚫 משחקים בלי להבקיע" value={s.blanks} />
          <Stat label="🐶 ניצחונות אנדרדוג" value={s.underdogWins} />
          <Stat
            label="⏱️ הארכות (נ-ת-ה)"
            value={s.extraTime.played ? `${s.extraTime.w}-${s.extraTime.d}-${s.extraTime.l}` : '—'}
          />
          <Stat label="💍 קבוצה אהובה" value={s.favoriteTeam ? s.favoriteTeam.team : '—'} />
        </dl>
      </Card>

      {starRow && (
        <Card>
          <CardTitle>⭐ ניצחונות לפי דירוג הקבוצה</CardTitle>
          <div className="space-y-2">
            {[...starRow.cells.entries()]
              .sort(([a], [b]) => b - a)
              .map(([stars, cell]) => (
                <div key={stars} className="flex items-center gap-3 text-sm">
                  <span className="tabular w-12 font-bold text-gold">{formatStars(stars)}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
                    <div className="h-full rounded-full bg-neon" style={{ width: `${(cell.wins / cell.played) * 100}%` }} />
                  </div>
                  <span className="tabular w-24 text-end text-xs text-muted">
                    <span className="text-base font-black text-white">{cell.wins}</span> / {cell.played} ·{' '}
                    {Math.round((cell.wins / cell.played) * 100)}%
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}

      {s.headToHead.length > 0 && (
        <section className="space-y-2">
          <CardTitle>ראש בראש</CardTitle>
          {s.headToHead.map((h) => {
            const total = h.played || 1
            const leading = h.w > h.l ? 'win' : h.w < h.l ? 'loss' : 'even'
            return (
              <Card key={h.opponent.id}>
                <Link href={`/players/${h.opponent.id}`} className="group mb-3 flex items-center gap-3">
                  <PlayerAvatar player={h.opponent} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold group-hover:text-neon">נגד {h.opponent.name}</p>
                    <p className="text-xs text-muted">
                      {h.played} משחקים · שערים {h.gf}:{h.ga} · {h.pts} נק׳
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-bold',
                      leading === 'win' && 'bg-neon/15 text-neon',
                      leading === 'loss' && 'bg-danger/15 text-danger',
                      leading === 'even' && 'bg-muted/15 text-muted',
                    )}
                  >
                    {leading === 'win' ? 'מוביל' : leading === 'loss' ? 'מפגר' : 'שוויון'}
                  </span>
                </Link>

                <div className="tabular mb-1.5 flex justify-between text-xs font-bold">
                  <span className="text-neon">{h.w} ניצחונות</span>
                  <span className="text-muted">{h.d} תיקו</span>
                  <span className="text-danger">{h.l} הפסדים</span>
                </div>
                <div className="flex h-2.5 overflow-hidden rounded-full bg-bg">
                  <div className="bg-neon" style={{ width: `${(h.w / total) * 100}%` }} />
                  <div className="bg-muted/50" style={{ width: `${(h.d / total) * 100}%` }} />
                  <div className="bg-danger" style={{ width: `${(h.l / total) * 100}%` }} />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted">5 אחרונים:</span>
                  <FormBadges form={h.form} />
                </div>
                <dl className="mt-2 space-y-1 text-xs">
                  {h.biggestWin && <MiniRow label="💥 הניצחון הגדול" match={h.biggestWin} playerId={id} />}
                  {h.biggestLoss && <MiniRow label="😵 ההפסד הגדול" match={h.biggestLoss} playerId={id} />}
                  {h.lastMatch && <MiniRow label="🕒 המפגש האחרון" match={h.lastMatch} playerId={id} />}
                </dl>
              </Card>
            )
          })}
        </section>
      )}

      {s.seasons.length > 0 && (
        <Card>
          <CardTitle>לפי עונות</CardTitle>
          <div className="divide-y divide-line text-sm">
            {s.seasons.map((x) => (
              <div key={x.year} className="tabular flex items-center justify-between py-2">
                <span className="font-bold">
                  {x.rank === 1 ? '🏆 ' : ''}
                  {x.year}
                </span>
                <span className="text-muted">
                  מקום {x.rank} · {x.w}-{x.d}-{x.l} · {x.gf}:{x.ga}
                </span>
                <span className="font-black">{x.pts} נק׳</span>
              </div>
            ))}
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

function MomentumGauge({ score }: { score: number }) {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const color = score >= 60 ? '#2cf58a' : score >= 40 ? '#38bdf8' : '#f43f5e'
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#1c2740" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <span className="tabular absolute inset-0 flex items-center justify-center text-lg font-black">{score}%</span>
    </div>
  )
}

function scoreFor(match: Match, playerId: string): string {
  const v = viewFor(match, playerId)
  return v ? `${v.gf}–${v.ga}` : ''
}

function RecordTile({
  emoji,
  label,
  match,
  playerId,
  byId,
}: {
  emoji: string
  label: string
  match: Match | null
  playerId: string
  byId: Map<string, Player>
}) {
  const view = match ? viewFor(match, playerId) : null
  const opponent = view ? byId.get(view.opponentId) : undefined
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-bg/40 p-3">
      <span className="text-2xl">{emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">{label}</p>
        {match && view ? (
          <p className="truncate text-sm font-bold">
            <span className="tabular text-base font-black">{scoreFor(match, playerId)}</span> נגד {opponent?.name ?? '?'}
            <span className="font-normal text-muted"> · {formatShortDay(match.played_at)}</span>
          </p>
        ) : (
          <p className="text-sm text-muted">עוד אין</p>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-bg/40 px-3 py-2">
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className="tabular truncate text-base font-black">{value}</dd>
    </div>
  )
}

function MiniRow({ label, match, playerId }: { label: string; match: Match; playerId: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className="tabular font-bold">
        {scoreFor(match, playerId)}
        {match.extra_time ? ' (הארכה)' : ''}
        <span className="font-normal text-muted"> · {formatShortDay(match.played_at)}</span>
      </dd>
    </div>
  )
}
