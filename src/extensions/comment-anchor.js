import { Mark } from '@tiptap/core'

export default Mark.create({
  name: 'commentAnchor',
  priority: 1000,
  inclusive: false,

  addAttributes() {
    return {
      anchorId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-comment-anchor-id'),
        renderHTML: ({ anchorId }) => {
          if (!anchorId) {
            return {}
          }
          return {
            'data-comment-anchor-id': anchorId,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-anchor-id]',
        consuming: false,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const anchorId = HTMLAttributes['data-comment-anchor-id']
    return [
      'span',
      {
        ...(anchorId ? { 'data-comment-anchor-id': anchorId } : {}),
        class: 'epoch-comment-anchor',
      },
      0,
    ]
  },

  addCommands() {
    return {
      setCommentAnchor:
        (anchorId) =>
        ({ chain }) => {
          if (!anchorId) {
            return false
          }
          return chain().setMark(this.name, { anchorId }).run()
        },
      unsetCommentAnchor:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name).run()
        },
    }
  },
})
