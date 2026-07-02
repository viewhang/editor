const normalizeId = (id) => {
  return id == null ? '' : String(id).trim()
}

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

export const hasPersistentImageId = (attrs = {}) => {
  return normalizeId(attrs.id) !== ''
}

export const buildUploadedImageAttrs = (result = {}) => {
  const payload = result || {}
  const id = normalizeId(payload.id)
  if (id) {
    // 上传结果有持久化文件 id 时，文档只保存 id；访问地址交给 onFileLoad 动态解析。
    return {
      id,
      src: null,
      uploaded: true,
    }
  }

  const url = normalizeUrl(payload.url)
  if (!url) {
    throw new Error('Image upload result must include id or url.')
  }

  return {
    src: url,
    uploaded: true,
  }
}

export const shouldResolveImageSource = (attrs = {}) => {
  if (attrs.uploaded === false) {
    return false
  }

  return hasPersistentImageId(attrs) || normalizeImageSource(attrs.src) !== null
}

export const canUseRawImageSource = (attrs = {}) => {
  // 上传中的本地预览需要直接展示 src；没有 id 的旧数据也只能按旧 url 兜底。
  return (
    (attrs.uploaded === false || !hasPersistentImageId(attrs)) &&
    normalizeImageSource(attrs.src) !== null
  )
}

export const getRenderableImageSource = (attrs = {}, resolvedSrc = null) => {
  const resolved = normalizeImageSource(resolvedSrc)
  if (resolved) {
    return resolved
  }

  return canUseRawImageSource(attrs) ? normalizeImageSource(attrs.src) : null
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
