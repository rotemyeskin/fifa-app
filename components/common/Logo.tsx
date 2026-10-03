import { cn } from '@/lib/utils'

/** Neon shield with a football. Keep in sync with app/icon.svg. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('h-10 w-10', className)} aria-label="ליגת הפיפא" role="img">
      <defs>
        <linearGradient id="logo-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2cf58a" />
          <stop offset="1" stopColor="#c6ff3d" />
        </linearGradient>
        <linearGradient id="logo-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#16213a" />
          <stop offset="1" stopColor="#070b14" />
        </linearGradient>
      </defs>
      <path
        d="M32 3 L56 11 V30 C56 46 45 56 32 61 C19 56 8 46 8 30 V11 Z"
        fill="url(#logo-fill)"
        stroke="url(#logo-stroke)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="31" r="13" fill="none" stroke="#ffffff" strokeWidth="2.5" />
      <polygon points="32,26 36.76,29.45 34.94,35.05 29.06,35.05 27.24,29.45" fill="#2cf58a" />
      <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round">
        <line x1="32" y1="26" x2="32" y2="18" />
        <line x1="36.76" y1="29.45" x2="44.36" y2="26.98" />
        <line x1="34.94" y1="35.05" x2="39.64" y2="41.52" />
        <line x1="29.06" y1="35.05" x2="24.36" y2="41.52" />
        <line x1="27.24" y1="29.45" x2="19.64" y2="26.98" />
      </g>
      <g fill="#fbbf24">
        <circle cx="24" cy="51" r="1.6" />
        <circle cx="32" cy="53" r="1.6" />
        <circle cx="40" cy="51" r="1.6" />
      </g>
    </svg>
  )
}
