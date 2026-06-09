import { Calendar, ProgressBar } from 'antd-mobile'
import { forwardRef } from 'react'
import type { ComponentDefinition } from '../../types/component'

const CheckInCard = forwardRef<HTMLDivElement, { status?: string; date?: string; children?: React.ReactNode }>(
  ({ status = '未打卡', date = '', children }, ref) => (
    <div ref={ref} style={{ padding: '16px', background: '#fff', borderRadius: '8px', marginBottom: '12px' }}>
      <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{date}</div>
      <div style={{ color: status === '已打卡' ? '#52c41a' : '#ff4d4f' }}>{status}</div>
      {children}
    </div>
  )
)
CheckInCard.displayName = 'CheckInCard'

export const CalendarDefinition: ComponentDefinition = {
  type: 'Calendar',
  label: '日历',
  category: 'checkin',
  isContainer: false,
  supportsBinding: true,
  component: Calendar,
  defaultNode: {
    component: 'Calendar',
    selectionMode: 'single',
    style: { marginBottom: '12px' },
  },
  propsConfig: [
    { key: 'selectionMode', type: 'select', label: '选择模式', options: ['single', 'range'], defaultValue: 'single' },
  ],
  styleConfig: [
    { key: 'marginBottom', type: 'string', label: '下边距', defaultValue: '12px' },
  ],
  eventsConfig: [],
}

export const CheckInCardDefinition: ComponentDefinition = {
  type: 'CheckInCard',
  label: '打卡卡片',
  category: 'checkin',
  isContainer: false,
  supportsBinding: true,
  component: CheckInCard,
  defaultNode: {
    component: 'CheckInCard',
    status: '未打卡',
    date: '今日',
    style: { marginBottom: '12px' },
  },
  propsConfig: [
    { key: 'status', type: 'select', label: '打卡状态', options: ['已打卡', '未打卡'], defaultValue: '未打卡' },
    { key: 'date', type: 'string', label: '日期文字', defaultValue: '今日' },
  ],
  styleConfig: [
    { key: 'marginBottom', type: 'string', label: '下边距', defaultValue: '12px' },
  ],
  eventsConfig: [
    { key: 'onClick', label: '点击打卡时', kind: 'event', allowedEvents: ['checkIn'], allowedCalls: ['showToast'] },
  ],
}

export const ProgressDefinition: ComponentDefinition = {
  type: 'Progress',
  label: '进度条',
  category: 'checkin',
  isContainer: false,
  supportsBinding: true,
  component: ProgressBar,
  defaultNode: {
    component: 'Progress',
    percent: 0,
    text: true,
    style: { marginBottom: '12px' },
  },
  propsConfig: [
    { key: 'percent', type: 'number', label: '进度百分比', defaultValue: 0 },
    { key: 'text', type: 'boolean', label: '显示文字', defaultValue: true },
    { key: 'rounded', type: 'boolean', label: '圆角', defaultValue: true },
  ],
  styleConfig: [
    { key: 'marginBottom', type: 'string', label: '下边距', defaultValue: '12px' },
  ],
  eventsConfig: [],
}
