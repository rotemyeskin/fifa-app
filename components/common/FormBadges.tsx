import type { Outcome } from '@/lib/match'
import { cn } from '@/lib/utils'

const STYLE: Record<Outcome, string> = {
  W: 'bg-neon/20 text-neon',
  D: 'bg-muted/20 text-muted',
  L: 'bg-danger/20 text-danger',
}

const LABEL: Record<Outcome, string> = { W: 'נ', D: 'ת', L: 'ה' }

export function FormBadges({ form, className }: { form: Outcome[]; className?: string }) {
  if (form.length === 0) return null
  return (
    <span className={cn('inline-flex gap-1', className)}>
      {form.map((o, i) => (
        <span
          key={i}
          className={cn('flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold', STYLE[o])}
        >
          {LABEL[o]}
        </span>
      ))}
    </span>
  )
}
