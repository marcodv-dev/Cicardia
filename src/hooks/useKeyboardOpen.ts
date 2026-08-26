import { useEffect, useState } from 'react'

const KEYBOARD_MIN_DELTA_PX = 150

export function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = (): void => {
      const delta = Math.max(0, window.innerHeight - vv.height)
      const overlap = delta > KEYBOARD_MIN_DELTA_PX ? delta : 0
      setOpen(overlap > 0)
      document.documentElement.style.setProperty('--kb-height', `${Math.round(overlap)}px`)
    }

    vv.addEventListener('resize', update)
    window.addEventListener('resize', update)
    update()

    return () => {
      vv.removeEventListener('resize', update)
      window.removeEventListener('resize', update)
      document.documentElement.style.setProperty('--kb-height', '0px')
    }
  }, [])

  return open
}
