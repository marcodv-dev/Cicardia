import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../db'
import type { MealTemplate, MealTipo, Ingredient } from '../lib/types'
import { TIPO_ORDER } from '../lib/types'
import { isFinitoForMeal } from '../lib/stock'
import { todayStr } from '../lib/nextMeal'
import { motion } from 'framer-motion'
import React from 'react'

const TIPO_LABELS: Record<MealTipo, string> = {
  colazione: 'Colazione',
  merenda1: 'Merenda',
  pranzo: 'Pranzo',
  merenda2: 'Merenda',
  cena: 'Cena',
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

export default function DettaglioPasto() {
  const { id } = useParams<{ id: string }>()
  const [template, setTemplate] = useState<MealTemplate | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const today = todayStr()

  useEffect(() => {
    if (!id) return
    db.mealTemplates.get(id).then(async tpl => {
      if (!tpl) return
      setTemplate(tpl)
      const ings = await db.ingredients.bulkGet(tpl.ingredientIds)
      setIngredients(ings.filter(Boolean) as Ingredient[])
    })
  }, [id])

  if (!template) return <section><p>Caricamento...</p></section>

  return (
    <motion.section 
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeIn' }}
    >
      <div className='page-section'>
        <h3 className='page-dett-title intel'>{template.title || '(senza nome)'}</h3>
        {TIPO_ORDER.map(t => (
          <>{template.tipo===t && <label className='page-title intel'>{TIPO_LABELS[t].toUpperCase()}</label>}</>
        ))}
      </div>

      <div className='page-section'>
        <h3 className='page-title intel'>Ripetizione</h3>
        <div className='page-div-ripetition' style={{flexDirection:'column',alignItems:'baseline'}}>
          <label className='card-title' htmlFor="">{template.ricorrenza.freq === 'daily' ? 'Ogni giorno' : 'Personalizzato'}</label>
          {template.ricorrenza.freq === 'weekly' &&<div>
            {template.ricorrenza.days.map((dayIndex, i) => (
              <React.Fragment key={dayIndex}>
                <label className='card-title'>{DAYS[dayIndex]}</label>
                {i < template.ricorrenza.days.length - 1 && <span className='card-title'>, </span>}
              </React.Fragment>
            ))}
          </div>}
        </div>
      </div>

      <div className='page-section'>
        <h3 className='page-title intel'>Alimenti</h3>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ingredients.map(ing => {
            const finito = isFinitoForMeal(ing.inCasa, ing.esauritoDa, today, template.tipo)
            return (
              <div className={`page-alimento ${finito ? 'finito' : null}`} key={ing.id}>
                <span className='page-alimento-title'>{ing.name}</span>
                <button className={`btn glass md sc alim ${finito ? 'finito' : null}`} onClick={() => handleToggle(ing.id)}>
                  {!finito && <span>Presente</span>}
                  {finito && <span>Finito</span>}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )

  async function handleToggle(ingredientId: string) {
    const ing = await db.ingredients.get(ingredientId)
    if (!ing || !template) return
    if (ing.inCasa) {
      await db.ingredients.update(ingredientId, {
        inCasa: false,
        esauritoDa: { date: today, tipo: template.tipo, occurrenceId: '' },
      })
    } else {
      await db.ingredients.update(ingredientId, { inCasa: true, esauritoDa: null })
    }
    const updated = await db.ingredients.bulkGet(template.ingredientIds)
    setIngredients(updated.filter(Boolean) as Ingredient[])
  }
}
