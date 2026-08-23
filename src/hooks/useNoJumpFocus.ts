import { useRef, type PointerEvent as ReactPointerEvent } from 'react'

export function useNoJumpFocus<T extends HTMLElement = HTMLInputElement>() {
  const ref = useRef<T | null>(null)
  const onPointerDown = (e: ReactPointerEvent<T>): void => {
    e.preventDefault()
    ref.current?.focus({ preventScroll: true })
  }
  return { ref, onPointerDown }
}
