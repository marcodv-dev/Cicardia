import { useRef } from 'react'
import { Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Header from './components/Header'
import { useHideOnScroll } from './hooks/useHideOnScroll'
import { useScrollRestoration } from './hooks/useScrollRestoration'
import HomePage from './pages/HomePage'
import ButtonPage from './pages/ButtonPage'

export default function App() {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const headerHidden = useHideOnScroll(scrollerRef)
  useScrollRestoration(scrollerRef)

  return (
    <>
      <div className={`statusbar-veil${headerHidden ? ' statusbar-veil--visible' : ''}`} />
      <Header hidden={headerHidden} />
      <div className="app-shell">
        <div className="app-scroll" ref={scrollerRef}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/button" element={<ButtonPage />} />
          </Routes>
        </div>
      </div>
      <BottomNav scale={headerHidden}/>
    </>
  )
}
