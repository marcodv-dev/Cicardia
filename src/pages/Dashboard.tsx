import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { boxes } from '../data/boxes'

const NAVIGATION_DELAY_MS = 350

export default function Dashboard() {
  const navigate = useNavigate()
  const [pressedId, setPressedId] = useState<number | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const openBox = (id: number): void => {
    if (pressedId !== null) return
    setPressedId(id)
    timerRef.current = window.setTimeout(() => {
      navigate(`/dashboardBox/${id}`)
    }, NAVIGATION_DELAY_MS)
  }

  return (
    <main className="page">
      <h2>Griglia</h2>
      <div className="grid">
        {boxes.map((box,i) => (
          <div
            key={box.id}
            className={`box shadow ${pressedId === box.id ? ' active' : ''} ${i==0? 'double':''}`}
            onClick={() => openBox(box.id)}
            style={{backgroundColor:`${box.color}`}}
          >
            <label htmlFor={`box-${box.id}`}>{box.title}</label>
          </div>
        ))}
      </div>
    </main>
  )
}
