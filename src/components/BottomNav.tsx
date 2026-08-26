import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTap } from '../hooks/useTap'

interface BottomNavProps {
  scale: boolean
  hidden?: boolean
  scrollerRef: RefObject<HTMLDivElement | null>
}

interface PillState {
  x: number
  w: number
  visible: boolean
}

interface LinkPos {
  route: string
  x: number
  w: number
}

const DRAG_THRESHOLD_PX = 20

export default function BottomNav({ scale, hidden = false, scrollerRef }: BottomNavProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const navRef = useRef<HTMLElement | null>(null)
  const pillRef = useRef<HTMLSpanElement | null>(null)
  const [pill, setPill] = useState<PillState>({ x: 0, w: 0, visible: false })
  const [pillAnimating, setPillAnimating] = useState(false)
  const pillAnimatingRef = useRef(false)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, pillX: 0 })
  const linkPositions = useRef<LinkPos[]>([])
  const fromNavClick = useRef(false)
  const homeTap = useTap<HTMLAnchorElement>(() => go('/'))
  const dashboardTap = useTap<HTMLAnchorElement>(() => go('/dashboard'))
  const formTap = useTap<HTMLAnchorElement>(() => go('/form'))

  function go(to: string): void {
    if (to === pathname) {
      scrollerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    scrollerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    fromNavClick.current = true
    navigate(to)
  }

  const updatePill = useCallback((): void => {
    const nav = navRef.current
    const active = nav?.querySelector<HTMLAnchorElement>('.bottom-nav__link--active')
    if (!active) {
      return
    }
    const x = active.offsetLeft
    const w = active.offsetWidth
    const apply = () => setPill(prev => (prev.visible && prev.x === x && prev.w === w ? prev : { x, w, visible: true }))
    const links = nav?.querySelectorAll<HTMLAnchorElement>('.bottom-nav__link')
    if (links) {
      linkPositions.current = Array.from(links).map(a => ({
        route: a.getAttribute('href')!,
        x: a.offsetLeft,
        w: a.offsetWidth,
      }))
    }
    if (fromNavClick.current) {
      fromNavClick.current = false
      pillAnimatingRef.current = true
      setPillAnimating(true)
      requestAnimationFrame(() => requestAnimationFrame(apply))
    } else {
      apply()
    }
  }, [])

  useLayoutEffect(updatePill, [updatePill, pathname])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      if (isDragging.current) {
        isDragging.current = false
        const el = pillRef.current
        if (el) el.style.transition = ''
        navRef.current?.classList.remove('bottom-nav--dragging')
      }
      updatePill()
    }
    window.addEventListener('resize', updatePill)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('resize', updatePill)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [updatePill])

  useEffect(() => {
    const el = pillRef.current
    if (!el) return
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName === 'transform') {
        navRef.current?.classList.remove('bottom-nav--dragging')
        if (pillAnimatingRef.current) {
          pillAnimatingRef.current = false
          setPillAnimating(false)
        }
      }
    }
    el.addEventListener('transitionend', onEnd)
    return () => el.removeEventListener('transitionend', onEnd)
  }, [])

  const clearDragging = useCallback(() => {
    navRef.current?.classList.remove('bottom-nav--dragging')
  }, [])

  useEffect(() => {
    if (!navRef.current?.classList.contains('bottom-nav--dragging')) return
    const t = setTimeout(clearDragging, 400)
    return () => clearTimeout(t)
  }, [pill.x, clearDragging])

  function findNearest(pillCenter: number): LinkPos | undefined {
    const links = linkPositions.current
    let best = links[0]
    let minD = Infinity
    for (const lp of links) {
      const d = Math.abs(pillCenter - (lp.x + lp.w / 2))
      if (d < minD) { minD = d; best = lp }
    }
    return best
  }

  function clamp(x: number, w: number): number {
    const links = linkPositions.current
    if (!links.length) return x
    const minX = links[0].x
    const maxX = links.at(-1)!.x + links.at(-1)!.w - w
    return Math.max(minX, Math.min(maxX, x))
  }

  const onPillPointerDown = (e: ReactPointerEvent<HTMLSpanElement>) => {
    isDragging.current = true
    dragStart.current = { x: e.clientX, pillX: pill.x }
    const el = pillRef.current
    if (el) {
      el.style.transition = 'none'
      if (e.nativeEvent.isTrusted) el.setPointerCapture(e.pointerId)
    }
    navRef.current?.classList.add('bottom-nav--dragging')
  }

  const onPillPointerMove = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (!isDragging.current) return
    const dx = e.clientX - dragStart.current.x
    const newX = clamp(dragStart.current.pillX + dx, pill.w)
    const el = pillRef.current
    if (el) el.style.transform = `translateX(${newX}px)`
  }

  const onPillPointerUp = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (!isDragging.current) return
    isDragging.current = false
    const el = pillRef.current
    if (el) el.style.transition = ''
    const nav = navRef.current
    const dx = e.clientX - dragStart.current.x
    if (Math.abs(dx) < DRAG_THRESHOLD_PX) {
      nav?.classList.remove('bottom-nav--dragging')
      const target = findNearest(pill.x + pill.w / 2)
      if (target) {
        if (el) el.style.transform = `translateX(${target.x}px)`
        go(target.route)
      }
      return
    }
    const finalPillX = clamp(dragStart.current.pillX + dx, pill.w)
    const nearest = findNearest(finalPillX + pill.w / 2)
    if (nearest && nearest.route !== pathname) {
      nav?.classList.remove('bottom-nav--dragging')
      navigate(nearest.route)
    } else if (nearest) {
      nav?.classList.remove('bottom-nav--dragging')
      if (el) el.style.transform = `translateX(${nearest.x}px)`
      updatePill()
    }
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `bottom-nav__link${isActive ? ' bottom-nav__link--active' : ''}`

  return (
    <nav
      ref={navRef}
      className={`bottom-nav ${scale ? ' scale' : ''}${hidden ? ' hidden' : ''}`}
    >
      <span
        ref={pillRef}
        aria-hidden="true"
        className={`bottom-nav__pill${pill.visible ? '' : ' bottom-nav__pill--hidden'}${pillAnimating ? ' bottom-nav__pill--animating' : ''}`}
        style={{ transform: `translateX(${pill.x}px)`, width: pill.w }}
        onPointerDown={onPillPointerDown}
        onPointerMove={onPillPointerMove}
        onPointerUp={onPillPointerUp}
      />
      <NavLink
        ref={homeTap.ref}
        to="/"
        end
        className={linkClass}
        onClick={homeTap.guardedOnClick}
      >
        Home
      </NavLink>
      <NavLink
        ref={dashboardTap.ref}
        to="/dashboard"
        className={linkClass}
        onClick={dashboardTap.guardedOnClick}
      >
        Dashboard
      </NavLink>
      <NavLink
        ref={formTap.ref}
        to="/form"
        className={linkClass}
        onClick={formTap.guardedOnClick}
      >
        Form
      </NavLink>
    </nav>
  )
}
