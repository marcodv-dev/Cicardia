import { useEffect, useState } from 'react'

const INPUT_SELECTOR = 'input, textarea, select'

export function useAnyInputFocused(): boolean {
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const onFocusIn = (e: FocusEvent): void => {
      if (e.target instanceof HTMLElement && e.target.matches(INPUT_SELECTOR)) {
        setFocused(true)
      }
    }
    const onFocusOut = (): void => {
      window.setTimeout(() => {
        const active = document.activeElement
        setFocused(active instanceof HTMLElement && active.matches(INPUT_SELECTOR))
      }, 0)
    }
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  return focused
}
