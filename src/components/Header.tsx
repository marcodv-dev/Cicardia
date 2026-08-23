import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { boxes } from '../data/boxes'
import BottomSheet from './modals/BottomSheet'

interface HeaderProps {
  hidden: boolean
}

export default function Header({ hidden }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isBoxDetail = pathname.startsWith('/dashboardBox')
  const box = isBoxDetail
    ? boxes.find((b) => b.id === Number(pathname.split('/')[2]))
    : undefined

  return (
    <>
      <header
        className={`app-header${hidden ? ' app-header--hidden' : ''}${isBoxDetail ? ' app-header--detail' : ''}`}
        style={{backgroundColor:`${box? box.color : ''}`}}
      >
        {isBoxDetail ? (
          <>
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate('/dashboard')}
            >
              {'<'}
            </button>
            <h1 className="app-header__title">{box?.title ?? 'Box'}</h1>
            <div style={{width:36}}/>
          </>
        ) : (
          <>
            <h1 className="app-header__title">Template PWA</h1>
            <button
              type="button"
              className="btn md accent"
              onClick={() => setOpen(true)}
            >
              Add
            </button>
          </>
        )}
      </header>
      {!isBoxDetail && <BottomSheet open={open} onClose={() => setOpen(false)} />}
    </>
  )
}
