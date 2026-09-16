import { useRef, useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ClipboardIcon, ShoppingCartSimpleIcon, RowsIcon, CalendarBlankIcon } from '@phosphor-icons/react'

const tabs = [
  { path: '/', label: 'Oggi', icon: <CalendarBlankIcon size={32} weight="thin" />, iconActive: <CalendarBlankIcon size={32} weight="fill" /> },
  { path: '/dieta', label: 'Dieta', icon: <ClipboardIcon size={32} weight="thin" />, iconActive: <ClipboardIcon size={32} weight="fill" /> },
  { path: '/dispensa', label: 'Dispensa', icon: <RowsIcon size={32} weight="thin" />, iconActive: <RowsIcon size={32} weight="fill" /> },
  { path: '/spesa', label: 'Spesa', icon: <ShoppingCartSimpleIcon size={32} weight="thin" />, iconActive: <ShoppingCartSimpleIcon size={32} weight="fill" /> },
]

export default function BottomNav({isTab} : { isTab: boolean }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isStack = pathname.startsWith('/pasti/')
  const navRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const [ready, setReady] = useState(false)

  const activeIndex = tabs.findIndex(t =>
    t.path === '/' ? pathname === '/' : pathname.startsWith(t.path)
  )

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const items = nav.querySelectorAll('.nav-item')
    const activeItem = items[activeIndex] as HTMLElement
    if (activeItem) {
      setIndicator({
        left: activeItem.offsetLeft,
        width: activeItem.offsetWidth,
      })
      if (!ready) requestAnimationFrame(() => setReady(true))
    }
  }, [activeIndex])

  function handleTabClick(path: string) {
    if (isStack) {
      navigate(path)
    }
  }

  return (
    <nav className={`nav ${!isTab&&'hide'}`} ref={navRef}>
      <div className={`nav-indicator${ready ? '' : ' no-transition'}`} style={{ left: indicator.left, width: indicator.width }} />
      {tabs.map(tab => (
        <NavLink
          className='nav-item'
          key={tab.path}
          to={tab.path}
          end={tab.path === '/'}
          onClick={() => handleTabClick(tab.path)}
        >
          {({ isActive }) => (
            <>
              {isActive ? tab.iconActive : tab.icon}
              <label htmlFor="">{tab.label}</label>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
