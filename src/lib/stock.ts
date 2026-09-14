import { db } from '../db'
import type { MealTipo } from './types'

export async function toggleIngredientFinito(
  ingredientId: string,
  mealDate: string,
  mealTipo: MealTipo,
  occurrenceId: string,
): Promise<void> {
  const ingredient = await db.ingredients.get(ingredientId)
  if (!ingredient) return

  if (ingredient.inCasa) {
    await db.ingredients.update(ingredientId, {
      inCasa: false,
      esauritoDa: { date: mealDate, tipo: mealTipo, occurrenceId },
    })
  } else {
    await db.ingredients.update(ingredientId, {
      inCasa: true,
      esauritoDa: null,
    })
  }
}

export function isFinitoForMeal(
  inCasa: boolean,
  esauritoDa: { date: string; tipo: MealTipo; occurrenceId: string } | null,
  mealDate: string,
  mealTipo: MealTipo,
): boolean {
  if (inCasa) return false
  if (!esauritoDa) return false

  if (esauritoDa.date < mealDate) return true
  if (esauritoDa.date === mealDate) {
    return TIPO_ORDER.indexOf(mealTipo) >= TIPO_ORDER.indexOf(esauritoDa.tipo)
  }
  return false
}

const TIPO_ORDER: MealTipo[] = ['colazione', 'merenda1', 'pranzo', 'merenda2', 'cena']

export async function checkShoppingItem(ingredientId: string): Promise<void> {
  await db.ingredients.update(ingredientId, {
    inCasa: true,
    esauritoDa: null,
  })
}
