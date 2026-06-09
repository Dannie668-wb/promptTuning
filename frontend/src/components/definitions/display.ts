import { Card, List, Tag, Badge, Image, Divider } from 'antd-mobile'
import type { ComponentDefinition } from '../../types/component'

export const CardDefinition: ComponentDefinition = {
  type: 'Card',
  label: '卡片',
  category: 'display',
  isContainer: true,
  component: Card,
  defaultNode: {
    component: 'Card',
    title: '标题',
    style: { marginBottom: '12px' },
    children: [],
  },
  propsConfig: [
    { key: 'title', type: 'string', label: '标题', defaultValue: '标题' },
  ],
  styleConfig: [
    { key: 'marginBottom', type: 'string', label: '下边距', defaultValue: '12px' },
    { key: 'padding', type: 'string', label: '内边距', defaultValue: '12px' },
  ],
  eventsConfig: [
    { key: 'onClick', label: '点击时', kind: 'event', allowedEvents: ['navigate'] },
  ],
}

export const ListDefinition: ComponentDefinition = {
  type: 'List',
  label: '列表',
  category: 'display',
  isContainer: true,
  component: List,
  defaultNode: {
    component: 'List',
    header: '列表标题',
    style: {},
    children: [],
  },
  propsConfig: [
    { key: 'header', type: 'string', label: '列表头部', defaultValue: '列表标题' },
  ],
  styleConfig: [],
  eventsConfig: [],
}

export const CellDefinition: ComponentDefinition = {
  type: 'Cell',
  label: '单元格',
  category: 'display',
  isContainer: false,
  component: List.Item,
  defaultNode: {
    component: 'Cell',
    title: '标题',
    description: '描述文字',
    extra: '',
    style: {},
  },
  propsConfig: [
    { key: 'title', type: 'string', label: '主标题', defaultValue: '标题' },
    { key: 'description', type: 'string', label: '描述', defaultValue: '描述文字' },
    { key: 'extra', type: 'string', label: '右侧文字', defaultValue: '' },
  ],
  styleConfig: [],
  eventsConfig: [
    { key: 'onClick', label: '点击时', kind: 'event', allowedEvents: ['navigate'], allowedCalls: ['showToast'] },
  ],
}

export const TagDefinition: ComponentDefinition = {
  type: 'Tag',
  label: '标签',
  category: 'display',
  isContainer: false,
  component: Tag,
  defaultNode: {
    component: 'Tag',
    text: '标签文字',
    color: 'default',
    style: {},
  },
  propsConfig: [
    { key: 'text', type: 'string', label: '文字', defaultValue: '标签文字' },
    { key: 'color', type: 'select', label: '颜色', options: ['default', 'primary', 'success', 'warning', 'danger'], defaultValue: 'default' },
    { key: 'fill', type: 'select', label: '填充样式', options: ['solid', 'outline'], defaultValue: 'solid' },
    { key: 'round', type: 'boolean', label: '圆形', defaultValue: false },
  ],
  styleConfig: [],
  eventsConfig: [],
}

export const BadgeDefinition: ComponentDefinition = {
  type: 'Badge',
  label: '徽标',
  category: 'display',
  isContainer: false,
  component: Badge,
  defaultNode: {
    component: 'Badge',
    content: '1',
    style: {},
  },
  propsConfig: [
    { key: 'content', type: 'string', label: '内容', defaultValue: '1' },
  ],
  styleConfig: [],
  eventsConfig: [],
}

export const ImageDefinition: ComponentDefinition = {
  type: 'Image',
  label: '图片',
  category: 'display',
  isContainer: false,
  component: Image,
  defaultNode: {
    component: 'Image',
    src: '',
    alt: '',
    width: '100%',
    height: '160px',
    fit: 'cover',
    style: { marginBottom: '12px' },
  },
  propsConfig: [
    { key: 'src', type: 'string', label: '图片地址', defaultValue: '' },
    { key: 'alt', type: 'string', label: '替代文字', defaultValue: '' },
    { key: 'width', type: 'string', label: '宽度', defaultValue: '100%' },
    { key: 'height', type: 'string', label: '高度', defaultValue: '160px' },
    { key: 'fit', type: 'select', label: '填充方式', options: ['cover', 'contain', 'fill', 'none'], defaultValue: 'cover' },
  ],
  styleConfig: [
    { key: 'marginBottom', type: 'string', label: '下边距', defaultValue: '12px' },
  ],
  eventsConfig: [],
}

export const DividerDefinition: ComponentDefinition = {
  type: 'Divider',
  label: '分割线',
  category: 'display',
  isContainer: false,
  component: Divider,
  defaultNode: {
    component: 'Divider',
    content: '',
    style: { margin: '16px 0' },
  },
  propsConfig: [
    { key: 'content', type: 'string', label: '中间文字', defaultValue: '' },
  ],
  styleConfig: [
    { key: 'margin', type: 'string', label: '外边距', defaultValue: '16px 0' },
  ],
  eventsConfig: [],
}
