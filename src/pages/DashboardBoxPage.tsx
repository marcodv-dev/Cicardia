import { useParams } from 'react-router-dom'
import { boxes } from '../data/boxes'

export default function DashboardBoxPage() {
  const { boxId } = useParams()
  const box = boxes.find((b) => b.id === Number(boxId))

  if (!box) {
    return (
      <main className="page">
        <h2>Box non trovato</h2>
      </main>
    )
  }

  return (
    <main className="page">
      <p>Qui il contenuto specifico del box {box.id}.</p>
    </main>
  )
}
