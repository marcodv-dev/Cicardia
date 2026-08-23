import { NavLink, useParams } from 'react-router-dom'
import { boxes } from '../data/boxes'

export default function DashboardBoxPage() {
  const { boxId } = useParams()
  const box = boxes.find((b) => b.id === Number(boxId))

  if (!box) {
    return (
      <main className="page">
        <h2>Box non trovato</h2>
        <NavLink to="/dashboard" className="back-link">
          ← Torna alla dashboard
        </NavLink>
      </main>
    )
  }

  return (
    <main className="page">
      <h2>{box.title}</h2>
      <p>Qui il contenuto specifico del box {box.id}.</p>
      <NavLink to="/dashboard" className="back-link">
        ← Torna
      </NavLink>
    </main>
  )
}
