import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useNoJumpFocus } from '../hooks/useNoJumpFocus'

export default function Form() {

  const navigate = useNavigate()
  const [pressedId, setPressedId] = useState<number | null>(null)
  const timerRef = useRef<number | null>(null)

  const nomeField = useNoJumpFocus()
  const cognomeField = useNoJumpFocus()
  const emailField = useNoJumpFocus()

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const enterForm = (id: number): void => {
    if (pressedId !== null) return
    setPressedId(id)
    timerRef.current = window.setTimeout(() => {
      navigate(`/dashboardBox/${id}`)
    }, 350)
  }

  return (
    <main className="page">
      <h1>Form</h1>
      <div className='form-section'>
        <label htmlFor="form-nome">Nome</label>
        <input id="form-nome" type="text" className='form-input' {...nomeField}/>
      </div>
      <div className='form-section'>
        <label htmlFor="form-cognome">Cognome</label>
        <input id="form-cognome" type="text" className='form-input' {...cognomeField}/>
      </div>
      <div className='form-section'>
        <label htmlFor="form-email">Email</label>
        <input id="form-email" type="text" className='form-input' {...emailField}/>
      </div>
      <button
        className={`btn md accent shadow ${pressedId !== null ? ' active' : ''}`}
        style={{marginTop:20}}
        onClick={() => enterForm(0)}
      >
        Invia
      </button>
    </main>
  );
}
