import { useRef, useState } from 'react'
import ModalHeader from './modals/ModalHeader'

interface HeaderProps {
  hidden: boolean
}

interface DragState {
  startY: number
  at: number
}

export default function Header({ hidden }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const drag = useRef<DragState | null>(null)

  const close = (): void => setOpen(false)

  return (
    <>
      <header className={`app-header${hidden ? ' app-header--hidden' : ''}`}>
        <h1 className="app-header__title">Template PWA</h1>
        <button type="button" className="btn md accent" onClick={() => setOpen(true)}>
          Add
        </button>
      </header>
      <ModalHeader open={open} drag={drag} sheetRef={sheetRef} close={close} />
    </>
  )
}
