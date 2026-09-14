import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

interface ToastContextValue {
  show: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((msg: string, duration = 1500) => {
    if (timer.current) clearTimeout(timer.current)
    if (fadeTimer.current) clearTimeout(fadeTimer.current)
    setMessage(msg)
    setVisible(true)
    timer.current = setTimeout(() => {
      setVisible(false)
      fadeTimer.current = setTimeout(() => setMessage(null), 300)
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className={`toast ${visible ? 'toast--visible' : ''}`} style={{whiteSpace:'pre-line'}}>
        {message}
      </div>
    </ToastContext.Provider>
  )
}
