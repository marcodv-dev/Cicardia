import { db } from '../db'
import type { MealTemplate, MealTipo, Occurrence } from './types'

function toYYYYMMDD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function coveredDays(freq: 'daily' | 'weekly', days: number[]): number[] {
  if (freq === 'daily') return [0, 1, 2, 3, 4, 5, 6]
  return days
}

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

export async function checkOverlap(
  tipo: MealTipo,
  freq: 'daily' | 'weekly',
  days: number[],
  excludeId?: string,
): Promise<string | null> {
  const others = await db.mealTemplates
    .where('tipo')
    .equals(tipo)
    .and(t => t.attivo && t.id !== excludeId)
    .toArray()

  const newDays = coveredDays(freq, days)
  const allOverlapDays = new Set<number>()

  for (const other of others) {
    const otherDays = coveredDays(other.ricorrenza.freq, other.ricorrenza.days)
    for (const d of newDays) {
      if (otherDays.includes(d)) allOverlapDays.add(d)
    }
  }

  if (allOverlapDays.size > 0) {
    const dayLabels = [...allOverlapDays].sort().map(d => DAY_NAMES[d]).join(', ')
    return `Esiste già un ${tipo} per:\n${dayLabels}`
  }

  return null
}

export function expandRecurrence(
  template: MealTemplate,
  from: Date,
  to: Date,
): Occurrence[] {
  const { ricorrenza, tipo, id: templateId } = template
  const start = new Date(ricorrenza.startDate)
  const end = ricorrenza.endDate ? new Date(ricorrenza.endDate) : to
  const effectiveEnd = end < to ? end : to

  const occurrences: Occurrence[] = []
  const interval = ricorrenza.interval ?? 1

  if (ricorrenza.freq === 'daily') {
    let cursor = new Date(start)
    while (cursor <= effectiveEnd) {
      if (cursor >= from) {
        const dateStr = toYYYYMMDD(cursor)
        occurrences.push({
          id: `${templateId}_${dateStr}`,
          date: dateStr,
          tipo,
          status: 'pending',
        })
      }
      cursor = addDays(cursor, interval)
    }
  } else {
    let cursor = new Date(start)
    while (cursor <= effectiveEnd) {
      const dayOfWeek = (cursor.getDay() + 6) % 7  // 0=Lun, 1=Mar, ..., 6=Dom
      if (ricorrenza.days.includes(dayOfWeek)) {
        if (cursor >= from) {
          const dateStr = toYYYYMMDD(cursor)
          occurrences.push({
            id: `${templateId}_${dateStr}`,
            date: dateStr,
            tipo,
            status: 'pending',
          })
        }
      }
      cursor = addDays(cursor, 1)
      if (cursor.getDay() === 0 && cursor > start) {
        cursor = addDays(cursor, (interval - 1) * 7)
      }
    }
  }

  return occurrences
}
