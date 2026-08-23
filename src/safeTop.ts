function measureEnvTop(): number {
  const el = document.createElement('div')
  el.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:env(safe-area-inset-top, 0px);visibility:hidden;pointer-events:none'
  document.body.appendChild(el)
  const val = el.offsetHeight
  el.remove()
  return val
}

function refreshSafeTop(): void {
  const physicalGap = Math.max(0, window.screen.height - window.innerHeight)
  const corrected = Math.max(0, measureEnvTop() - physicalGap)
  document.documentElement.style.setProperty('--safe-top', `${corrected}px`)
}

refreshSafeTop()
window.addEventListener('resize', refreshSafeTop)
window.addEventListener('orientationchange', () => {
  window.setTimeout(refreshSafeTop, 100)
})
window.addEventListener('load', () => {
  window.setTimeout(refreshSafeTop, 300)
})
