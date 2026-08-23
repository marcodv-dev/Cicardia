import type { RefObject } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTap } from '../hooks/useTap'

interface BottomNavProps {
  scale: boolean
  scrollerRef: RefObject<HTMLDivElement | null>
}

export default function BottomNav({ scale, scrollerRef }: BottomNavProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const homeTap = useTap<HTMLAnchorElement>(() => go('/'))
  const dashboardTap = useTap<HTMLAnchorElement>(() => go('/dashboard'))

  function go(to: string): void {
    if (to === pathname) {
      scrollerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    navigate(to)
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `bottom-nav__link${isActive ? ' bottom-nav__link--active' : ''}`

  return (
    <nav className={`bottom-nav ${scale ? ' scale' : ''}`}>
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
    </nav>
  )
}
