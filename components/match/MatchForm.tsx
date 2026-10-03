'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Timer, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createMatch, deleteMatch, updateMatch } from '@/app/actions'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { formatDayKey, todayKey } from '@/lib/dates'
import type { MatchInput, Player } from '@/lib/types'
import { cn, UNKNOWN_PLAYER } from '@/lib/utils'
import { DateField } from './DateField'
import { PlayerPicker } from './PlayerPicker'
import { ScoreStepper } from './ScoreStepper'
import { StarRating } from './StarRating'

interface MatchFormProps {
  players: Player[]
  initial?: Partial<MatchInput>
  matchId?: string
  sessionId?: string | null
  lockPlayers?: boolean
  onSaved?: () => void
}

export function MatchForm({ players, initial, matchId, sessionId = null, lockPlayers, onSaved }: MatchFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const isEdit = Boolean(matchId)
  const initialDay = initial?.played_on ?? todayKey()

  const [homeId, setHomeId] = useState(initial?.home_player_id ?? players[0]?.id ?? '')
  const [awayId, setAwayId] = useState(initial?.away_player_id ?? players[1]?.id ?? '')
  const [homeGoals, setHomeGoals] = useState(initial?.home_goals ?? 0)
  const [awayGoals, setAwayGoals] = useState(initial?.away_goals ?? 0)
  const [homeTeam, setHomeTeam] = useState(initial?.home_team ?? '')
  const [awayTeam, setAwayTeam] = useState(initial?.away_team ?? '')
  const [homeStars, setHomeStars] = useState(initial?.home_stars ?? 4.5)
  const [awayStars, setAwayStars] = useState(initial?.away_stars ?? 4.5)
  const [extraTime, setExtraTime] = useState(initial?.extra_time ?? false)
  const [day, setDay] = useState(initialDay)

  const byId = new Map(players.map((p) => [p.id, p]))
  const home = byId.get(homeId) ?? UNKNOWN_PLAYER
  const away = byId.get(awayId) ?? UNKNOWN_PLAYER
  const draw = homeGoals === awayGoals
  const winner = draw ? null : homeGoals > awayGoals ? home : away

  function pickHome(id: string) {
    if (id === awayId) setAwayId(homeId)
    setHomeId(id)
  }

  function pickAway(id: string) {
    if (id === homeId) setHomeId(awayId)
    setAwayId(id)
  }

  function submit() {
    const input: MatchInput = {
      home_player_id: homeId,
      away_player_id: awayId,
      home_goals: homeGoals,
      away_goals: awayGoals,
      home_team: homeTeam || null,
      away_team: awayTeam || null,
      home_stars: homeStars,
      away_stars: awayStars,
      extra_time: extraTime,
      played_on: day === initialDay && isEdit ? null : day,
      session_id: sessionId,
    }
    startTransition(async () => {
      const res = matchId ? await updateMatch(matchId, input) : await createMatch(input)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      const hi = Math.max(homeGoals, awayGoals)
      const lo = Math.min(homeGoals, awayGoals)
      toast.success(
        isEdit ? 'המשחק עודכן ✅' : winner ? `⚽ ${winner.name} ניצח ${hi}–${lo}` : `🤝 תיקו ${hi}–${lo}`,
      )
      if (onSaved) onSaved()
      else router.push(isEdit ? '/history' : '/')
    })
  }

  function remove() {
    if (!matchId || !confirm('למחוק את המשחק?')) return
    startTransition(async () => {
      const res = await deleteMatch(matchId)
      if (!res.ok) toast.error(res.error)
      else {
        toast.success('המשחק נמחק')
        router.push('/history')
      }
    })
  }

  return (
    <div className="space-y-4">
      {!lockPlayers && (
        <Card>
          <CardTitle>מי שיחק?</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-2 text-xs font-bold text-neon">🏠 בית</p>
              <PlayerPicker players={players} value={homeId} onChange={pickHome} disabledId={awayId} />
            </div>
            <div>
              <p className="mb-2 text-xs font-bold text-violet">✈️ חוץ</p>
              <PlayerPicker players={players} value={awayId} onChange={pickAway} disabledId={homeId} />
            </div>
          </div>
        </Card>
      )}

      <Card className="pitch-lines relative overflow-hidden p-5">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-white/5" />
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
          <SideHeader player={home} winner={winner?.id === home.id} />
          <span className="pt-6 text-xs font-bold text-muted">VS</span>
          <SideHeader player={away} winner={winner?.id === away.id} />

          <div className="flex justify-center">
            <ScoreStepper value={homeGoals} onChange={setHomeGoals} highlight={winner?.id === home.id} />
          </div>
          <span className="self-center text-5xl font-black text-muted">:</span>
          <div className="flex justify-center">
            <ScoreStepper value={awayGoals} onChange={setAwayGoals} highlight={winner?.id === away.id} />
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={winner?.id ?? 'draw'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={cn('mt-4 text-center text-sm font-bold', winner ? 'text-neon' : 'text-muted')}
          >
            {winner ? `🏆 ניצחון ל${winner.name}` : extraTime ? '🤝 תיקו גם אחרי 120 דקות' : '🤝 תיקו'}
          </motion.p>
        </AnimatePresence>
      </Card>

      <Card>
        <CardTitle>קבוצות ודירוג כוכבים</CardTitle>
        <div className="grid grid-cols-2 gap-3">
          <TeamFields team={homeTeam} onTeam={setHomeTeam} stars={homeStars} onStars={setHomeStars} />
          <TeamFields team={awayTeam} onTeam={setAwayTeam} stars={awayStars} onStars={setAwayStars} />
        </div>
      </Card>

      <Card className={cn('transition-colors', extraTime && 'border-violet/50 bg-violet/10')}>
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            <Timer className={cn('h-6 w-6', extraTime ? 'text-violet' : 'text-muted')} />
            <span>
              <span className="block font-bold">שוחקה הארכה (120 דק׳)</span>
              <span className="block text-xs text-muted">
                מסמנים אם היה תיקו אחרי 90 דקות. התוצאה למעלה היא התוצאה הסופית.
              </span>
            </span>
          </span>
          <Switch checked={extraTime} onChange={setExtraTime} label="שוחקה הארכה" />
        </label>
      </Card>

      <Card>
        <CardTitle icon={<CalendarDays className="h-4 w-4" />}>
          תאריך · {day === todayKey() ? 'היום' : formatDayKey(day)}
        </CardTitle>
        <DateField value={day} onChange={setDay} max={todayKey()} />
      </Card>

      <Button size="lg" className="w-full" disabled={pending || !homeId || !awayId} onClick={submit}>
        {pending ? 'שומר...' : isEdit ? 'שמור שינויים' : 'שמור משחק ⚽'}
      </Button>

      {isEdit && (
        <Button variant="destructive" className="w-full" disabled={pending} onClick={remove}>
          <Trash2 className="h-4 w-4" />
          מחק משחק
        </Button>
      )}
    </div>
  )
}

function SideHeader({ player, winner }: { player: Player; winner: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <PlayerAvatar player={player} size="lg" glow={winner} />
      <span className="max-w-full truncate text-sm font-bold">{player.name}</span>
    </div>
  )
}

function TeamFields({
  team,
  onTeam,
  stars,
  onStars,
}: {
  team: string
  onTeam: (v: string) => void
  stars: number
  onStars: (v: number) => void
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Input
        value={team}
        onChange={(e) => onTeam(e.target.value)}
        placeholder="קבוצה (רשות)"
        maxLength={40}
        className="h-10 text-center text-sm"
      />
      <StarRating value={stars} onChange={onStars} size={22} />
    </div>
  )
}
