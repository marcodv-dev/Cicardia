import { useLocation, useNavigate } from 'react-router-dom'
import { CaretLeftIcon, PlusIcon } from "@phosphor-icons/react"
import { useSave } from '../context/SaveContext'

const tabTitles: Record<string, string> = {
  '/': 'Today',
  '/dieta': 'Dieta',
  '/dispensa': 'Dispensa',
  '/spesa': 'Spesa',
}

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { triggerSave } = useSave()
  const isTemplateForm = pathname === '/pasti/nuovo' || pathname.endsWith('/modifica')
  const isDettaglioPasto = /^\/pasti\/[^/]+$/.test(pathname)
  const isNuovoAlimento = pathname === '/dispensa/nuovo'

  let title = tabTitles[pathname] ?? 'Cicardia'
  let showBack = false
  let rightAction: React.ReactNode = null

  if (isNuovoAlimento) {
    title = 'Nuovo alimento'
    showBack = true
    rightAction = (
      <button className='btn accent md sc' type="button" onClick={triggerSave}>
        Salva
      </button>
    )
  } else if (isTemplateForm) {
    title = pathname === '/pasti/nuovo' ? 'Nuovo pasto' : 'Modifica pasto'
    showBack = true
    rightAction = (
      <button className='btn accent md sc' type="button" onClick={triggerSave}>
        Salva
      </button>
    )
  } else if (isDettaglioPasto) {
    title = 'Dettagli pasto'
    showBack = true
    rightAction = (
      <button className='btn accent md sc' type="button" onClick={() => navigate(`${pathname}/modifica`)}>
        Modifica
      </button>
    )
  } else if (pathname === '/spesa') {
    rightAction = (
      <button className='btn accent md sc' type="button" onClick={triggerSave}>
        Salva
      </button>
    )
  } else if (pathname === '/dieta') {
    rightAction = (
      <button className='btn accent sc circle' type="button" onClick={() => navigate('/pasti/nuovo')}>
        <PlusIcon className='' size={36} weight="regular"/>
      </button>
    )
  } else if (pathname === '/dispensa') {
    rightAction = (
      <button className='btn accent sc circle' type="button" onClick={() => navigate('/dispensa/nuovo')}>
        <PlusIcon className='' size={36} weight="regular"/>
      </button>
    )
  }

  return (
    <header className='header'>
      {showBack ? (
        <button className='btn glass circle' type="button" onClick={() => navigate(-1)}>
          <CaretLeftIcon className='' size={36} weight="regular"/>
        </button>
      ) : (
        <span />
      )}
      <div className='header-div'>
        <h2 className={`header-title intel ${(title!='Today'&&title!='Dieta'&&title!='Dispensa'&&title!='Spesa')&&'sm'}`}>{title}</h2>
        {title=='Today'&&<label className='header-subtitle intel' htmlFor="">· {new Date().toLocaleDateString('it-IT', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        })}</label>}
      </div>

      {rightAction ?? <span />}
    </header>
  )
}
