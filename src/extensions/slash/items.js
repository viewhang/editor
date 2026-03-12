import { t } from '@/composables/i18n'
import { defaultSlashCommandItems } from '@/constants/slash-commands'

const createTextIcon = (text) => {
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="13" height="13" rx="3" stroke="currentColor"/><text x="8" y="11" text-anchor="middle" font-size="7" font-family="Arial, sans-serif" fill="currentColor">${text}</text></svg>`
}

const buildDefaultItems = ({ uploadFileMap, container }) => {
  return {
    paragraph: {
      key: 'paragraph',
      label: t('base.heading.paragraph'),
      description: t('slashCommands.items.paragraph'),
      icon: createTextIcon('P'),
      keywords: ['paragraph', 'text', 'body', '正文', '段落'],
      group: t('slashCommands.groups.basic'),
      command: ({ editor, range }) => {
        return editor.chain().focus().deleteRange(range).setParagraph().run()
      },
    },
    'heading-1': {
      key: 'heading-1',
      label: t('base.heading.text', { level: 1 }),
      description: t('slashCommands.items.heading1'),
      icon: createTextIcon('H1'),
      keywords: ['heading', 'title', 'h1', '标题1', '一级标题'],
      group: t('slashCommands.groups.basic'),
      command: ({ editor, range }) => {
        return editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleHeading({ level: 1 })
          .run()
      },
    },
    'heading-2': {
      key: 'heading-2',
      label: t('base.heading.text', { level: 2 }),
      description: t('slashCommands.items.heading2'),
      icon: createTextIcon('H2'),
      keywords: ['heading', 'title', 'h2', '标题2', '二级标题'],
      group: t('slashCommands.groups.basic'),
      command: ({ editor, range }) => {
        return editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleHeading({ level: 2 })
          .run()
      },
    },
    'heading-3': {
      key: 'heading-3',
      label: t('base.heading.text', { level: 3 }),
      description: t('slashCommands.items.heading3'),
      icon: createTextIcon('H3'),
      keywords: ['heading', 'title', 'h3', '标题3', '三级标题'],
      group: t('slashCommands.groups.basic'),
      command: ({ editor, range }) => {
        return editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleHeading({ level: 3 })
          .run()
      },
    },
    'bullet-list': {
      key: 'bullet-list',
      extension: 'bullet-list',
      label: t('list.bullet.text'),
      description: t('slashCommands.items.bulletList'),
      icon: 'bullet-list-2',
      keywords: ['bullet', 'unordered', 'list', '列表', '无序列表'],
      group: t('slashCommands.groups.basic'),
      command: ({ editor, range }) => {
        return editor.chain().focus().deleteRange(range).toggleBulletList().run()
      },
    },
    'ordered-list': {
      key: 'ordered-list',
      extension: 'ordered-list',
      label: t('list.ordered.text'),
      description: t('slashCommands.items.orderedList'),
      icon: 'ordered-list',
      keywords: ['ordered', 'numbered', 'list', '列表', '有序列表'],
      group: t('slashCommands.groups.basic'),
      command: ({ editor, range }) => {
        return editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleOrderedList()
          .run()
      },
    },
    'task-list': {
      key: 'task-list',
      label: t('list.task.text'),
      description: t('slashCommands.items.taskList'),
      icon: 'task-list',
      keywords: ['task', 'todo', 'checklist', '列表', '任务列表'],
      group: t('slashCommands.groups.basic'),
      command: ({ editor, range }) => {
        return editor.chain().focus().deleteRange(range).toggleTaskList().run()
      },
    },
    blockquote: {
      key: 'blockquote',
      label: t('base.quote'),
      description: t('slashCommands.items.blockquote'),
      icon: 'quote',
      keywords: ['quote', 'blockquote', '引用'],
      group: t('slashCommands.groups.basic'),
      command: ({ editor, range }) => {
        return editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleBlockquote()
          .run()
      },
    },
    'code-block': {
      key: 'code-block',
      extension: 'code-block',
      label: t('insert.codeBlock'),
      description: t('slashCommands.items.codeBlock'),
      icon: 'code-block',
      keywords: ['code', 'codeblock', '代码', '代码块'],
      group: t('slashCommands.groups.basic'),
      command: ({ editor, range }) => {
        return editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleCodeBlock()
          .run()
      },
    },
    divider: {
      key: 'divider',
      extension: 'horizontal-rule',
      label: t('insert.hr.text'),
      description: t('slashCommands.items.divider'),
      icon: 'hr',
      keywords: ['divider', 'horizontal rule', 'hr', '分隔线'],
      group: t('slashCommands.groups.insert'),
      command: ({ editor, range }) => {
        return editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHorizontalRule({})
          .run()
      },
    },
    table: {
      key: 'table',
      label: t('table.insert.text'),
      description: t('slashCommands.items.table'),
      icon: 'table',
      keywords: ['table', 'grid', '表格'],
      group: t('slashCommands.groups.insert'),
      command: ({ editor, range }) => {
        return editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run()
      },
    },
    image: {
      key: 'image',
      extension: 'image',
      label: t('insert.image.block'),
      description: t('slashCommands.items.image'),
      icon: 'image',
      keywords: ['image', 'photo', 'picture', '图片'],
      group: t('slashCommands.groups.media'),
      command: ({ editor, range }) => {
        return editor
          .chain()
          .focus()
          .deleteRange(range)
          .selectFiles('image', container, uploadFileMap.value)
          .run()
      },
    },
    file: {
      key: 'file',
      label: t('insert.file'),
      description: t('slashCommands.items.file'),
      icon: 'file',
      keywords: ['file', 'attachment', '附件', '文件'],
      group: t('slashCommands.groups.media'),
      command: ({ editor, range }) => {
        return editor
          .chain()
          .focus()
          .deleteRange(range)
          .selectFiles('file', container, uploadFileMap.value)
          .run()
      },
    },
    callout: {
      key: 'callout',
      extension: 'callout',
      label: t('insert.callout'),
      description: t('slashCommands.items.callout'),
      icon: 'callout',
      keywords: ['callout', 'highlight', 'notice', '高亮块'],
      group: t('slashCommands.groups.insert'),
      command: ({ editor, range }) => {
        return editor.chain().focus().deleteRange(range).insertCallout().run()
      },
    },
    details: {
      key: 'details',
      label: t('insert.details'),
      description: t('slashCommands.items.details'),
      icon: 'details',
      keywords: ['details', 'accordion', '折叠', '详情'],
      group: t('slashCommands.groups.insert'),
      command: ({ editor, range }) => {
        return editor.chain().focus().deleteRange(range).setDetails().run()
      },
    },
    toc: {
      key: 'toc',
      extension: 'toc',
      label: t('insert.toc'),
      description: t('slashCommands.items.toc'),
      icon: 'toc',
      keywords: ['toc', 'outline', 'table of contents', '目录', '大纲'],
      group: t('slashCommands.groups.page'),
      command: ({ editor, range }) => {
        return editor
          .chain()
          .focus()
          .deleteRange(range)
          .addTableOfContents()
          .run()
      },
    },
    'page-break': {
      key: 'page-break',
      label: t('page.break'),
      description: t('slashCommands.items.pageBreak'),
      icon: 'page-break',
      keywords: ['page break', 'break', '分页', '分页符'],
      group: t('slashCommands.groups.page'),
      command: ({ editor, range }) => {
        return editor.chain().focus().deleteRange(range).setPageBreak().run()
      },
    },
    mention: {
      key: 'mention',
      extension: 'mention',
      label: t('insert.mention'),
      description: t('slashCommands.items.mention'),
      icon: 'mention',
      keywords: ['mention', 'user', '@', '提及'],
      group: t('slashCommands.groups.insert'),
      isVisible: ({ users = [] }) => users.length > 0,
      command: ({ editor, range }) => {
        return editor.chain().focus().deleteRange(range).insertMention().run()
      },
    },
  }
}

const getMatchValues = (item) => {
  return [item.label, item.description, ...(item.keywords || []), item.key]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase())
}

const matchesQuery = (item, query) => {
  if (!query) {
    return true
  }
  return getMatchValues(item).some((value) => value.includes(query))
}

export const getSlashCommandItems = ({ options, container, query, uploadFileMap }) => {
  const configuredItems = options.value.slashCommands?.items
  const commandItems = buildDefaultItems({ uploadFileMap, container })
  const disabledExtensions = options.value.disableExtensions || []
  // 未显式配置时回退到内置命令顺序，保证功能开箱可用。
  const itemKeys =
    Array.isArray(configuredItems) && configuredItems.length > 0
      ? configuredItems
      : defaultSlashCommandItems
  const normalizedQuery = query.trim().toLowerCase()
  const maxItems = options.value.slashCommands?.maxItems || defaultSlashCommandItems.length

  return itemKeys
    .map((key) => commandItems[key])
    .filter(Boolean)
    .filter((item) => !disabledExtensions.includes(item.extension))
    .filter((item) => item.isVisible?.({ users: options.value.users || [] }) !== false)
    .filter((item) => matchesQuery(item, normalizedQuery))
    .slice(0, maxItems)
}
