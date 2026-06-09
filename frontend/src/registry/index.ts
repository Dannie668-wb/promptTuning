import type { ComponentDefinition } from '../types/component'
import {
  InputDefinition, SelectDefinition, DatePickerDefinition,
  RadioDefinition, CheckboxDefinition, SwitchDefinition,
  FormDefinition, FormItemDefinition,
} from '../components/definitions/form'
import {
  CardDefinition, ListDefinition, CellDefinition,
  TagDefinition, BadgeDefinition, ImageDefinition, DividerDefinition,
} from '../components/definitions/display'
import {
  ButtonDefinition, ActionSheetDefinition, NavBarDefinition, TabBarDefinition,
} from '../components/definitions/action'
import {
  CalendarDefinition, CheckInCardDefinition, ProgressDefinition,
} from '../components/definitions/checkin.tsx'

// Page is handled inline by the renderer; this entry is for the editor palette only
const PageDefinition: ComponentDefinition = {
  type: 'Page',
  label: '页面',
  category: 'layout',
  isContainer: true,
  component: 'div' as unknown as React.ComponentType,
  defaultNode: {
    component: 'Page',
    layout: 'scroll',
    style: {},
    children: [],
  },
  propsConfig: [
    { key: 'layout', type: 'select', label: '布局', options: ['scroll', 'fixed'], defaultValue: 'scroll' },
  ],
  styleConfig: [
    { key: 'background', type: 'string', label: '背景色', defaultValue: '#f5f5f5' },
  ],
  eventsConfig: [],
}

export const REGISTRY: Record<string, ComponentDefinition> = {
  // Layout
  Page: PageDefinition,
  // Form
  Input: InputDefinition,
  Select: SelectDefinition,
  DatePicker: DatePickerDefinition,
  Radio: RadioDefinition,
  Checkbox: CheckboxDefinition,
  Switch: SwitchDefinition,
  Form: FormDefinition,
  FormItem: FormItemDefinition,
  // Display
  Card: CardDefinition,
  List: ListDefinition,
  Cell: CellDefinition,
  Tag: TagDefinition,
  Badge: BadgeDefinition,
  Image: ImageDefinition,
  Divider: DividerDefinition,
  // Action
  Button: ButtonDefinition,
  ActionSheet: ActionSheetDefinition,
  NavBar: NavBarDefinition,
  TabBar: TabBarDefinition,
  // Check-in
  Calendar: CalendarDefinition,
  CheckInCard: CheckInCardDefinition,
  Progress: ProgressDefinition,
}

export function getDefinition(type: string): ComponentDefinition | undefined {
  return REGISTRY[type]
}

export function getRegisteredTypes(): Set<string> {
  return new Set(Object.keys(REGISTRY))
}

export function generateComponentCatalog(): string {
  const lines: string[] = ['可用组件列表：']
  for (const def of Object.values(REGISTRY)) {
    const props = def.propsConfig.map(p => p.key).join(', ')
    const events = def.eventsConfig.map(e => {
      const parts: string[] = []
      if (e.allowedEvents?.length) parts.push(`event:${e.allowedEvents.join('/')}`)
      if (e.allowedCalls?.length) parts.push(`call:${e.allowedCalls.join('/')}`)
      return `${e.key}→${parts.join('|')}`
    }).join(', ')
    const eventStr = events ? `  events(${events})` : ''
    lines.push(`- ${def.type}(${def.label}): props(${props || '无'})${eventStr}`)
  }
  return lines.join('\n')
}
