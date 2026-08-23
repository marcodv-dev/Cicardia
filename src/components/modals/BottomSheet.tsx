import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'

import { useNoJumpFocus } from '../../hooks/useNoJumpFocus'

interface DragState {
  startY: number
  at: number
}

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children?: ReactNode
}

const DISMISS_DISTANCE_PX = 300
const FLICK_DISTANCE_PX = 50
const FLICK_MAX_MS = 200

export default function BottomSheet({ open, onClose, title }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const inputNoJump = useNoJumpFocus()
  const drag = useRef<DragState | null>(null)

  useEffect(() => {
    if (!open) return
    const lock = (): void => {
      window.scrollTo(0, 0)
    }
    const b = document.body
    document.documentElement.style.overflow = 'hidden'
    b.style.position = 'fixed'
    b.style.top = '0'
    b.style.left = '0'
    b.style.right = '0'
    b.style.width = '100%'
    b.style.overflow = 'hidden'
    window.addEventListener('scroll', lock)
    window.visualViewport?.addEventListener('resize', lock)
    return () => {
      document.documentElement.style.overflow = ''
      b.style.position = ''
      b.style.top = ''
      b.style.left = ''
      b.style.right = ''
      b.style.width = ''
      b.style.overflow = ''
      window.removeEventListener('scroll', lock)
      window.visualViewport?.removeEventListener('resize', lock)
    }
  }, [open])

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
      onClose()
    }
  }

  return (
    <>
      <div
        className={`modal-backdrop${open ? ' modal-backdrop--open' : ''}`}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={`bottom-modal${open ? ' bottom-modal--open' : ''}`}
        onPointerDown={onSheetPointerDown}
        onPointerMove={onSheetPointerMove}
        onPointerUp={onSheetPointerUp}
        onPointerCancel={onSheetPointerUp}
      >
        <div className="bottom-modal-handle" />
        <div className="bottom-modal-head">
          <h2 className="bottom-modal-title">{title ?? 'Aggiungi'}</h2>
          <button
            type="button"
            className="btn md shadow"
            onClick={onClose}
          >
            esc
          </button>
        </div>
        <div className='bottom-modal-body'>
          <div className='bottom-modal-section'>
            <label htmlFor="" className='bottom-modal-lab'>input testo</label>
            <input
              type="text"
              className='bottom-modal-input'
              {...inputNoJump}
            />
          </div>
        </div>
      </div>
    </>
  )
}
