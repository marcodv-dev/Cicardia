import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { db } from '../db'
import type { MealTemplate, MealTipo, Ingredient } from '../lib/types'
import { TIPO_ORDER } from '../lib/types'
import { TrashIcon } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useToast } from '../context/ToastContext'

const TIPO_LABELS: Record<MealTipo, string> = {
  colazione: 'COLAZIONE',
  merenda1: 'MERENDA MATTINA',
  pranzo: 'PRANZO',
  merenda2: 'MERENDA POMERIGGIO',
  cena: 'CENA',
}

interface DietaProps {
  showModal: boolean
  onCloseModal: () => void
}

export default function Dieta({ showModal, onCloseModal }: DietaProps) {
  const navigate = useNavigate()
  const { show: toast } = useToast()
  const [templates, setTemplates] = useState<MealTemplate[]>([])
  const [loaded, setLoaded] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  async function exportDieta() {
    const allTemplates = await db.mealTemplates.toArray()
    const allIngredients = await db.ingredients.toArray()
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      mealTemplates: allTemplates,
      ingredients: allIngredients,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dieta-cicardia.json'
    a.click()
    URL.revokeObjectURL(url)
    onCloseModal()
    toast('Dieta esportata')
  }

  async function importDieta(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    let data: any
    try {
      data = JSON.parse(text)
    } catch {
      toast('File non valido')
      return
    }
    if (!data.mealTemplates || !data.ingredients) {
      toast('Formato file non valido')
      return
    }

    const existing = await db.mealTemplates.toArray()
    const existingKeys = new Set(existing.map(t => `${t.title}__${t.tipo}`))

    const newTemplates: MealTemplate[] = []
    const newIngredients: Ingredient[] = []
    const existingIngredientIds = new Set(data.ingredients.map((i: Ingredient) => i.id))

    for (const t of data.mealTemplates as MealTemplate[]) {
      const key = `${t.title}__${t.tipo}`
      if (existingKeys.has(key)) continue

      const idMap: Record<string, string> = {}
      const tmplIngredients: Ingredient[] = []

      for (const iid of t.ingredientIds) {
        const ing = data.ingredients.find((i: Ingredient) => i.id === iid)
        if (!ing) continue
        if (existingIngredientIds.has(iid)) {
          idMap[iid] = iid
        } else {
          const newId = crypto.randomUUID()
          idMap[iid] = newId
          tmplIngredients.push({ ...ing, id: newId })
        }
      }

      newTemplates.push({
        ...t,
        id: crypto.randomUUID(),
        ingredientIds: t.ingredientIds.map(iid => idMap[iid] ?? iid),
      })
      newIngredients.push(...tmplIngredients)
    }

    if (newIngredients.length > 0) await db.ingredients.bulkAdd(newIngredients)
    if (newTemplates.length > 0) await db.mealTemplates.bulkAdd(newTemplates)

    const refreshed = await db.mealTemplates.toArray()
    setTemplates(refreshed)
    onCloseModal()
    toast(`Importati ${newTemplates.length} pasti`)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function eliminaDieta() {
    await db.mealTemplates.clear()
    await db.ingredients.clear()
    setTemplates([])
    setShowDeleteConfirm(false)
    onCloseModal()
    toast('Dieta eliminata')
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
        exit={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeIn' }}
      >
        <p className='p-empty-page intel'>Ancora nessun pasto</p>
        <button className='btn accent lg sc' type="button" onClick={() => navigate('/pasti/nuovo')}>
          Nuovo pasto
        </button>

        <input ref={fileInputRef} type="file" accept=".json" style={{display:'none'}} onChange={importDieta} />

        {showModal && createPortal(
          <div className='modal-overlay' onClick={onCloseModal}>
            <div className='modal' onClick={e => e.stopPropagation()}>
              <h3 className='card-title'>Dieta</h3>
              <div className='modal-actions' style={{flexDirection:'column'}}>
                <button className='btn accent lg' type="button" onClick={() => fileInputRef.current?.click()}>Importa dieta</button>
                <button className='btn glass lg' type="button" onClick={exportDieta}>Esporta dieta</button>
                <button className='btn accent lg' type="button" onClick={() => { setShowDeleteConfirm(true) }}>Elimina dieta</button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {showDeleteConfirm && createPortal(
          <div className='modal-overlay' onClick={() => setShowDeleteConfirm(false)}>
            <div className='modal' onClick={e => e.stopPropagation()}>
              <h3 className='card-title'>Conferma</h3>
              <p className='modal-text'>Eliminare tutta la dieta?</p>
              <div className='modal-actions'>
                <button className='btn glass md' type="button" onClick={() => setShowDeleteConfirm(false)}>Annulla</button>
                <button className='btn accent md' type="button" onClick={eliminaDieta}>Conferma</button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </motion.section>
    )
  }

  return (
    <motion.section 
      className='page'
      style={{paddingBottom:100}}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeIn' }}
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
            <h3 className='card-title' style={{paddingLeft:10}}>Conferma</h3>
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

      <input ref={fileInputRef} type="file" accept=".json" style={{display:'none'}} onChange={importDieta} />

      {showModal && createPortal(
        <div className='modal-overlay' onClick={onCloseModal}>
          <div className='modal' onClick={e => e.stopPropagation()}>
            <div className='modal-actions' style={{flexDirection:'column',marginTop:'0px',gap:20}}>
              <button className='btn accent lg sc' type="button" onClick={() => fileInputRef.current?.click()}> Importa dieta</button>
              <button className='btn accent lg sc' type="button" onClick={exportDieta}> Esporta dieta</button>
              <button className='btn danger lg sc' type="button" onClick={() => { setShowDeleteConfirm(true) }}> Elimina dieta</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showDeleteConfirm && createPortal(
        <div className='modal-overlay' onClick={() => setShowDeleteConfirm(false)}>
          <div className='modal' onClick={e => e.stopPropagation()}>
            <h3 className='card-title' style={{paddingLeft:10}}>Conferma</h3>
            <p className='modal-text'>Eliminare tutta la dieta?</p>
            <div className='modal-actions'>
              <button className='btn glass md' type="button" onClick={() => setShowDeleteConfirm(false)}>Annulla</button>
              <button className='btn accent md' type="button" onClick={eliminaDieta}>Conferma</button>
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
