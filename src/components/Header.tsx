import { useState } from 'react'
import ModalHeader from './modals/ModalHeader'

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
      <ModalHeader open={open} onClose={() => setOpen(false)} />
    </>
  )
}
