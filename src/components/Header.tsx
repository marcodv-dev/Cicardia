import { useState } from 'react'
import BottomSheet from './modals/BottomSheet'

interface HeaderProps {
  hidden: boolean
}

export default function Header({ hidden }: HeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className={`app-header${hidden ? ' app-header--hidden' : ''}`}>
        <h1 className="app-header__title">Template PWA</h1>
        <button type="button" className="btn md accent" onClick={() => setOpen(true)}>
          Add
        </button>
      </header>
      <BottomSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
