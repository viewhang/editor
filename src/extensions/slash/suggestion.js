import { computePosition, flip, shift } from '@floating-ui/dom'
import { PluginKey } from '@tiptap/pm/state'
import { posToDOMRect, VueRenderer } from '@tiptap/vue-3'

import { getSlashCommandItems } from './items'
import SlashCommandMenu from './menu.vue'

const updatePosition = (editor, element) => {
  const virtualElement = {
    getBoundingClientRect: () =>
      posToDOMRect(
        editor.view,
        editor.state.selection.from,
        editor.state.selection.to,
      ),
  }

  computePosition(virtualElement, element, {
    placement: 'bottom-start',
    strategy: 'absolute',
    middleware: [shift({ padding: 8 }), flip()],
  }).then(({ x, y, strategy }) => {
    element.style.width = 'max-content'
    element.style.position = strategy
    element.style.left = `${x}px`
    element.style.top = `${y}px`
  })
}

const isAllowedContext = ({ editor, state, range, char, enabled }) => {
  if (!enabled || !editor.isEditable || !state.selection.empty) {
    return false
  }

  const { $from } = state.selection
  if (!$from.parent.isTextblock || $from.parent.type.spec.code) {
    return false
  }

  const textBefore = $from.parent.textBetween(
    0,
    $from.parentOffset,
    undefined,
    '\ufffc',
  )
  const triggerIndex = textBefore.lastIndexOf(char)
  if (triggerIndex < 0) {
    return false
  }

  // 仅在当前块的开头空白区域触发，避免普通文本中的斜杠误唤起命令面板。
  return /^\s*$/.test(textBefore.slice(0, triggerIndex)) && range.from >= $from.start()
}

export default ({ options, container, uploadFileMap }) => {
  return {
    char: options.value.slashCommands?.suggestionChar || '/',
    pluginKey: new PluginKey('slash-command'),
    allowSpaces: false,
    allowedPrefixes: null,
    items: ({ query }) => {
      return getSlashCommandItems({
        options,
        container,
        query,
        uploadFileMap,
      })
    },
    command: ({ editor, range, props }) => {
      return props.command?.({ editor, range })
    },
    allow: ({ editor, state, range }) => {
      return isAllowedContext({
        editor,
        state,
        range,
        char: options.value.slashCommands?.suggestionChar || '/',
        enabled: !!options.value.slashCommands?.enabled,
      })
    },
    render: () => {
      let component

      return {
        onStart: (props) => {
          component = new VueRenderer(SlashCommandMenu, {
            props,
            editor: props.editor,
          })

          if (!props.clientRect) {
            return
          }

          component.element.style.position = 'absolute'
          document.body.appendChild(component.element)
          updatePosition(props.editor, component.element)
        },
        onUpdate(props) {
          component.updateProps(props)
          if (!props.clientRect) {
            return
          }
          updatePosition(props.editor, component.element)
        },
        onKeyDown(props) {
          if (props.event.key === 'Escape') {
            component.destroy()
            return true
          }
          return component.ref?.onKeyDown(props)
        },
        onExit() {
          component.element?.remove()
          component.destroy()
        },
      }
    },
  }
}
