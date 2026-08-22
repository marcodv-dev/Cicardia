import { useState } from 'react'

export default function ButtonPage() {
  const [count, setCount] = useState(0)

  return (
    <main className="page">
      <button id="action-btn" type="button" onClick={() => setCount((c) => c + 1)}>
        Cliccami
      </button>
      <span>{count}</span>
    </main>
  )
}
