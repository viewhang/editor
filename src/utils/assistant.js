export const getAssistantCommandLabel = (command, localize) => {
  return localize?.(command?.label) || localize?.(command?.value) || ''
}

export const getAssistantCommandValue = (command, localize) => {
  return localize?.(command?.value) || localize?.(command?.label) || ''
}

export const buildAssistantPayload = ({
  command,
  input,
  lang,
  output = 'rich-text',
  locale,
}) => {
  const payload = {
    lang,
    input,
    command: getAssistantCommandValue(command, locale),
    output,
  }
  if (command?.assistantId !== undefined) {
    payload.assistantId = command.assistantId
  }
  if (command?.commandKey !== undefined) {
    payload.commandKey = command.commandKey
  }
  if (command?.id !== undefined) {
    payload.commandId = command.id
  }
  return payload
}

export const buildAssistantContent = (editor) => {
  return {
    html: editor?.getHTML?.() || '',
    json: editor?.getJSON?.() || null,
    text: editor?.getText?.() || '',
  }
}

export const validateAssistantInputLength = (input, maxlength) => {
  if (!Number.isInteger(maxlength) || maxlength <= 0) {
    return true
  }
  return String(input || '').length <= maxlength
}

export const isReadableStreamLike = (value) => {
  return !!value && typeof value.getReader === 'function'
}

const decodeChunk = (chunk) => {
  if (typeof chunk === 'string') {
    return chunk
  }
  if (chunk instanceof Uint8Array) {
    return new TextDecoder().decode(chunk)
  }
  return String(chunk ?? '')
}

export const readAssistantResult = async (result, onChunk) => {
  if (result === undefined || result === null || result === false) {
    return ''
  }
  if (typeof result === 'string') {
    return result
  }
  if (!isReadableStreamLike(result)) {
    throw new Error('AI assistant onMessage must return a string or ReadableStream.')
  }

  const reader = result.getReader()
  let content = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    const chunk = decodeChunk(value)
    if (chunk.trim() === '[DONE]') {
      continue
    }
    content += chunk
    onChunk?.(chunk, content)
  }
  return content
}
