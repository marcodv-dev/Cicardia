import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <main className="page">
      {Array.from({ length: 20 }).map((_, index) => (
        <Link to="/button" key={index} className='card'>Pagina con button</Link>
      ))}
    </main>
  )
}
