'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Shuffle } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { STAR_OPTIONS, TEAM_TYPES, type TeamParamsPrefs } from '@/lib/teamParams'
import { cn, formatStars } from '@/lib/utils'

export function TeamParamsConfig({
  prefs,
  onChange,
}: {
  prefs: TeamParamsPrefs
  onChange: (patch: Partial<TeamParamsPrefs>) => void
}) {
  function toggleStar(star: number) {
    const has = prefs.stars.includes(star)
    if (has && prefs.stars.length === 1) return
    onChange({ stars: has ? prefs.stars.filter((s) => s !== star) : [...prefs.stars, star].sort((a, b) => a - b) })
  }

  return (
    <div className={cn('rounded-2xl border p-3 transition-colors', prefs.enabled ? 'border-gold/40 bg-gold/5' : 'border-line bg-bg/40')}>
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="flex items-center gap-2.5">
          <Shuffle className={cn('h-5 w-5', prefs.enabled ? 'text-gold' : 'text-muted')} />
          <span>
            <span className="block text-sm font-bold">הגרל נתוני קבוצות</span>
            <span className="block text-[11px] text-muted">דירוג כוכבים וסוג קבוצה למשחק</span>
          </span>
        </span>
        <Switch checked={prefs.enabled} onChange={(enabled) => onChange({ enabled })} label="הגרל נתוני קבוצות" />
      </label>

      <AnimatePresence initial={false}>
        {prefs.enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-4">
              <div>
                <p className="mb-2 text-xs font-bold text-muted">דירוגים אפשריים (יוגרל אחד)</p>
                <div role="group" aria-label="דירוגי כוכבים" className="grid grid-cols-6 gap-1.5">
                  {STAR_OPTIONS.map((star) => {
                    const active = prefs.stars.includes(star)
                    return (
                      <button
                        key={star}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleStar(star)}
                        className={cn(
                          'tabular flex h-11 flex-col items-center justify-center rounded-xl border text-sm font-black transition active:scale-95',
                          active ? 'border-gold/60 bg-gold/15 text-gold shadow-gold' : 'border-line bg-card2 text-muted',
                        )}
                      >
                        {formatStars(star)}
                        <span className="text-[9px] leading-none">★</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold text-muted">סוג קבוצות</p>
                <div role="radiogroup" aria-label="סוג קבוצות" className="grid grid-cols-3 gap-1 rounded-xl bg-bg/60 p-1">
                  {TEAM_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={prefs.teamType === t.id}
                      onClick={() => onChange({ teamType: t.id })}
                      className={cn(
                        'flex h-10 items-center justify-center gap-1 rounded-lg text-xs font-bold transition',
                        prefs.teamType === t.id ? 'bg-card2 text-white shadow' : 'text-muted',
                      )}
                    >
                      <span>{t.emoji}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
