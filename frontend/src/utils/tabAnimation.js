const defaultTitle = 'Mercado Certo'
const attentionTitle = 'Novas ofertas | Mercado Certo'
let titleTimer = null

export function startTabAnimation() {
  if (typeof document === 'undefined' || titleTimer) return

  document.title = defaultTitle
  let showingAttention = false

  titleTimer = window.setInterval(() => {
    if (!document.hidden) {
      document.title = defaultTitle
      return
    }

    showingAttention = !showingAttention
    document.title = showingAttention ? attentionTitle : defaultTitle
  }, 1800)
}

export function stopTabAnimation() {
  if (titleTimer) {
    window.clearInterval(titleTimer)
    titleTimer = null
  }

  if (typeof document !== 'undefined') {
    document.title = defaultTitle
  }
}
