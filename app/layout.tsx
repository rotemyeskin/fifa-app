import type { Metadata, Viewport } from 'next'
import { Rubik } from 'next/font/google'
import { Toaster } from 'sonner'
import { BackButton } from '@/components/layout/BackButton'
import { BottomNav } from '@/components/layout/BottomNav'
import './globals.css'

const rubik = Rubik({ subsets: ['hebrew', 'latin'], variable: '--font-rubik', display: 'swap' })

export const metadata: Metadata = {
  title: 'ליגת הפיפא',
  description: 'מעקב משחקי FIFA, טבלאות וסטטיסטיקות',
  appleWebApp: { capable: true, title: 'ליגת הפיפא', statusBarStyle: 'black-translucent' },
}

export const viewport: Viewport = {
  themeColor: '#05080f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={rubik.variable}>
      <body className="font-sans">
        <main className="mx-auto min-h-dvh max-w-2xl px-4 pb-36 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
          <BackButton />
          {children}
        </main>
        <BottomNav />
        <Toaster dir="rtl" position="top-center" theme="dark" richColors closeButton />
      </body>
    </html>
  )
}
