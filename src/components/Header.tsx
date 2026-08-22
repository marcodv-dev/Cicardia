import { useState } from 'react'

interface HeaderProps {
  hidden: boolean
}

export default function Header({ hidden }: HeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className={`app-header${hidden ? ' app-header--hidden' : ''}`}>
        <h1 className="app-header__title">Template PWA</h1>
        <button type="button" className="btn md" onClick={() => setOpen(true)}>
          Add
        </button>
      </header>
      <div
        className={`modal-backdrop${open ? ' modal-backdrop--open' : ''}`}
        onClick={() => setOpen(false)}
      />
      <div className={`bottom-modal${open ? ' bottom-modal--open' : ''}`}>
        <div className="bottom-modal__handle" />
        <div className="bottom-modal__head">
          <h2 className="bottom-modal__title">Aggiungi</h2>
          <button
            type="button"
            className="bottom-modal__close"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
      </div>
    </>
  )
}
