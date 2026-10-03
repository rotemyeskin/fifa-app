'use client'

import { ChevronLeft, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createPlayer, deletePlayer, updatePlayer } from '@/app/actions'
import { PlayerAvatar } from '@/components/common/PlayerAvatar'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { Player, PlayerInput } from '@/lib/types'
import { cn } from '@/lib/utils'

const EMOJIS = ['⚽', '🦁', '🐺', '🦅', '🐉', '🔥', '⚡', '👑', '🚀', '🦈', '🐐', '💎', '🎯', '🥷', '🤖', '👽']
const COLORS = ['#2cf58a', '#8b5cf6', '#38bdf8', '#f43f5e', '#fbbf24', '#f97316', '#ec4899', '#c6ff3d']

export function PlayersManager({ players, games }: { players: Player[]; games: Record<string, number> }) {
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>שחקן חדש</CardTitle>
        <PlayerForm key={players.length} submitLabel="הוספה" onSubmit={createPlayer} />
      </Card>

      <div className="space-y-2">
        {players.map((p) =>
          editingId === p.id ? (
            <Card key={p.id}>
              <PlayerForm
                initial={p}
                submitLabel="שמירה"
                onSubmit={(input) => updatePlayer(p.id, input)}
                onDone={() => setEditingId(null)}
                onDelete={games[p.id] ? undefined : () => deletePlayer(p.id)}
              />
            </Card>
          ) : (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-line bg-card/80 p-3">
              <PlayerAvatar player={p} size="md" />
              <Link href={`/players/${p.id}`} className="min-w-0 flex-1">
                <p className="truncate font-bold">{p.name}</p>
                <p className="text-xs text-muted">{games[p.id] ?? 0} משחקים</p>
              </Link>
              <Button variant="ghost" size="icon" aria-label="עריכה" onClick={() => setEditingId(p.id)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Link href={`/players/${p.id}`} aria-label="פרופיל" className="text-muted">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </div>
          ),
        )}
      </div>
    </div>
  )
}

function PlayerForm({
  initial,
  submitLabel,
  onSubmit,
  onDone,
  onDelete,
}: {
  initial?: PlayerInput
  submitLabel: string
  onSubmit: (input: PlayerInput) => Promise<{ ok: boolean; error?: string }>
  onDone?: () => void
  onDelete?: () => Promise<{ ok: boolean; error?: string }>
}) {
  const [pending, startTransition] = useTransition()
  const [name, setName] = useState(initial?.name ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? EMOJIS[0])
  const [color, setColor] = useState(initial?.color ?? COLORS[0])

  function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    startTransition(async () => {
      const res = await action()
      if (!res.ok) toast.error(res.error ?? 'שגיאה')
      else {
        toast.success(success)
        onDone?.()
      }
    })
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        run(() => onSubmit({ name, emoji, color }), initial ? 'השחקן עודכן' : `${emoji} ${name} הצטרף לליגה!`)
      }}
    >
      <div className="flex items-center gap-3">
        <PlayerAvatar player={{ name, emoji, color }} size="lg" glow />
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="שם השחקן" maxLength={30} required />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEmoji(e)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg text-lg transition',
              emoji === e ? 'bg-line ring-2 ring-neon' : 'bg-bg/60 hover:bg-line',
            )}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={c}
            onClick={() => setColor(c)}
            className={cn('h-8 w-8 rounded-full transition', color === c && 'ring-2 ring-white ring-offset-2 ring-offset-card')}
            style={{ background: c }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={pending || !name.trim()}>
          {submitLabel}
        </Button>
        {onDone && (
          <Button variant="secondary" onClick={onDone}>
            ביטול
          </Button>
        )}
        {onDelete && (
          <Button
            variant="destructive"
            size="icon"
            aria-label="מחיקה"
            disabled={pending}
            onClick={() => confirm('למחוק את השחקן?') && run(onDelete, 'השחקן נמחק')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  )
}
