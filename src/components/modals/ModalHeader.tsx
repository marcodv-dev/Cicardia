import { type PointerEvent as ReactPointerEvent, type RefObject } from 'react'

interface DragState {
  startY: number
  at: number
}

interface ModalHeaderProps {
  open: boolean
  drag: RefObject<DragState | null>
  sheetRef: RefObject<HTMLDivElement | null>
  close: () => void
}

const DISMISS_DISTANCE_PX = 300
const FLICK_DISTANCE_PX = 50
const FLICK_MAX_MS = 200

export default function ModalHeader({ open, drag, sheetRef, close }: ModalHeaderProps) {
  const onSheetPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!open) return
    drag.current = { startY: e.clientY, at: Date.now() }
    const el = sheetRef.current
    if (el) {
      el.style.transition = 'none'
      e.currentTarget.setPointerCapture(e.pointerId)
    }
  }

  const onSheetPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const dy = Math.max(0, e.clientY - d.startY)
    const el = sheetRef.current
    if (el) el.style.transform = `translateY(${dy}px)`
  }

  const onSheetPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    drag.current = null
    const el = sheetRef.current
    if (!d || !el) return
    const dy = Math.max(0, e.clientY - d.startY)
    const duration = Date.now() - d.at
    el.style.transition = ''
    el.style.transform = ''
    if (dy > DISMISS_DISTANCE_PX || (dy > FLICK_DISTANCE_PX && duration < FLICK_MAX_MS)) {
      close()
    }
  }

  return (
    <>
      <div
        className={`modal-backdrop${open ? ' modal-backdrop--open' : ''}`}
        onClick={close}
      />
      <div
        ref={sheetRef}
        className={`bottom-modal${open ? ' bottom-modal--open' : ''}`}
        onPointerDown={onSheetPointerDown}
        onPointerMove={onSheetPointerMove}
        onPointerUp={onSheetPointerUp}
        onPointerCancel={onSheetPointerUp}
      >
        <div className="bottom-modal__handle" />
        <div className="bottom-modal__head">
          <h2 className="bottom-modal__title">Aggiungi</h2>
          <button
            type="button"
            className="bottom-modal__close"
            onClick={close}
          >
            ✕
          </button>
        </div>
      </div>
    </>
  )
}
