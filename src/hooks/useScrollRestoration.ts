import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { useLocation } from 'react-router-dom'

export function useScrollRestoration(
  scrollerRef: RefObject<HTMLDivElement | null>
): void {
  const { pathname } = useLocation()
  const positions = useRef(new Map<string, number>())

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    let ticking = false
    const save = () => {
      positions.current.set(pathname, el.scrollTop + window.scrollY)
      ticking = false
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(save)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScroll)
    }
  }, [pathname, scrollerRef])

  useLayoutEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTop = positions.current.get(pathname) ?? 0
    window.scrollTo(0, 0)
  }, [pathname])
}
