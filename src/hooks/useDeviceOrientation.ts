import { useCallback, useEffect, useRef, useState } from 'react'

export function useDeviceOrientation() {
  const [gamma, setGamma] = useState(0)
  const [beta, setBeta] = useState(0)
  const [needsPrompt, setNeedsPrompt] = useState(false)
  const listening = useRef(false)

  const onOrientation = useCallback((e: DeviceOrientationEvent) => {
    setGamma(e.gamma ?? 0)
    setBeta(e.beta ?? 0)
  }, [])

  const startListening = useCallback(() => {
    if (listening.current) return
    listening.current = true
    window.addEventListener('deviceorientation', onOrientation)
    window.addEventListener('deviceorientationabsolute', onOrientation)
  }, [onOrientation])

  useEffect(() => {
    if (typeof DeviceOrientationEvent === 'undefined') return

    async function init() {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const result = await (DeviceOrientationEvent as any).requestPermission()
          if (result === 'granted') {
            startListening()
            return
          }
        } catch { /* fall through */ }
        setNeedsPrompt(true)
        return
      }

      startListening()
    }

    init()

    return () => {
      window.removeEventListener('deviceorientation', onOrientation)
      window.removeEventListener('deviceorientationabsolute', onOrientation)
    }
  }, [startListening, onOrientation])

  async function requestPermission() {
    try {
      const result = await (DeviceOrientationEvent as any).requestPermission()
      if (result === 'granted') {
        setNeedsPrompt(false)
        startListening()
      }
    } catch { /* denied */ }
  }

  const clampedGamma = Math.max(-20, Math.min(20, gamma))
  const clampedBeta = Math.max(-15, Math.min(15, beta))

  return { gamma: clampedGamma, beta: clampedBeta, needsPrompt, requestPermission }
}
