import type { MealTemplate, Occurrence } from './types'
import { TIPO_ORDER } from './types'
import { expandRecurrence } from './recurrence'

function toYYYYMMDD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function todayStr(): string {
  return toYYYYMMDD(new Date())
}

export function daysFromNow(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

export function expandOccurrences(
  templates: MealTemplate[],
): Occurrence[] {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const to = daysFromNow(14)
  const all: Occurrence[] = []

  for (const t of templates) {
    if (!t.attivo) continue
    all.push(...expandRecurrence(t, from, to))
  }

  return all
}

export function sortByDateAndTipo(occurrences: Occurrence[]): Occurrence[] {
  return [...occurrences].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return TIPO_ORDER.indexOf(a.tipo) - TIPO_ORDER.indexOf(b.tipo)
  })
}

export function getNextMeals(
  templates: MealTemplate[],
  completedIds: Set<string>,
): { next: Occurrence | null; laterToday: Occurrence[] } {
  const expanded = expandOccurrences(templates)
  const pending = expanded.filter(o => !completedIds.has(o.id) && o.status !== 'done')
  const sorted = sortByDateAndTipo(pending)
  const today = todayStr()

  const todayPending = sorted.filter(o => o.date === today)
    const next = todayPending[0] ?? null
  const laterToday = todayPending.filter(o => next && o.id !== next.id).slice(0, 1)

  return { next, laterToday }
}

export function countPendingShopping(
  occurrences: Occurrence[],
  completedIds: Set<string>,
): number {
  const today = todayStr()
  return occurrences.filter(
    o => o.date >= today && !completedIds.has(o.id) && o.status !== 'done',
  ).length
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const days = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']
  const months = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
}
