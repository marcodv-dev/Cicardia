import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ClipboardIcon, ShoppingCartSimpleIcon, RowsIcon, CalendarIcon, CalendarBlankIcon } from '@phosphor-icons/react'

const tabs = [
  { path: '/', label: 'Oggi', icon: <CalendarBlankIcon size={32} weight="thin" />, iconActive: <CalendarBlankIcon size={32} weight="fill" /> },
  { path: '/dieta', label: 'Dieta', icon: <ClipboardIcon size={32} weight="thin" />, iconActive: <ClipboardIcon size={32} weight="fill" /> },
  { path: '/dispensa', label: 'Dispensa', icon: <RowsIcon size={32} weight="thin" />, iconActive: <RowsIcon size={32} weight="fill" /> },
  { path: '/spesa', label: 'Spesa', icon: <ShoppingCartSimpleIcon size={32} weight="thin" />, iconActive: <ShoppingCartSimpleIcon size={32} weight="fill" /> },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isStack = pathname.startsWith('/pasti/')

  function handleTabClick(path: string) {
    if (isStack) {
      navigate(path)
    }
  }

  return (
    <nav className='nav'>
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
