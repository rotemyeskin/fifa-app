'use client'

import { CalendarDays } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Chip } from '@/components/ui/chip'
import { cn } from '@/lib/utils'

/** YYYY-MM-DD → DD/MM/YYYY */
function toDisplay(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/** DD/MM/YYYY (also accepts . or - separators, and 1-digit day/month) → YYYY-MM-DD, or null if invalid. */
function parseDisplay(text: string): string | null {
  const match = text.trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (!match) return null
  const [, d, m, y] = match
  const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  const date = new Date(`${iso}T12:00:00Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) return null
  return iso
}

export function DateField({
  value,
  onChange,
  max,
}: {
  value: string
  onChange: (iso: string) => void
  max: string
}) {
  const [text, setText] = useState(toDisplay(value))
  const [error, setError] = useState<string | null>(null)
  const pickerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setText(toDisplay(value))
    setError(null)
  }, [value])

  function handleText(next: string) {
    setText(next)
    const iso = parseDisplay(next)
    if (!iso) {
      setError(next.length >= 8 ? 'תאריך לא תקין, כתבו בפורמט יום/חודש/שנה' : null)
      return
    }
    if (iso > max) {
      setError('אי אפשר לבחור תאריך עתידי')
      return
    }
    setError(null)
    onChange(iso)
  }

  function openPicker() {
    const input = pickerRef.current
    if (!input) return
    try {
      input.showPicker()
    } catch {
      input.focus()
      input.click()
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          dir="ltr"
          value={text}
          onChange={(e) => handleText(e.target.value)}
          onBlur={() => error === null && setText(toDisplay(value))}
          placeholder="DD/MM/YYYY"
          aria-label="תאריך המשחק"
          className={cn(
            'tabular h-11 min-w-0 flex-1 rounded-xl border bg-bg/60 px-3 text-center text-base text-white placeholder:text-muted/70 focus:outline-none focus:ring-2',
            error ? 'border-danger/60 focus:ring-danger/20' : 'border-line focus:border-neon/60 focus:ring-neon/20',
          )}
        />
        <div className="relative">
          <button
            type="button"
            onClick={openPicker}
            aria-label="בחירה מלוח שנה"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-neon/30 bg-neon/10 text-neon transition active:scale-95"
          >
            <CalendarDays className="h-5 w-5" />
          </button>
          <input
            ref={pickerRef}
            type="date"
            tabIndex={-1}
            aria-hidden
            value={value}
            max={max}
            onChange={(e) => e.target.value && onChange(e.target.value)}
            className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
          />
        </div>
        <Chip active={value === max} onClick={() => onChange(max)} className="h-11 rounded-xl">
          היום
        </Chip>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
