const normalizeUrl = (url) => {
  return typeof url === 'string' ? url.trim() : ''
}

const isEmptyImageSource = (src) => {
  const value = normalizeUrl(src).toLowerCase()
  return value === '' || value === 'null' || value === 'undefined'
}

export const normalizeImageSource = (src) => {
  return isEmptyImageSource(src) ? null : normalizeUrl(src)
}

export const buildUploadedImageAttrs = (result = {}) => {
  const payload = result || {}
  const url = normalizeUrl(payload.url)
  if (!url) {
    throw new Error('Image upload result must include url.')
  }

  return {
    id: payload.id ?? null,
    src: url,
    uploaded: true,
  }
}

export const parseImageSource = (src) => {
  return normalizeImageSource(src)
}

export const parseImageBooleanAttribute = (element, name, fallback = false) => {
  const rawValue = element?.getAttribute?.(name)
  if (rawValue == null) {
    return fallback
  }

  if (typeof rawValue === 'boolean') {
    return rawValue
  }

  const value = String(rawValue).trim().toLowerCase()
  if (['false', '0', 'no', 'null', 'undefined'].includes(value)) {
    return false
  }
  if (['', 'true', '1', 'yes'].includes(value)) {
    return true
  }

  return fallback
}

export const sanitizeImageHTMLAttributes = (attrs = {}) => {
  const sanitized = { ...attrs }

  // HTML 中的 src="null" 会被浏览器解析成当前路由下的相对地址，例如 /doc/{id}/null。
  if (isEmptyImageSource(sanitized.src)) {
    delete sanitized.src
  }

  return sanitized
}
