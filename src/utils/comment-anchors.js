const WHITESPACE_PATTERN = /[\s\u00a0]/
const HTML_ENTITY_MAP = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

export const normalizeAnchorText = (value) => normalizeWithMap(value || '').text

export const findAnchoredTextRange = (source, anchor) => {
  const normalizedSource = normalizeWithMap(source || '')
  const quoteCandidates = uniqueNonEmpty([
    normalizeAnchorText(anchor?.quoteText),
    normalizeAnchorText(anchor?.originalQuoteText),
  ])
  const beforeText = normalizeAnchorText(anchor?.beforeText)
  const afterText = normalizeAnchorText(anchor?.afterText)

  for (const quoteText of quoteCandidates) {
    const matches = findAllMatches(normalizedSource.text, quoteText)
    if (!matches.length) {
      continue
    }

    const contextualMatches = matches.filter((start) => {
      const end = start + quoteText.length
      const beforeMatches =
        !beforeText ||
        normalizeAnchorText(normalizedSource.text.slice(0, start)).endsWith(
          beforeText,
        )
      const afterMatches =
        !afterText ||
        normalizeAnchorText(normalizedSource.text.slice(end)).startsWith(
          afterText,
        )
      return beforeMatches && afterMatches
    })

    const targetStart =
      contextualMatches.length === 1
        ? contextualMatches[0]
        : !beforeText && !afterText && matches.length === 1
          ? matches[0]
          : null

    if (targetStart === null || targetStart === undefined) {
      continue
    }

    const targetEnd = targetStart + quoteText.length
    const rawStart = normalizedSource.rawIndexes[targetStart]
    const rawEnd = normalizedSource.rawIndexes[targetEnd - 1]
    if (rawStart === undefined || rawEnd === undefined) {
      continue
    }
    return { start: rawStart, end: rawEnd + 1 }
  }

  return null
}

export const findAnchorContextInHtml = (html, anchorId, contextLength = 24) => {
  if (!html || !anchorId) {
    return null
  }

  const spanPattern = new RegExp(
    `<span\\b(?=[^>]*\\bdata-comment-anchor-id=["']${escapeRegExp(anchorId)}["'])[^>]*>([\\s\\S]*?)<\\/span>`,
    'i',
  )
  const match = spanPattern.exec(html)
  if (!match) {
    return null
  }

  const beforeHtml = html.slice(Math.max(0, match.index - contextLength * 20), match.index)
  const afterStart = match.index + match[0].length
  const afterHtml = html.slice(afterStart, afterStart + contextLength * 20)

  return {
    quoteText: stripHtml(match[1] || ''),
    beforeText: stripHtml(beforeHtml).slice(-contextLength),
    afterText: stripHtml(afterHtml).slice(0, contextLength),
  }
}

const normalizeWithMap = (source) => {
  let text = ''
  const rawIndexes = []
  let pendingSpaceIndex = null

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    if (!char) {
      continue
    }

    if (WHITESPACE_PATTERN.test(char)) {
      if (text && pendingSpaceIndex === null) {
        pendingSpaceIndex = index
      }
      continue
    }

    if (pendingSpaceIndex !== null) {
      text += ' '
      rawIndexes.push(pendingSpaceIndex)
      pendingSpaceIndex = null
    }

    text += char
    rawIndexes.push(index)
  }

  return { text, rawIndexes }
}

const findAllMatches = (source, target) => {
  const matches = []
  let index = source.indexOf(target)
  while (index >= 0) {
    matches.push(index)
    index = source.indexOf(target, index + target.length)
  }
  return matches
}

const uniqueNonEmpty = (values) => Array.from(new Set(values.filter(Boolean)))

const stripHtml = (value) => {
  return decodeHtmlEntities(value.replace(/<[^>]*>/g, ''))
    .replace(/\s+/g, ' ')
    .trim()
}

const decodeHtmlEntities = (value) => {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (entity, code) => {
    if (code.startsWith('#x') || code.startsWith('#X')) {
      return String.fromCodePoint(Number.parseInt(code.slice(2), 16))
    }
    if (code.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(code.slice(1), 10))
    }
    return HTML_ENTITY_MAP[code] || entity
  })
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
