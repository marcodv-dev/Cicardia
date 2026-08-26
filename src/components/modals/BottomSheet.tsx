import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'

interface DragState {
  startY: number
  samples: { y: number; t: number }[]
}

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children?: ReactNode
}

const DISMISS_DISTANCE_PX = 300
const FLICK_MIN_DISTANCE_PX = 24
const FLICK_VELOCITY_PX_MS = 0.5
const VELOCITY_WINDOW_MS = 100
const KEYBOARD_MIN_LIFT_PX = 100
const KB_MARGIN_PX = 16
const INTERACTIVE_SELECTOR = 'input, textarea, select, button'
const PICKER_INPUT_TYPES = new Set(['date', 'time', 'month', 'week', 'datetime-local', 'color', 'file'])

export default function BottomSheet({ open, onClose, title }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const drag = useRef<DragState | null>(null)
  const kbOverlapRef = useRef(0)

  useEffect(() => {
    if (open) return
    const active = document.activeElement
    if (active instanceof HTMLElement && sheetRef.current?.contains(active)) {
      active.blur()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const vv = window.visualViewport
    const sheet = sheetRef.current
    if (!vv || !sheet) return

    const computeLift = (): number => {
      const delta = window.innerHeight - vv.height
      if (delta <= KEYBOARD_MIN_LIFT_PX) return 0
      const active = document.activeElement
      if (!(active instanceof HTMLElement) || !sheetRef.current?.contains(active)) {
        return kbOverlapRef.current
      }
      const kbTop = delta + vv.offsetTop
      const overlapNeeded = active.getBoundingClientRect().bottom + KB_MARGIN_PX - kbTop
      if (overlapNeeded <= 0) return kbOverlapRef.current
      return Math.min(delta, kbOverlapRef.current + Math.ceil(overlapNeeded))
    }

    const applyLift = (): void => {
      kbOverlapRef.current = computeLift()
      const el = sheetRef.current
      if (el && !drag.current) {
        el.style.transform = kbOverlapRef.current > 0 ? `translateY(-${kbOverlapRef.current}px)` : ''
      }
    }

    vv.addEventListener('resize', applyLift)
    sheet.addEventListener('focusin', applyLift)
    applyLift()
    return () => {
      vv.removeEventListener('resize', applyLift)
      sheet.removeEventListener('focusin', applyLift)
      kbOverlapRef.current = 0
      const el = sheetRef.current
      if (el) el.style.transform = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const onSheetPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!open) return
    const control = (e.target as HTMLElement).closest(INTERACTIVE_SELECTOR)
    if (control instanceof HTMLInputElement && !PICKER_INPUT_TYPES.has(control.type)) {
      e.preventDefault()
      control.focus({ preventScroll: true })
      return
    }
    drag.current = { startY: e.clientY, samples: [{ y: e.clientY, t: performance.now() }] }
    const el = sheetRef.current
    if (el) {
      el.style.transition = 'none'
      e.currentTarget.setPointerCapture(e.pointerId)
    }
  }

  const onSheetPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    d.samples.push({ y: e.clientY, t: performance.now() })
    while (d.samples.length > 2 && last(d.samples).t - d.samples[0].t > VELOCITY_WINDOW_MS) {
      d.samples.shift()
    }
    const dy = Math.max(0, e.clientY - d.startY)
    const el = sheetRef.current
    if (el) el.style.transform = `translateY(${dy - kbOverlapRef.current}px)`
  }

  const onSheetPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    drag.current = null
    const el = sheetRef.current
    if (!d || !el) return
    const dy = Math.max(0, e.clientY - d.startY)
    const s = d.samples
    const dt = last(s).t - s[0].t
    const velocity = dt > 0 ? (last(s).y - s[0].y) / dt : 0
    const dismiss =
      dy > DISMISS_DISTANCE_PX || (dy > FLICK_MIN_DISTANCE_PX && velocity > FLICK_VELOCITY_PX_MS)
    el.style.transition = ''
    if (dismiss) {
      el.style.transform = ''
      onClose()
    } else {
      const rest = kbOverlapRef.current
      el.style.transform = rest > 0 ? `translateY(-${rest}px)` : ''
    }
  }

  function last(samples: { y: number; t: number }[]) {
    return samples[samples.length - 1]
  }

  return (
    <>
      <div
        aria-hidden="true"
        className={`modal-backdrop${open ? ' modal-backdrop--open' : ''}`}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Aggiungi'}
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
            />
          </div>

          <div className='bottom-modal-section'>
            <label htmlFor="" className='bottom-modal-lab'>input testo</label>
            <input
              type="text"
              className='bottom-modal-input'
            />
          </div>

          <div className='bottom-modal-section'>
            <label htmlFor="" className='bottom-modal-lab'>input testo</label>
            <input
              type="text"
              className='bottom-modal-input'
            />
          </div>

          <div className='bottom-modal-section'>
            <label htmlFor="" className='bottom-modal-lab'>input testo</label>
            <input
              type="text"
              className='bottom-modal-input'
            />
          </div>
        </div>
      </div>
    </>
  )
}
