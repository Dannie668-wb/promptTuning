import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SchemaRenderer from './SchemaRenderer'
import type { PageSchema } from '../types/schema'

const formSchema: PageSchema = {
  id: 'page-form',
  name: '测试表单',
  type: 'page',
  layout: 'scroll',
  components: [
    {
      id: 'input-name',
      type: 'Input',
      props: { label: '姓名', placeholder: '请输入姓名' },
      style: {},
      events: { onChange: { action: 'setField', field: 'name' } },
    },
    {
      id: 'btn-submit',
      type: 'Button',
      props: { children: '提交', color: 'primary' },
      style: {},
      events: { onClick: { action: 'submit' } },
    },
  ],
}

describe('SchemaRenderer', () => {
  it('renders components from schema', () => {
    render(<SchemaRenderer schema={formSchema} />)
    expect(screen.getByText('提交')).toBeDefined()
  })

  it('renders unknown component type as placeholder', () => {
    const schema: PageSchema = {
      ...formSchema,
      components: [
        { id: 'x', type: 'Alien', props: {}, style: {}, events: {} },
      ],
    }
    render(<SchemaRenderer schema={schema} />)
    expect(screen.getByText(/未知组件: Alien/)).toBeDefined()
  })

  it('calls onSelect when component is clicked', () => {
    const onSelect = vi.fn()
    render(<SchemaRenderer schema={formSchema} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('提交'))
    expect(onSelect).toHaveBeenCalledWith('btn-submit')
  })

  it('highlights selected component', () => {
    const { container } = render(
      <SchemaRenderer schema={formSchema} selectedId="btn-submit" />,
    )
    const wrappers = container.querySelectorAll('div[style*="1677ff"]')
    expect(wrappers.length).toBeGreaterThan(0)
  })
})
