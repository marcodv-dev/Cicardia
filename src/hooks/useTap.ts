import { useEffect, useRef } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

const MAX_DISTANCE_PX = 10
const MAX_DURATION_MS = 350
const CLICK_GUARD_MS = 500

interface TapOrigin {
  x: number
  y: number
  at: number
}

export interface TapHandlers<T extends HTMLElement = HTMLElement> {
  ref: React.RefObject<T | null>
  guardedOnClick: (e: ReactMouseEvent) => void
}

export function useTap<T extends HTMLElement = HTMLElement>(
  onTap: () => void
): TapHandlers<T> {
  const ref = useRef<T | null>(null)
  const onTapRef = useRef(onTap)
  onTapRef.current = onTap
  const origin = useRef<TapOrigin | null>(null)
  const lastTapAt = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const dispatch = (): void => {
      lastTapAt.current = Date.now()
      onTapRef.current()
    }

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const t = e.touches[0]
      origin.current = { x: t.clientX, y: t.clientY, at: Date.now() }
    }

    const onTouchEnd = (e: TouchEvent) => {
      const start = origin.current
      origin.current = null
      if (!start) return
      const t = e.changedTouches[0]
      const distance = Math.hypot(t.clientX - start.x, t.clientY - start.y)
      const duration = Date.now() - start.at
      if (distance > MAX_DISTANCE_PX || duration > MAX_DURATION_MS) return
      e.preventDefault()
      dispatch()
    }

    const onTouchCancel = (): void => {
      origin.current = null
    }

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      origin.current = { x: e.clientX, y: e.clientY, at: Date.now() }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const start = origin.current
      origin.current = null
      if (!start) return
      const distance = Math.hypot(e.clientX - start.x, e.clientY - start.y)
      const duration = Date.now() - start.at
      if (distance > MAX_DISTANCE_PX || duration > MAX_DURATION_MS) return
      dispatch()
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchCancel)
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointerup', onPointerUp)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchCancel)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointerup', onPointerUp)
    }
  }, [])

  const guardedOnClick = (e: ReactMouseEvent): void => {
    if (Date.now() - lastTapAt.current < CLICK_GUARD_MS) {
      e.preventDefault()
    }
  }

  return { ref, guardedOnClick }
}
