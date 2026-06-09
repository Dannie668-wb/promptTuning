import {
  Input,
  Selector,
  DatePicker,
  Radio,
  Checkbox,
  Switch,
  Form,
} from 'antd-mobile'
import type { ComponentDefinition } from '../../types/component'

export const InputDefinition: ComponentDefinition = {
  type: 'Input',
  label: '输入框',
  category: 'form',
  isContainer: false,
  supportsBinding: true,
  component: Input,
  defaultNode: {
    component: 'Input',
    label: '标签',
    placeholder: '请输入',
    required: false,
    style: { marginBottom: '12px' },
  },
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
  styleConfig: [
    { key: 'marginBottom', type: 'string', label: '下边距', defaultValue: '12px' },
  ],
  eventsConfig: [
    { key: 'onBlur', label: '失焦时', kind: 'functionCall', allowedCalls: ['showToast'] },
  ],
}

export const SelectDefinition: ComponentDefinition = {
  type: 'Select',
  label: '选择器',
  category: 'form',
  isContainer: false,
  supportsBinding: true,
  component: Selector,
  defaultNode: {
    component: 'Select',
    label: '选择',
    required: false,
    style: { marginBottom: '12px' },
  },
  propsConfig: [
    { key: 'label', type: 'string', label: '标签文本', defaultValue: '选择' },
    { key: 'required', type: 'boolean', label: '必填', defaultValue: false },
    { key: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
  ],
  styleConfig: [
    { key: 'marginBottom', type: 'string', label: '下边距', defaultValue: '12px' },
  ],
  eventsConfig: [],
}

export const DatePickerDefinition: ComponentDefinition = {
  type: 'DatePicker',
  label: '日期选择',
  category: 'form',
  isContainer: false,
  supportsBinding: true,
  component: DatePicker,
  defaultNode: {
    component: 'DatePicker',
    title: '选择日期',
    required: false,
    style: { marginBottom: '12px' },
  },
  propsConfig: [
    { key: 'title', type: 'string', label: '标题', defaultValue: '选择日期' },
    { key: 'required', type: 'boolean', label: '必填', defaultValue: false },
    { key: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
  ],
  styleConfig: [
    { key: 'marginBottom', type: 'string', label: '下边距', defaultValue: '12px' },
  ],
  eventsConfig: [],
}

export const RadioDefinition: ComponentDefinition = {
  type: 'Radio',
  label: '单选框',
  category: 'form',
  isContainer: false,
  supportsBinding: true,
  component: Radio,
  defaultNode: {
    component: 'Radio',
    value: 'option1',
    style: {},
  },
  propsConfig: [
    { key: 'value', type: 'string', label: '选项值', defaultValue: 'option1' },
    { key: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
  ],
  styleConfig: [],
  eventsConfig: [],
}

export const CheckboxDefinition: ComponentDefinition = {
  type: 'Checkbox',
  label: '复选框',
  category: 'form',
  isContainer: false,
  supportsBinding: true,
  component: Checkbox,
  defaultNode: {
    component: 'Checkbox',
    value: 'option1',
    style: {},
  },
  propsConfig: [
    { key: 'value', type: 'string', label: '选项值', defaultValue: 'option1' },
    { key: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
  ],
  styleConfig: [],
  eventsConfig: [],
}

export const SwitchDefinition: ComponentDefinition = {
  type: 'Switch',
  label: '开关',
  category: 'form',
  isContainer: false,
  supportsBinding: true,
  component: Switch,
  defaultNode: {
    component: 'Switch',
    defaultChecked: false,
    style: {},
  },
  propsConfig: [
    { key: 'defaultChecked', type: 'boolean', label: '默认开启', defaultValue: false },
    { key: 'disabled', type: 'boolean', label: '禁用', defaultValue: false },
    { key: 'loading', type: 'boolean', label: '加载中', defaultValue: false },
    { key: 'checkedText', type: 'string', label: '开启文字', defaultValue: '' },
    { key: 'uncheckedText', type: 'string', label: '关闭文字', defaultValue: '' },
  ],
  styleConfig: [],
  eventsConfig: [],
}

export const FormDefinition: ComponentDefinition = {
  type: 'Form',
  label: '表单',
  category: 'form',
  isContainer: true,
  component: Form,
  defaultNode: {
    component: 'Form',
    layout: 'horizontal',
    style: {},
    children: [],
  },
  propsConfig: [
    { key: 'layout', type: 'select', label: '布局', options: ['horizontal', 'vertical'], defaultValue: 'horizontal' },
  ],
  styleConfig: [],
  eventsConfig: [
    { key: 'onFinish', label: '提交时', kind: 'event', allowedEvents: ['submit', 'navigate'], allowedCalls: ['showToast'] },
  ],
}

export const FormItemDefinition: ComponentDefinition = {
  type: 'FormItem',
  label: '表单项',
  category: 'form',
  isContainer: true,
  component: Form.Item,
  defaultNode: {
    component: 'FormItem',
    label: '字段',
    name: 'field',
    required: false,
    style: {},
    children: [],
  },
  propsConfig: [
    { key: 'label', type: 'string', label: '字段标签', defaultValue: '字段' },
    { key: 'name', type: 'string', label: '字段名', defaultValue: 'field' },
    { key: 'required', type: 'boolean', label: '必填', defaultValue: false },
  ],
  styleConfig: [],
  eventsConfig: [],
}
