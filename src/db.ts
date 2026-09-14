import Dexie, { type EntityTable } from 'dexie'
import type { Ingredient, MealTemplate, Occurrence } from './lib/types'

class DietDB extends Dexie {
  ingredients!: EntityTable<Ingredient, 'id'>
  mealTemplates!: EntityTable<MealTemplate, 'id'>
  occurrences!: EntityTable<Occurrence, 'id'>

  constructor() {
    super('pasti-di-casa')
    this.version(1).stores({
      ingredients: 'id, name, inCasa',
      mealTemplates: 'id, tipo, attivo',
      occurrences: 'id, date, tipo, status',
    })
  }
}

export const db = new DietDB()
