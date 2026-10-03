import { NextResponse } from 'next/server'
import { getDb } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * Called daily by Vercel Cron (see vercel.json). Supabase pauses free projects after
 * 7 days without activity, and we only play about once a month.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const { count, error } = await getDb().from('players').select('id', { count: 'exact', head: true })
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, players: count, at: new Date().toISOString() })
}
