'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Crown, History, LayoutGrid, Plus, Sparkles, Swords, Trophy, Users, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/', label: 'טבלה', icon: Trophy },
  { href: '/daily', label: 'אלוף יומי', icon: Crown },
  null,
  { href: '/session', label: 'סשן', icon: Swords },
] as const

const MORE = [
  { href: '/history', label: 'היסטוריית משחקים', icon: History, color: 'text-sky-400' },
  { href: '/stats', label: 'סטטיסטיקות מגניבות', icon: Sparkles, color: 'text-gold' },
  { href: '/players', label: 'שחקנים', icon: Users, color: 'text-violet' },
]

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export function BottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreActive = MORE.some((m) => isActive(pathname, m.href))

  useEffect(() => setMoreOpen(false), [pathname])

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] z-50 mx-auto max-w-sm overflow-hidden rounded-2xl border border-line bg-card2/95 shadow-2xl backdrop-blur-xl"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            >
              {MORE.map(({ href, label, icon: Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 border-b border-line px-5 py-4 text-base font-medium last:border-0 hover:bg-line/60',
                    isActive(pathname, href) && 'bg-line/40',
                  )}
                >
                  <Icon className={cn('h-5 w-5', color)} />
                  {label}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-3 mb-3 flex max-w-md items-center justify-around rounded-3xl border border-line bg-card/85 px-2 py-2 shadow-2xl backdrop-blur-xl sm:mx-auto">
          {TABS.map((tab) =>
            tab === null ? (
              <Link
                key="new"
                href="/new-match"
                aria-label="משחק חדש"
                className="-mt-9 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-neon to-volt text-bg shadow-neon ring-4 ring-bg transition-transform hover:scale-105 active:scale-95"
              >
                <Plus className="h-8 w-8" strokeWidth={3} />
              </Link>
            ) : (
              <NavItem key={tab.href} href={tab.href} label={tab.label} Icon={tab.icon} active={isActive(pathname, tab.href)} />
            ),
          )}
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className={cn(
              'relative flex w-16 flex-col items-center gap-1 py-1 text-[11px] font-medium transition-colors',
              moreActive || moreOpen ? 'text-neon' : 'text-muted',
            )}
          >
            {moreOpen ? <X className="h-6 w-6" /> : <LayoutGrid className="h-6 w-6" />}
            עוד
          </button>
        </div>
      </nav>
    </>
  )
}

function NavItem({
  href,
  label,
  Icon,
  active,
}: {
  href: string
  label: string
  Icon: typeof Trophy
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'relative flex w-16 flex-col items-center gap-1 py-1 text-[11px] font-medium transition-colors',
        active ? 'text-neon' : 'text-muted hover:text-white',
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute -top-2 h-1 w-8 rounded-full bg-neon shadow-neon"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
      <Icon className="h-6 w-6" />
      {label}
    </Link>
  )
}
