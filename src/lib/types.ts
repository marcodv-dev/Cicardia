export type MealTipo = 'colazione' | 'merenda1' | 'pranzo' | 'merenda2' | 'cena'

export const TIPO_ORDER: MealTipo[] = ['colazione', 'merenda1', 'pranzo', 'merenda2', 'cena']

export interface Ingredient {
  id: string
  name: string
  inCasa: boolean
  esauritoDa: {
    date: string
    tipo: MealTipo
    occurrenceId: string
  } | null
}

export interface Recurrence {
  freq: 'daily' | 'weekly'
  days: number[]
  interval?: number
  startDate: string
  endDate?: string
}

export interface MealTemplate {
  id: string
  title?: string
  tipo: MealTipo
  ingredientIds: string[]
  ricorrenza: Recurrence
  attivo: boolean
}

export interface Occurrence {
  id: string
  date: string
  tipo: MealTipo
  status: 'pending' | 'done'
}
