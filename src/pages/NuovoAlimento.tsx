import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db'
import { motion } from 'framer-motion'
import { useSave } from '../context/SaveContext'
import { useToast } from '../context/ToastContext'

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

export default function NuovoAlimento() {
  const navigate = useNavigate()
  const { registerSave } = useSave()
  const { show: toast } = useToast()
  const [name, setName] = useState('')
  const [inCasa, setInCasa] = useState(true)

  async function save() {
    if (!name.trim()) {
      toast('Inserisci un nome')
      return
    }
    await db.ingredients.add({
      id: uid(),
      name: name.trim(),
      inCasa,
      esauritoDa: null,
    })
    navigate(-1)
  }

  useEffect(() => { registerSave(save) })

  return (
    <motion.section
      className='page'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeIn' }}
    >
      <div className='page-section'>
        <label className='page-title intel'>Nome</label>
        <input className='page-input' type="text" placeholder="Alimento..." value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className='page-section'>
        <div style={{display:'flex',gap:5,alignItems:'center'}}>
          <button className={`btn sm ${inCasa ? 'accent' : 'glass'}`} style={{flex:1}} type="button" onClick={() => setInCasa(true)}>Presente</button>
          <button className={`btn sm ${!inCasa ? 'accent' : 'glass'}`} style={{flex:1}} type="button" onClick={() => setInCasa(false)}>Finito</button>
        </div>
      </div>
    </motion.section>
  )
}
