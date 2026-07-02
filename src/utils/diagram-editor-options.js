const locales = {
  'zh-CN': 'zh',
  'en-US': 'en',
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function getDiagramConfigurePayload(params = {}) {
  return isRecord(params.configure) ? params.configure : {}
}

function getDiagramUrlParams(params = {}) {
  return {
    ...params,
    configure: isRecord(params.configure) ? 1 : params.configure,
  }
}

export function buildDiagramFrameSrc({ domain, params = {}, locale = 'zh-CN' }) {
  const query = new URLSearchParams()
  const lang = params.lang || locales[locale] || locales['zh-CN']

  Object.entries(getDiagramUrlParams(params)).forEach(([key, value]) => {
    if (key === 'lang' || value === undefined || value === null || value === false) {
      return
    }
    query.set(key, String(value))
  })

  query.set('lang', lang)
  return `${domain}?${query.toString()}`
}
