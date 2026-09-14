import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Oggi from './pages/Oggi'
import Dieta from './pages/Dieta'
import Dispensa from './pages/Dispensa'
import Spesa from './pages/Spesa'
import DettaglioPasto from './pages/DettaglioPasto'
import TemplateForm from './pages/TemplateForm'
import NuovoAlimento from './pages/NuovoAlimento'
import { useDeviceOrientation } from './hooks/useDeviceOrientation'
import { SaveProvider } from './context/SaveContext'
import { ToastProvider } from './context/ToastContext'

const TAB_ROUTES = ['/', '/dieta', '/dispensa', '/spesa']

export default function App() {
  const { pathname } = useLocation()
  const isTab = TAB_ROUTES.includes(pathname)
  const { needsPrompt, requestPermission } = useDeviceOrientation()

  return (
    <ToastProvider>
      <SaveProvider>
        {needsPrompt && (
          <button className="parallax-prompt" onClick={requestPermission} type="button">
            Attiva movimento
          </button>
        )}
        <Header />
        <div className='statusbar-veil'/>
        <main className='app-shell'>
          <Routes>
            <Route path="/" element={<Oggi />} />
            <Route path="/dieta" element={<Dieta />} />
            <Route path="/dispensa" element={<Dispensa />} />
            <Route path="/spesa" element={<Spesa />} />
            <Route path="/pasti/nuovo" element={<TemplateForm />} />
            <Route path="/pasti/:id/modifica" element={<TemplateForm />} />
            <Route path="/pasti/:id" element={<DettaglioPasto />} />
            <Route path="/dispensa/nuovo" element={<NuovoAlimento />} />
          </Routes>
        </main>
        {isTab && <BottomNav />}
      </SaveProvider>
    </ToastProvider>
  )
}
