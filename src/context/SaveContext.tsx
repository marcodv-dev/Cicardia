import { createContext, useContext, useRef, type ReactNode } from 'react'

interface SaveContextValue {
  registerSave: (fn: () => void) => void
  triggerSave: () => void
}

const SaveContext = createContext<SaveContextValue>({
  registerSave: () => {},
  triggerSave: () => {},
})

export function useSave() {
  return useContext(SaveContext)
}

export function SaveProvider({ children }: { children: ReactNode }) {
  const fnRef = useRef<(() => void) | null>(null)

  function registerSave(fn: () => void) {
    fnRef.current = fn
  }

  function triggerSave() {
    fnRef.current?.()
  }

  return (
    <SaveContext.Provider value={{ registerSave, triggerSave }}>
      {children}
    </SaveContext.Provider>
  )
}
