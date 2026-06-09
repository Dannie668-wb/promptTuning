import { Button, ActionSheet, NavBar, TabBar } from 'antd-mobile'
import type { ComponentDefinition } from '../../types/component'

export const ButtonDefinition: ComponentDefinition = {
  type: 'Button',
  label: '按钮',
  category: 'action',
  isContainer: false,
  component: Button,
  defaultNode: {
    component: 'Button',
    text: '按钮',
    color: 'primary',
    block: false,
    size: 'middle',
    style: { marginTop: '16px' },
  },
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
  styleConfig: [
    { key: 'marginTop', type: 'string', label: '上边距', defaultValue: '16px' },
  ],
  eventsConfig: [
    { key: 'onClick', label: '点击时', kind: 'event', allowedEvents: ['submit', 'navigate', 'reset', 'checkIn'], allowedCalls: ['showToast'] },
  ],
}

export const ActionSheetDefinition: ComponentDefinition = {
  type: 'ActionSheet',
  label: '动作面板',
  category: 'action',
  isContainer: false,
  component: ActionSheet,
  defaultNode: {
    component: 'ActionSheet',
    visible: false,
    style: {},
  },
  propsConfig: [
    { key: 'visible', type: 'boolean', label: '可见', defaultValue: false },
  ],
  styleConfig: [],
  eventsConfig: [
    { key: 'onClose', label: '关闭时', kind: 'event', allowedEvents: ['reset'] },
  ],
}

export const NavBarDefinition: ComponentDefinition = {
  type: 'NavBar',
  label: '导航栏',
  category: 'action',
  isContainer: false,
  component: NavBar,
  defaultNode: {
    component: 'NavBar',
    title: '页面标题',
    back: '返回',
    style: {},
  },
  propsConfig: [
    { key: 'title', type: 'string', label: '标题文字', defaultValue: '页面标题' },
    { key: 'back', type: 'string', label: '返回文字', defaultValue: '返回' },
    { key: 'backArrow', type: 'boolean', label: '显示返回箭头', defaultValue: true },
  ],
  styleConfig: [],
  eventsConfig: [
    { key: 'onBack', label: '点击返回时', kind: 'event', allowedEvents: ['navigate'] },
  ],
}

export const TabBarDefinition: ComponentDefinition = {
  type: 'TabBar',
  label: '标签栏',
  category: 'action',
  isContainer: false,
  component: TabBar,
  defaultNode: {
    component: 'TabBar',
    activeKey: 'home',
    style: {},
  },
  propsConfig: [
    { key: 'activeKey', type: 'string', label: '当前激活项', defaultValue: 'home' },
  ],
  styleConfig: [],
  eventsConfig: [
    { key: 'onChange', label: '切换时', kind: 'event', allowedEvents: ['navigate'] },
  ],
}
