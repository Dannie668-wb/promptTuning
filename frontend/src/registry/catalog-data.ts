/**
 * Component metadata — no React/antd-mobile imports.
 * Safe to import in Node.js scripts (e.g. build:catalog).
 */
import type { PropConfigItem, EventConfigItem } from '../types/component'

export interface ComponentMeta {
  type: string
  label: string
  category: 'layout' | 'form' | 'display' | 'action' | 'checkin'
  isContainer: boolean
  supportsBinding?: boolean
  propsConfig: PropConfigItem[]
  styleConfig: PropConfigItem[]
  eventsConfig: EventConfigItem[]
}

export const COMPONENT_META: ComponentMeta[] = [
  // ── Layout ────────────────────────────────────────────────────────────────
  {
    type: 'Page', label: '页面', category: 'layout', isContainer: true,
    propsConfig: [
      { key: 'layout', type: 'select', label: '布局', options: ['scroll', 'fixed'], defaultValue: 'scroll' },
    ],
    styleConfig: [{ key: 'background', type: 'string', label: '背景色', defaultValue: '#f5f5f5' }],
    eventsConfig: [],
  },

  // ── Form ──────────────────────────────────────────────────────────────────
  {
    type: 'Input', label: '输入框', category: 'form', isContainer: false, supportsBinding: true,
    propsConfig: [
      { key: 'label', type: 'string', label: '标签文本', defaultValue: '标签' },
      { key: 'placeholder', type: 'string', label: '占位符', defaultValue: '请输入' },
      { key: 'type', type: 'select', label: '输入类型', options: ['text', 'number', 'tel', 'password', 'digit'], defaultValue: 'text' },
      { key: 'required', type: 'boolean', label: '必填', defaultValue: false },
      { key: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
      { key: 'readOnly', type: 'boolean', label: '只读', defaultValue: false },
      { key: 'clearable', type: 'boolean', label: '可清除', defaultValue: false },
      { key: 'maxLength', type: 'number', label: '最大长度', defaultValue: 0 },
    ],
    styleConfig: [{ key: 'marginBottom', type: 'string', label: '下边距', defaultValue: '12px' }],
    eventsConfig: [
      { key: 'onBlur', label: '失焦时', kind: 'functionCall', allowedCalls: ['showToast'] },
    ],
  },
  {
    type: 'Select', label: '选择器', category: 'form', isContainer: false, supportsBinding: true,
    propsConfig: [
      { key: 'label', type: 'string', label: '标签文本', defaultValue: '选择' },
      { key: 'required', type: 'boolean', label: '必填', defaultValue: false },
      { key: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
    ],
    styleConfig: [{ key: 'marginBottom', type: 'string', label: '下边距', defaultValue: '12px' }],
    eventsConfig: [],
  },
  {
    type: 'DatePicker', label: '日期选择', category: 'form', isContainer: false, supportsBinding: true,
    propsConfig: [
      { key: 'title', type: 'string', label: '标题', defaultValue: '选择日期' },
      { key: 'required', type: 'boolean', label: '必填', defaultValue: false },
      { key: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
    ],
    styleConfig: [{ key: 'marginBottom', type: 'string', label: '下边距', defaultValue: '12px' }],
    eventsConfig: [],
  },
  {
    type: 'Radio', label: '单选框', category: 'form', isContainer: false, supportsBinding: true,
    propsConfig: [
      { key: 'value', type: 'string', label: '选项值', defaultValue: 'option1' },
      { key: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
    ],
    styleConfig: [],
    eventsConfig: [],
  },
  {
    type: 'Checkbox', label: '复选框', category: 'form', isContainer: false, supportsBinding: true,
    propsConfig: [
      { key: 'value', type: 'string', label: '选项值', defaultValue: 'option1' },
      { key: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
    ],
    styleConfig: [],
    eventsConfig: [],
  },
  {
    type: 'Switch', label: '开关', category: 'form', isContainer: false, supportsBinding: true,
    propsConfig: [
      { key: 'defaultChecked', type: 'boolean', label: '默认开启', defaultValue: false },
      { key: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
      { key: 'loading', type: 'boolean', label: '加载中', defaultValue: false },
      { key: 'checkedText', type: 'string', label: '开启文字', defaultValue: '' },
      { key: 'uncheckedText', type: 'string', label: '关闭文字', defaultValue: '' },
    ],
    styleConfig: [],
    eventsConfig: [],
  },
  {
    type: 'Form', label: '表单', category: 'form', isContainer: true,
    propsConfig: [{ key: 'layout', type: 'select', label: '布局', options: ['horizontal', 'vertical'], defaultValue: 'horizontal' }],
    styleConfig: [],
    eventsConfig: [
      { key: 'onFinish', label: '提交时', kind: 'event', allowedEvents: ['submit', 'navigate'], allowedCalls: ['showToast'] },
    ],
  },
  {
    type: 'FormItem', label: '表单项', category: 'form', isContainer: true,
    propsConfig: [
      { key: 'label', type: 'string', label: '字段标签', defaultValue: '字段' },
      { key: 'name', type: 'string', label: '字段名', defaultValue: 'field' },
      { key: 'required', type: 'boolean', label: '必填', defaultValue: false },
    ],
    styleConfig: [],
    eventsConfig: [],
  },

  // ── Display ───────────────────────────────────────────────────────────────
  {
    type: 'Card', label: '卡片', category: 'display', isContainer: true,
    propsConfig: [{ key: 'title', type: 'string', label: '标题', defaultValue: '标题' }],
    styleConfig: [
      { key: 'marginBottom', type: 'string', label: '下边距', defaultValue: '12px' },
      { key: 'padding', type: 'string', label: '内边距', defaultValue: '12px' },
    ],
    eventsConfig: [{ key: 'onClick', label: '点击时', kind: 'event', allowedEvents: ['navigate'] }],
  },
  {
    type: 'List', label: '列表', category: 'display', isContainer: true,
    propsConfig: [{ key: 'header', type: 'string', label: '列表头部', defaultValue: '列表标题' }],
    styleConfig: [],
    eventsConfig: [],
  },
  {
    type: 'Cell', label: '单元格', category: 'display', isContainer: false,
    propsConfig: [
      { key: 'title', type: 'string', label: '主标题', defaultValue: '标题' },
      { key: 'description', type: 'string', label: '描述', defaultValue: '描述文字' },
      { key: 'extra', type: 'string', label: '右侧文字', defaultValue: '' },
    ],
    styleConfig: [],
    eventsConfig: [
      { key: 'onClick', label: '点击时', kind: 'event', allowedEvents: ['navigate'], allowedCalls: ['showToast'] },
    ],
  },
  {
    type: 'Tag', label: '标签', category: 'display', isContainer: false,
    propsConfig: [
      { key: 'text', type: 'string', label: '文字', defaultValue: '标签文字' },
      { key: 'color', type: 'select', label: '颜色', options: ['default', 'primary', 'success', 'warning', 'danger'], defaultValue: 'default' },
      { key: 'fill', type: 'select', label: '填充样式', options: ['solid', 'outline'], defaultValue: 'solid' },
      { key: 'round', type: 'boolean', label: '圆形', defaultValue: false },
    ],
    styleConfig: [],
    eventsConfig: [],
  },
  {
    type: 'Badge', label: '徽标', category: 'display', isContainer: false,
    propsConfig: [{ key: 'content', type: 'string', label: '内容', defaultValue: '1' }],
    styleConfig: [],
    eventsConfig: [],
  },
  {
    type: 'Image', label: '图片', category: 'display', isContainer: false,
    propsConfig: [
      { key: 'src', type: 'string', label: '图片地址', defaultValue: '' },
      { key: 'alt', type: 'string', label: '替代文字', defaultValue: '' },
      { key: 'width', type: 'string', label: '宽度', defaultValue: '100%' },
      { key: 'height', type: 'string', label: '高度', defaultValue: '160px' },
      { key: 'fit', type: 'select', label: '填充方式', options: ['cover', 'contain', 'fill', 'none'], defaultValue: 'cover' },
    ],
    styleConfig: [{ key: 'marginBottom', type: 'string', label: '下边距', defaultValue: '12px' }],
    eventsConfig: [],
  },
  {
    type: 'Divider', label: '分割线', category: 'display', isContainer: false,
    propsConfig: [{ key: 'content', type: 'string', label: '中间文字', defaultValue: '' }],
    styleConfig: [{ key: 'margin', type: 'string', label: '外边距', defaultValue: '16px 0' }],
    eventsConfig: [],
  },

  // ── Action ────────────────────────────────────────────────────────────────
  {
    type: 'Button', label: '按钮', category: 'action', isContainer: false,
    propsConfig: [
      { key: 'text', type: 'string', label: '按钮文字', defaultValue: '按钮' },
      { key: 'color', type: 'select', label: '颜色', options: ['default', 'primary', 'success', 'warning', 'danger'], defaultValue: 'primary' },
      { key: 'fill', type: 'select', label: '填充样式', options: ['solid', 'outline', 'none'], defaultValue: 'solid' },
      { key: 'size', type: 'select', label: '大小', options: ['mini', 'small', 'middle', 'large'], defaultValue: 'middle' },
      { key: 'shape', type: 'select', label: '形状', options: ['default', 'rounded', 'rectangular'], defaultValue: 'default' },
      { key: 'block', type: 'boolean', label: '块级按钮', defaultValue: false },
      { key: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
      { key: 'loading', type: 'boolean', label: '加载中', defaultValue: false },
    ],
    styleConfig: [{ key: 'marginTop', type: 'string', label: '上边距', defaultValue: '16px' }],
    eventsConfig: [
      { key: 'onClick', label: '点击时', kind: 'event', allowedEvents: ['submit', 'navigate', 'reset', 'checkIn'], allowedCalls: ['showToast'] },
    ],
  },
  {
    type: 'ActionSheet', label: '动作面板', category: 'action', isContainer: false,
    propsConfig: [{ key: 'visible', type: 'boolean', label: '可见', defaultValue: false }],
    styleConfig: [],
    eventsConfig: [
      { key: 'onClose', label: '关闭时', kind: 'event', allowedEvents: ['reset'] },
    ],
  },
  {
    type: 'NavBar', label: '导航栏', category: 'action', isContainer: false,
    propsConfig: [
      { key: 'title', type: 'string', label: '标题文字', defaultValue: '页面标题' },
      { key: 'back', type: 'string', label: '返回文字', defaultValue: '返回' },
      { key: 'backArrow', type: 'boolean', label: '显示返回箭头', defaultValue: true },
    ],
    styleConfig: [],
    eventsConfig: [{ key: 'onBack', label: '点击返回时', kind: 'event', allowedEvents: ['navigate'] }],
  },
  {
    type: 'TabBar', label: '标签栏', category: 'action', isContainer: false,
    propsConfig: [{ key: 'activeKey', type: 'string', label: '当前激活项', defaultValue: 'home' }],
    styleConfig: [],
    eventsConfig: [{ key: 'onChange', label: '切换时', kind: 'event', allowedEvents: ['navigate'] }],
  },

  // ── Check-in ──────────────────────────────────────────────────────────────
  {
    type: 'Calendar', label: '日历', category: 'checkin', isContainer: false, supportsBinding: true,
    propsConfig: [{ key: 'selectionMode', type: 'select', label: '选择模式', options: ['single', 'range'], defaultValue: 'single' }],
    styleConfig: [{ key: 'marginBottom', type: 'string', label: '下边距', defaultValue: '12px' }],
    eventsConfig: [],
  },
  {
    type: 'CheckInCard', label: '打卡卡片', category: 'checkin', isContainer: false, supportsBinding: true,
    propsConfig: [
      { key: 'status', type: 'select', label: '打卡状态', options: ['已打卡', '未打卡'], defaultValue: '未打卡' },
      { key: 'date', type: 'string', label: '日期文字', defaultValue: '今日' },
    ],
    styleConfig: [{ key: 'marginBottom', type: 'string', label: '下边距', defaultValue: '12px' }],
    eventsConfig: [
      { key: 'onClick', label: '点击打卡时', kind: 'event', allowedEvents: ['checkIn'], allowedCalls: ['showToast'] },
    ],
  },
  {
    type: 'Progress', label: '进度条', category: 'checkin', isContainer: false, supportsBinding: true,
    propsConfig: [
      { key: 'percent', type: 'number', label: '进度百分比', defaultValue: 0 },
      { key: 'text', type: 'boolean', label: '显示文字', defaultValue: true },
      { key: 'rounded', type: 'boolean', label: '圆角', defaultValue: true },
    ],
    styleConfig: [{ key: 'marginBottom', type: 'string', label: '下边距', defaultValue: '12px' }],
    eventsConfig: [],
  },
]

// ── Derived helpers (no React deps) ──────────────────────────────────────────

export function getMetaRegisteredTypes(): Set<string> {
  return new Set(COMPONENT_META.map(m => m.type))
}

export function generateMetaCatalog(): string {
  const categoryLabels: Record<string, string> = {
    layout: '布局类', form: '表单类', display: '展示类', action: '操作类', checkin: '打卡专用',
  }
  const lines: string[] = [
    '可用组件列表（component 字段必须为以下之一，不得使用其他组件名称）：',
    '',
    '说明：[容器] 表示 children 是子组件 id 数组；[绑定] 表示支持 value: {"path":"/..."} 双向绑定',
  ]

  for (const [cat, label] of Object.entries(categoryLabels)) {
    const items = COMPONENT_META.filter(m => m.category === cat)
    if (!items.length) continue
    lines.push(`\n${label}:`)
    for (const m of items) {
      const props = m.propsConfig.map(p => {
        const opts = p.options ? `(${p.options.join('|')})` : ''
        return `${p.key}${opts}`
      }).join(', ')
      const flags: string[] = []
      if (m.isContainer) flags.push('容器')
      if (m.supportsBinding) flags.push('绑定')
      const flagStr = flags.length ? ` [${flags.join(', ')}]` : ''
      const eventStr = m.eventsConfig.length
        ? `  events(${m.eventsConfig.map(e => {
            const parts: string[] = []
            if (e.allowedEvents?.length) parts.push(`event:${e.allowedEvents.join('/')}`)
            if (e.allowedCalls?.length) parts.push(`call:${e.allowedCalls.join('/')}`)
            return `${e.key}→${parts.join('|')}`
          }).join(', ')})`
        : ''
      lines.push(`- ${m.type}(${m.label})${flagStr}: props(${props || '无'})${eventStr}`)
    }
  }
  return lines.join('\n')
}
