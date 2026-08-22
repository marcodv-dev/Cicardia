type IosNavigator = Navigator & { standalone?: boolean }

function measureEnvTop(): number {
  const el = document.createElement('div')
  el.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:env(safe-area-inset-top, 0px);visibility:hidden;pointer-events:none'
  document.body.appendChild(el)
  const val = el.offsetHeight
  el.remove()
  return val
}

const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.matchMedia('(display-mode: fullscreen)').matches ||
  (window.navigator as IosNavigator).standalone === true

const fallback = isStandalone
  ? Math.max(0, window.screen.height - window.innerHeight)
  : 0

document.documentElement.style.setProperty(
  '--safe-top',
  `${Math.max(measureEnvTop(), fallback)}px`
)
