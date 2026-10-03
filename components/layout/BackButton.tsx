'use client'

import { ChevronRight } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

export function BackButton() {
  const pathname = usePathname()
  const router = useRouter()
  if (pathname === '/') return null

  function goBack() {
    if (window.history.length > 1) router.back()
    else router.push('/')
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="-ms-2 mb-3 inline-flex h-10 items-center gap-1 rounded-xl pe-3 ps-1 text-sm font-semibold text-muted transition hover:bg-card2 hover:text-white active:scale-95"
    >
      <ChevronRight className="h-5 w-5" />
      חזרה
    </button>
  )
}
