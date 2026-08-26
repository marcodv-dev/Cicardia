import { useRef, type PointerEvent as ReactPointerEvent } from 'react'

const PICKER_INPUT_TYPES = new Set(['date', 'time', 'month', 'week', 'datetime-local', 'color', 'file'])

export function useNoJumpFocus<T extends HTMLElement = HTMLInputElement>() {
  const ref = useRef<T | null>(null)
  const onPointerDown = (e: ReactPointerEvent<T>): void => {
    if (e.currentTarget instanceof HTMLInputElement && PICKER_INPUT_TYPES.has(e.currentTarget.type)) return
    e.preventDefault()
    ref.current?.focus({ preventScroll: true })
  }
  return { ref, onPointerDown }
}
