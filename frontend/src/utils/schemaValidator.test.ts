import { describe, it, expect } from 'vitest'
import { validatePageBundle, validatePageBundleJSON } from './schemaValidator'

const minimalBundle = {
  surfaceId: 'page-001',
  name: '测试页',
  catalogId: 'antd-mobile',
  components: [
    { id: 'root', component: 'Page', layout: 'scroll', style: {}, children: [] as string[] },
  ],
}

const fullBundle = {
  surfaceId: 'page-001',
  name: '测试页',
  catalogId: 'antd-mobile',
  components: [
    { id: 'root', component: 'Page', layout: 'scroll', style: {}, children: ['navbar-001', 'btn-001'] },
    {
      id: 'navbar-001',
      component: 'NavBar',
      title: '测试',
      style: {},
      onBack: { action: { event: { name: 'navigate', context: { to: '/home' } } } },
    },
    {
      id: 'btn-001',
      component: 'Button',
      text: '提交',
      color: 'primary',
      style: {},
      onClick: { action: { event: { name: 'submit' } } },
    },
  ],
  initialData: { formData: {} },
}

describe('validatePageBundle', () => {
  it('passes for a valid PageBundle', () => {
    const result = validatePageBundle(fullBundle)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails when surfaceId is missing', () => {
    const { surfaceId: _, ...rest } = fullBundle
    const result = validatePageBundle(rest)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('surfaceId'))).toBe(true)
  })

  it('fails when components array is missing', () => {
    const { components: _, ...rest } = fullBundle
    const result = validatePageBundle(rest)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('components'))).toBe(true)
  })

  it('fails when no root component exists', () => {
    const bundle = {
      ...minimalBundle,
      components: [
        { id: 'not-root', component: 'Page', style: {}, children: [] as string[] },
      ],
    }
    const result = validatePageBundle(bundle)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes("id='root'"))).toBe(true)
  })

  it('fails when root component is not Page', () => {
    const bundle = {
      ...minimalBundle,
      components: [
        { id: 'root', component: 'Form', style: {}, children: [] as string[] },
      ],
    }
    const result = validatePageBundle(bundle)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes("component='Page'"))).toBe(true)
  })

  it('fails when a component has an unknown type', () => {
    const bundle = {
      ...minimalBundle,
      components: [
        { id: 'root', component: 'Page', style: {}, children: ['alien-001'] },
        { id: 'alien-001', component: 'Alien', style: {} },
      ],
    }
    const result = validatePageBundle(bundle)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes("unknown component type 'Alien'"))).toBe(true)
  })

  it('fails when value binding path does not start with /', () => {
    const bundle = {
      ...minimalBundle,
      components: [
        { id: 'root', component: 'Page', style: {}, children: ['input-001'] },
        { id: 'input-001', component: 'Input', style: {}, value: { path: 'formData/name' } },
      ],
    }
    const result = validatePageBundle(bundle)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('JSON Pointer'))).toBe(true)
  })

  it('passes for valid value binding path', () => {
    const bundle = {
      ...minimalBundle,
      components: [
        { id: 'root', component: 'Page', style: {}, children: ['input-001'] },
        { id: 'input-001', component: 'Input', style: {}, value: { path: '/formData/name' } },
      ],
    }
    const result = validatePageBundle(bundle)
    expect(result.valid).toBe(true)
  })

  it('fails when event handler has wrong format', () => {
    const bundle = {
      ...minimalBundle,
      components: [
        { id: 'root', component: 'Page', style: {}, children: ['btn-001'] },
        { id: 'btn-001', component: 'Button', style: {}, onClick: { action: 'submit' } },
      ],
    }
    const result = validatePageBundle(bundle)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('onClick'))).toBe(true)
  })

  it('fails when children reference non-existent component id', () => {
    const bundle = {
      ...minimalBundle,
      components: [
        { id: 'root', component: 'Page', style: {}, children: ['ghost-id'] },
      ],
    }
    const result = validatePageBundle(bundle)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('ghost-id'))).toBe(true)
  })

  it('fails when initialData is not an object', () => {
    const bundle = { ...minimalBundle, initialData: 'bad' as unknown as Record<string, unknown> }
    const result = validatePageBundle(bundle)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('initialData'))).toBe(true)
  })

  it('passes valid server event action', () => {
    const bundle = {
      ...minimalBundle,
      components: [
        { id: 'root', component: 'Page', style: {}, children: ['btn-001'] },
        {
          id: 'btn-001',
          component: 'Button',
          style: {},
          onClick: { action: { event: { name: 'navigate', context: { to: '/home' } } } },
        },
      ],
    }
    const result = validatePageBundle(bundle)
    expect(result.valid).toBe(true)
  })

  it('passes valid functionCall action', () => {
    const bundle = {
      ...minimalBundle,
      components: [
        { id: 'root', component: 'Page', style: {}, children: ['btn-001'] },
        {
          id: 'btn-001',
          component: 'Button',
          style: {},
          onClick: { action: { functionCall: { call: 'showToast', args: { message: '成功' } } } },
        },
      ],
    }
    const result = validatePageBundle(bundle)
    expect(result.valid).toBe(true)
  })
})

describe('validatePageBundleJSON', () => {
  it('returns invalid for bad JSON string', () => {
    const result = validatePageBundleJSON('not json')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid JSON string')
  })

  it('validates parsed JSON against PageBundle rules', () => {
    const result = validatePageBundleJSON(JSON.stringify(minimalBundle))
    expect(result.valid).toBe(true)
  })

  it('validates full bundle as JSON', () => {
    const result = validatePageBundleJSON(JSON.stringify(fullBundle))
    expect(result.valid).toBe(true)
  })
})
