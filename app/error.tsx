'use client'

import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const missingEnv = error.message.includes('SUPABASE')
  return (
    <EmptyState
      emoji="🟥"
      title="כרטיס אדום! משהו השתבש"
      description={
        missingEnv
          ? 'לא הוגדרו משתני הסביבה של Supabase. בדקו את SUPABASE_URL ו-SUPABASE_SERVICE_ROLE_KEY.'
          : 'לא הצלחנו לטעון את הנתונים. נסו שוב בעוד רגע.'
      }
      action={<Button onClick={reset}>נסו שוב</Button>}
    />
  )
}
