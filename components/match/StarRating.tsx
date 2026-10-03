'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import type { MouseEvent } from 'react'
import { formatStars } from '@/lib/utils'

/**
 * Tap the right half of a star (RTL start) for a half star, the left half for a full star.
 * Tapping the current value again clears it to zero.
 */
export function StarRating({
  value,
  onChange,
  size = 28,
}: {
  value: number
  onChange: (value: number) => void
  size?: number
}) {
  function handleClick(e: MouseEvent<HTMLButtonElement>, index: number) {
    const rect = e.currentTarget.getBoundingClientRect()
    const fromStart = rect.right - e.clientX
    const next = fromStart < rect.width / 2 ? index - 0.5 : index
    onChange(next === value ? 0 : next)
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center" dir="rtl">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = value >= i ? 1 : value >= i - 0.5 ? 0.5 : 0
          return (
            <motion.button
              key={i}
              type="button"
              whileTap={{ scale: 0.8 }}
              onClick={(e) => handleClick(e, i)}
              className="relative p-0.5"
              style={{ width: size + 4, height: size + 4 }}
              aria-label={`${i} כוכבים`}
            >
              <Star className="absolute inset-0.5 text-line" fill="currentColor" strokeWidth={0} size={size} />
              {fill > 0 && (
                <Star
                  className="absolute inset-0.5 text-gold drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                  fill="currentColor"
                  strokeWidth={0}
                  size={size}
                  style={{ clipPath: fill === 0.5 ? 'inset(0 0 0 50%)' : undefined }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
      <span className="tabular text-sm font-bold text-gold">{formatStars(value)} ★</span>
    </div>
  )
}
