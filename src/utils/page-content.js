export const shouldTrackPageContent = (layout) => layout !== 'web'

export const getPageContentElement = (container) => {
  if (!container || typeof document === 'undefined') {
    return null
  }
  return document.querySelector(`${container} .umo-page-content`)
}
