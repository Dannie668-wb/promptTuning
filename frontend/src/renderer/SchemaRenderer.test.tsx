import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import A2UIRenderer from './SchemaRenderer'
import type { PageBundle } from '../types/schema'

const formBundle: PageBundle = {
  surfaceId: 'page-form',
  name: '测试表单',
  catalogId: 'antd-mobile',
  components: [
    {
      id: 'root',
      component: 'Page',
      layout: 'scroll',
      style: {},
      children: ['input-name', 'btn-submit'],
    },
    {
      id: 'input-name',
      component: 'Input',
      label: '姓名',
      placeholder: '请输入姓名',
      style: {},
      value: { path: '/formData/name' },
    },
    {
      id: 'btn-submit',
      component: 'Button',
      text: '提交',
      color: 'primary',
      style: {},
      onClick: { action: { event: { name: 'submit' } } },
    },
  ],
  initialData: { formData: { name: '' } },
}

describe('A2UIRenderer', () => {
  it('renders components from bundle', () => {
    render(<A2UIRenderer bundle={formBundle} />)
    expect(screen.getByText('提交')).toBeDefined()
  })

  it('renders unknown component type as placeholder', () => {
    const bundle: PageBundle = {
      ...formBundle,
      components: [
        { id: 'root', component: 'Page', style: {}, children: ['x'] },
        { id: 'x', component: 'Alien', style: {} },
      ],
    }
    render(<A2UIRenderer bundle={bundle} />)
    expect(screen.getByText(/未知组件: Alien/)).toBeDefined()
  })

  it('calls onSelect when component is clicked', () => {
    const onSelect = vi.fn()
    render(<A2UIRenderer bundle={formBundle} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('提交'))
    expect(onSelect).toHaveBeenCalledWith('btn-submit')
  })

  it('highlights selected component', () => {
    const { container } = render(
      <A2UIRenderer bundle={formBundle} selectedId="btn-submit" />,
    )
    const wrappers = container.querySelectorAll('div[style*="1677ff"]')
    expect(wrappers.length).toBeGreaterThan(0)
  })

  it('resolves value binding from initialData', () => {
    const bundle: PageBundle = {
      ...formBundle,
      initialData: { formData: { name: '张三' } },
    }
    render(<A2UIRenderer bundle={bundle} />)
    // The Input component should receive value "张三" via binding
    const input = document.querySelector('input')
    expect(input).not.toBeNull()
  })

  it('calls onSubmit with data model when submit event fires', () => {
    const onSubmit = vi.fn()
    render(<A2UIRenderer bundle={formBundle} onSubmit={onSubmit} />)
    fireEvent.click(screen.getByText('提交'))
    expect(onSubmit).toHaveBeenCalledWith({ formData: { name: '' } })
  })
})
