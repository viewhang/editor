import { isNumber, isRecord, isString } from '@tool-belt/type-predicates'

const DEFAULT_EXPIRE_IN = 5 * 60 * 1000

const normalizeUrl = (url) => {
  if (!isString(url)) {
    return null
  }
  const value = url.trim()
  return value === '' ? null : value
}

const getRawUrl = (file) => {
  return normalizeUrl(file?.src) || normalizeUrl(file?.url)
}

const normalizeResolvedFile = (result, fallbackUrl) => {
  const fallback = normalizeUrl(fallbackUrl)

  if (isString(result) && result.trim() !== '') {
    return {
      url: result.trim(),
      expiresAt: Date.now() + DEFAULT_EXPIRE_IN,
    }
  }

  if (isRecord(result) && isString(result.url) && result.url.trim() !== '') {
    return {
      ...result,
      url: result.url.trim(),
      expiresAt: isNumber(result.expiresAt)
        ? result.expiresAt
        : Date.now() + DEFAULT_EXPIRE_IN,
    }
  }

  return {
    url: fallback,
    expiresAt: Date.now() + DEFAULT_EXPIRE_IN,
  }
}

const createFileResolverKey = (file) => {
  return [file?.nodeType, file?.id, file?.url, file?.src, file?.name]
    .filter(Boolean)
    .join(':')
}

export const createFileResolver = ({ options }) => {
  const cache = new Map()

  const clear = (file) => {
    cache.delete(createFileResolverKey(file))
  }

  const resolve = async (file, runtime = {}) => {
    const fallbackUrl = getRawUrl(file)
    if (!fallbackUrl && !file?.id) {
      return {
        url: null,
        expiresAt: 0,
      }
    }

    const key = createFileResolverKey(file)
    const now = Date.now()
    const cached = cache.get(key)
    if (!runtime.force && cached && cached.expiresAt > now) {
      return cached
    }

    const payload = {
      ...file,
      rawUrl: fallbackUrl,
      force: !!runtime.force,
      reason: runtime.reason || 'display',
    }

    const result = await options.value?.onFileLoad?.(payload)
    const resolved = normalizeResolvedFile(
      result,
      runtime.allowFallback === false ? null : fallbackUrl,
    )
    cache.set(key, resolved)
    return resolved
  }

  return {
    resolve,
    clear,
  }
}
