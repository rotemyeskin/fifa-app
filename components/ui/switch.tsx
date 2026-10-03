'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Switch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  id?: string
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors',
        checked ? 'justify-end bg-neon shadow-neon' : 'justify-start bg-line',
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 32 }}
        className="h-5 w-5 rounded-full bg-white shadow"
      />
    </button>
  )
}
