'use client'

import { useRouter } from 'next/navigation'
import { Select } from '@/components/ui/input'

export function YearSelect({ years, value }: { years: number[]; value: number }) {
  const router = useRouter()
  if (years.length < 2) return null
  return (
    <Select
      aria-label="בחירת עונה"
      value={value}
      onChange={(e) => router.push(`/?year=${e.target.value}`)}
    >
      {years.map((y) => (
        <option key={y} value={y}>
          עונת {y}
        </option>
      ))}
    </Select>
  )
}
