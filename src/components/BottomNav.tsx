import { NavLink, useNavigate } from 'react-router-dom'
import { useTap } from '../hooks/useTap'

interface BottomNavProps {
  scale: boolean
}

export default function BottomNav({ scale }: BottomNavProps) {
  const navigate = useNavigate()
  const homeTap = useTap<HTMLAnchorElement>(() => navigate('/'))
  const buttonTap = useTap<HTMLAnchorElement>(() => navigate('/button'))

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `bottom-nav__link${isActive ? ' bottom-nav__link--active' : ''}`

  return (
    <nav className={`bottom-nav${scale ? ' scale' : ''}`}>
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
        ref={buttonTap.ref}
        to="/button"
        className={linkClass}
        onClick={buttonTap.guardedOnClick}
      >
        Button
      </NavLink>
    </nav>
  )
}
