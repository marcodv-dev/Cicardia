import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useNoJumpFocus } from '../hooks/useNoJumpFocus'

const todayIso = (): string => {
  const d = new Date()
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function Form() {

  const navigate = useNavigate()
  const [pressedId, setPressedId] = useState<number | null>(null)
  const timerRef = useRef<number | null>(null)

  const nomeField = /* useNoJumpFocus() */{}
  const cognomeField = /* useNoJumpFocus() */{}
  const dataNascitaField = /* useNoJumpFocus() */{}
  const emailField = /* useNoJumpFocus() */{}
  const passwordField = /* useNoJumpFocus() */{}
  const confermaPasswordField = /* useNoJumpFocus() */{}

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
      <div className='grid-form'>
        <div className='form-section'>
          <label htmlFor="form-nome">Nome</label>
          <input id="form-nome" type="text" className='form-input' {...nomeField}/>
        </div>
        <div className='form-section'>
          <label htmlFor="form-cognome">Cognome</label>
          <input id="form-cognome" type="text" className='form-input' {...cognomeField}/>
        </div>
        <div className='form-section double'>
          <label htmlFor="form-data-nascita">Data di nascita</label>
          <input id="form-data-nascita" type="date" className='form-input' defaultValue={todayIso()} {...dataNascitaField}/>
        </div>
        <div className='form-section double'>
          <label htmlFor="form-email">Email</label>
          <input id="form-email" type="email" className='form-input' {...emailField}/>
        </div>
        <div className='form-section double'>
          <label htmlFor="form-password">Password</label>
          <input id="form-password" type="password" className='form-input' {...passwordField}/>
        </div>
        <div className='form-section double'>
          <label htmlFor="form-conferma-password">Conferma password</label>
          <input id="form-conferma-password" type="password" className='form-input' {...confermaPasswordField}/>
        </div>
      </div>
      <button
        className={`btn half md accent shadow ${pressedId !== null ? ' active' : ''}`}
        style={{marginTop:40}}
        onClick={() => enterForm(0)}
      >
        Invia
      </button>
    </main>
  );
}
