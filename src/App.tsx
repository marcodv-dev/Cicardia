import { useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Header from './components/Header'
import { useHideOnScroll } from './hooks/useHideOnScroll'
import { useAnyInputFocused } from './hooks/useAnyInputFocused'
import { useKeyboardOpen } from './hooks/useKeyboardOpen'
import { useScrollRestoration } from './hooks/useScrollRestoration'
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'
import DashboardBoxPage from './pages/DashboardBoxPage'
import Form from './pages/Form'

export default function App() {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const headerHidden = useHideOnScroll(scrollerRef)
  const keyboardOpen = useKeyboardOpen()
  const inputFocused = useAnyInputFocused()
  useScrollRestoration(scrollerRef)
  const { pathname } = useLocation()

  return (
    <>
      <div className={`statusbar-veil${headerHidden ? ' statusbar-veil--visible' : ''}`} />
      <Header hidden={headerHidden} />
      <div className="app-shell">
        <div className="app-scroll" ref={scrollerRef}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboardBox/:boxId" element={<DashboardBoxPage />} />
            <Route path="/form" element={<Form />} />
          </Routes>
        </div>
      </div>
      {!pathname.startsWith('/dashboardBox') && (
        <BottomNav scale={headerHidden} hidden={keyboardOpen || inputFocused} scrollerRef={scrollerRef} />
      )}
    </>
  )
}
