import { useEffect } from 'react'

export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return
    const body = document.body
    const prevPosition = body.style.position
    const prevWidth = body.style.width
    const prevTop = body.style.top
    const scrollY = window.scrollY

    body.style.position = 'fixed'
    body.style.width = '100%'
    body.style.top = `-${scrollY}px`

    return () => {
      body.style.position = prevPosition
      body.style.width = prevWidth
      body.style.top = prevTop
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}
