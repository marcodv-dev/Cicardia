import { useEffect, useRef, useState, type RefObject } from 'react'
import { useLocation } from 'react-router-dom'

export function useHideOnScroll(
  scrollerRef: RefObject<HTMLDivElement | null>
): boolean {
  const [hidden, setHidden] = useState(false)
  const { pathname } = useLocation()
  const lastY = useRef(0)

  function getY(): number {
    const el = scrollerRef.current
    return (el ? el.scrollTop : 0) + window.scrollY
  }

  useEffect(() => {
    lastY.current = getY()
    setHidden(false)
  }, [pathname])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    let ticking = false
    let frame = 0

    const update = () => {
      const y = getY()
      const delta = y - lastY.current
      if (delta > 0 && y > 80) {
        setHidden(true)
      } else if (delta < 0) {
        setHidden(false)
      }
      lastY.current = y
      ticking = false
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      frame = requestAnimationFrame(update)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScroll)
    }
  }, [scrollerRef])

  return hidden
}
