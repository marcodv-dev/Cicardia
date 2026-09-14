import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../db'
import type { MealTipo, Recurrence } from '../lib/types'
import { checkOverlap } from '../lib/recurrence'
import { XIcon } from '@phosphor-icons/react'
import { Check } from 'phosphor-react'
import { useSave } from '../context/SaveContext'
import { useToast } from '../context/ToastContext'
import { motion } from 'framer-motion'

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

export default function TemplateForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id
  const { registerSave } = useSave()
  const { show: toast } = useToast()

  const [tipo, setTipo] = useState<'colazione' | 'merenda' | 'pranzo' | 'cena'>('colazione')
  const [merendaSlot, setMerendaSlot] = useState<1 | 2>(1)
  const [title, setTitle] = useState('')
  const [freq, setFreq] = useState<'daily' | 'weekly'>('daily')
  const [days, setDays] = useState<number[]>([])

  const [ingredientNames, setIngredientNames] = useState<string[]>([])
  const [ingredientInput, setIngredientInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (isEdit && id) {
      db.mealTemplates.get(id).then(async tpl => {
        if (!tpl) return
        if (tpl.tipo === 'merenda1') { setTipo('merenda'); setMerendaSlot(1) }
        else if (tpl.tipo === 'merenda2') { setTipo('merenda'); setMerendaSlot(2) }
        else { setTipo(tpl.tipo) }
        setTitle(tpl.title ?? '')
        setFreq(tpl.ricorrenza.freq)
        setDays(tpl.ricorrenza.days)
        const ings = await db.ingredients.bulkGet(tpl.ingredientIds)
        setIngredientNames(ings.filter(Boolean).map(i => i!.name))
      })
    }
  }, [id, isEdit])

  useEffect(() => {
    if (!ingredientInput.trim()) {
      setSuggestions([])
      return
    }
    db.ingredients
      .where('name')
      .startsWithIgnoreCase(ingredientInput.trim())
      .limit(5)
      .toArray()
      .then(results => setSuggestions(results.map(r => r.name)))
  }, [ingredientInput])

  async function save() {
    if (!title.trim()) {
      toast('Inserisci un nome')
      return
    }
    if (ingredientNames.length === 0) {
      toast('Aggiungi almeno un alimento')
      return
    }
    if (freq === 'weekly' && days.length === 0) {
      toast('Seleziona almeno un giorno')
      return
    }

    const effectiveTipo: MealTipo = tipo === 'merenda' ? (merendaSlot === 1 ? 'merenda1' : 'merenda2') : tipo

    const overlap = await checkOverlap(effectiveTipo, freq, freq === 'daily' ? [0,1,2,3,4,5,6] : days, id)
    if (overlap) {
      toast(overlap)
      return
    }

    const ingredientIds: string[] = []
    for (const name of ingredientNames) {
      let existing = await db.ingredients.where('name').equals(name).first()
      if (!existing) {
        const newId = uid()
        await db.ingredients.add({
          id: newId,
          name,
          inCasa: true,
          esauritoDa: null,
        })
        ingredientIds.push(newId)
      } else {
        ingredientIds.push(existing.id)
      }
    }

    const recurrence: Recurrence = {
      freq,
      days: freq === 'weekly' ? days : [],
      startDate: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` })(),
    }

    if (isEdit && id) {
      await db.mealTemplates.update(id, {
        tipo: effectiveTipo,
        title: title || undefined,
        ingredientIds,
        ricorrenza: recurrence,
      })
    } else {
      await db.mealTemplates.add({
        id: uid(),
        tipo: effectiveTipo,
        title: title || undefined,
        ingredientIds,
        ricorrenza: recurrence,
        attivo: true,
      })
    }
    navigate(-1)
  }

  useEffect(() => {
    registerSave(save)
  })

  function toggleDay(d: number) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  function addIngredient(name: string) {
    const trimmed = name.trim()
    if (trimmed && !ingredientNames.includes(trimmed)) {
      setIngredientNames(prev => [...prev, trimmed])
    }
    setIngredientInput('')
    setSuggestions([])
  }

  function removeIngredient(name: string) {
    setIngredientNames(prev => prev.filter(n => n !== name))
  }

  return (
    <motion.section 
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeIn' }}
    >

      <div className='page-section'>
        <h3 className='page-title intel'>Titolo</h3>
        <input
          className='page-input'
          type="text"
          placeholder="Pasto"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      <div className='page-section'>
        <h3 className='page-title intel'>Tipo</h3>
        <div className='page-div-type-order'>
          {(['colazione', 'merenda', 'pranzo', 'cena'] as const).map(t => (
            <button
              className={`page-type-order btn sm ${tipo===t?'accent':'glass'}`}
              key={t}
              type="button"
              onClick={() => setTipo(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        {tipo === 'merenda' && (
          <div className='page-div-type-order'>
            <button
              className={`page-type-order btn sm ${merendaSlot===1?'accent':'glass'}`}
              type="button"
              onClick={() => setMerendaSlot(1)}
            >
              Tra colazione e pranzo
            </button>
            <button
              className={`page-type-order btn sm ${merendaSlot===2?'accent':'glass'}`}
              type="button"
              onClick={() => setMerendaSlot(2)}
            >
              Tra pranzo e cena
            </button>
          </div>
        )}
      </div>

      <div className='page-section'>
        <h3 className='page-title intel'>Ripetizione</h3>
        <div className='page-div-ripetition'>
          <button
            className={`page-ripetition btn sm ${freq==='daily'?'accent':'glass'}`}
            type="button"
            onClick={() => setFreq('daily')}
          >
            Ogni giorno
          </button>
          <button
            className={`page-ripetition btn sm ${freq==='weekly'?'accent':'glass'}`}
            type="button"
            onClick={() => setFreq('weekly')}
          >
            Personalizzato
          </button>
        </div>
        {freq === 'weekly' && (
          <div className='page-div-ripetition'>
            {DAYS.map((d, i) => (
              <button
                className={`page-ripetition btn sm ${days.includes(i)?'accent':'glass'}`}
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className='page-section'>
        <h3 className='page-title intel'>Alimenti</h3>
        <div style={{display:'flex',gap:10}}>
          <input
            className='page-input'
            style={{flex:1}}
            type="text"
            placeholder="Aggiungi ingrediente..."
            value={ingredientInput}
            onChange={e => setIngredientInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addIngredient(ingredientInput)
              }
            }}
          />
          <button className='btn sm accent sc circle' type="button" onClick={() => addIngredient(ingredientInput)}>
            <Check className='' size={30} weight="regular"/>
          </button>
        </div>
        {suggestions.length > 0 && (
          <div style={{display:'flex',gap:3}}>
            {suggestions.map(s => (
              <button className='btn glass sm' key={s} type="button" onClick={() => addIngredient(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        <div style={{marginTop:10,display:'flex',flexDirection:'column',gap:12}}>
          {ingredientNames.map(name => (
            <div className='page-alimento' key={name}>
              <span className='page-alimento-title'>{name}</span>
              <button className='btn glass sm circle alim' type="button" onClick={() => removeIngredient(name)}><XIcon className='' size={30} weight="regular"/></button>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
