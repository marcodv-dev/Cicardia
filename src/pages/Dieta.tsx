import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { db } from '../db'
import type { MealTemplate, MealTipo } from '../lib/types'
import { TIPO_ORDER } from '../lib/types'
import { TrashIcon } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

const TIPO_LABELS: Record<MealTipo, string> = {
  colazione: 'COLAZIONE',
  merenda1: 'MERENDA MATTINA',
  pranzo: 'PRANZO',
  merenda2: 'MERENDA POMERIGGIO',
  cena: 'CENA',
}

export default function Dieta() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<MealTemplate[]>([])
  const [loaded, setLoaded] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    db.mealTemplates.toArray().then(t => {
      setTemplates(t)
      setLoaded(true)
    })
  }, [])

  async function deleteTemplate(id: string) {
    const deleted = await db.mealTemplates.get(id)
    await db.mealTemplates.delete(id)
    if (deleted) {
      const remaining = await db.mealTemplates.toArray()
      const usedIds = new Set(remaining.flatMap(t => t.ingredientIds))
      const orphans = deleted.ingredientIds.filter(iid => !usedIds.has(iid))
      if (orphans.length > 0) {
        await db.ingredients.bulkDelete(orphans)
      }
    }
    setTemplates(prev => prev.filter(t => t.id !== id))
    setConfirmId(null)
  }

  const grouped = TIPO_ORDER.map(tipo => ({
    tipo,
    label: TIPO_LABELS[tipo],
    items: templates.filter(t => t.tipo === tipo && t.attivo),
  }))

  if (loaded && templates.length === 0) {
    return (
      <motion.section 
        className='page empty'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeIn' }}
      >
        <p className='p-empty-page intel'>Ancora nessun pasto</p>
        <button className='btn accent lg sc' type="button" onClick={() => navigate('/pasti/nuovo')}>
          Nuovo pasto
        </button>
      </motion.section>
    )
  }

  return (
    <motion.section 
      className='page'
      style={{paddingBottom:100}}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeIn' }}
    >
      {grouped.map(({ tipo, label, items }) => (
        <>
        {items.length !== 0&&<div key={tipo} className='page-section'>
          <h3 className='page-title intel'>{label}</h3>
          {items.map(t => (
            <div 
              className='card glass'
              key={t.id}
            >
              <div className='card-row'>
                <div className='card-content sc' onClick={() => navigate(`/pasti/${t.id}`)}>
                  <h2 className='card-title intel'>{t.title}</h2>
                  <span className='card-subtitle'>
                    {t.ricorrenza.freq === 'daily'
                      ? 'Ogni giorno'
                      : formatDays(t.ricorrenza.days)}
                  </span>
                  <span className='card-subtitle'>
                    {t.ingredientIds.length > 0
                      ? `${t.ingredientIds.length} aliment${t.ingredientIds.length==1?'o':'i'}`
                      : null}
                  </span>
                </div>
                <div style={{position:'absolute', bottom:-10, right:-10}}>
                  <button
                    className='btn glass sm circle'
                    type="button"
                    onClick={e => { e.stopPropagation(); setConfirmId(t.id) }}
                  >
                    <TrashIcon size={30} weight="regular"/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>}
        </>
      ))}

      {confirmId && createPortal(
        <div className='modal-overlay' onClick={() => setConfirmId(null)}>
          <div className='modal' onClick={e => e.stopPropagation()}>
            <h3 className='card-title'>Conferma</h3>
            <p className='modal-text'>Eliminare questo pasto?</p>
            <div className='modal-actions'>
              <button className='btn glass md' type="button" onClick={() => setConfirmId(null)}>
                Annulla
              </button>
              <button className='btn accent md' type="button" onClick={() => deleteTemplate(confirmId)}>
                Conferma
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </motion.section>
  )
}

function formatDays(days: number[]): string {
  const names = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
  return days.map(d => names[d]).join(' ')
}
