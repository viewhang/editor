const normalizeId = (id) => {
  return id == null ? '' : String(id).trim()
}

const normalizeUrl = (url) => {
  return url == null ? '' : String(url).trim()
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

  return hasPersistentImageId(attrs) || normalizeUrl(attrs.src) !== ''
}

export const canUseRawImageSource = (attrs = {}) => {
  // 上传中的本地预览需要直接展示 src；没有 id 的旧数据也只能按旧 url 兜底。
  return attrs.uploaded === false || !hasPersistentImageId(attrs)
}
