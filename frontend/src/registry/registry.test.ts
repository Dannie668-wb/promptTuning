import { describe, it, expect } from 'vitest'
import { REGISTRY, getDefinition, getRegisteredTypes, generateComponentCatalog } from './index'

describe('REGISTRY', () => {
  it('contains all expected component types', () => {
    const expected = [
      'Page',
      'Input', 'Select', 'DatePicker', 'Radio', 'Checkbox', 'Switch', 'Form', 'FormItem',
      'Card', 'List', 'Cell', 'Tag', 'Badge', 'Image', 'Divider',
      'Button', 'ActionSheet', 'NavBar', 'TabBar',
      'Calendar', 'CheckInCard', 'Progress',
    ]
    for (const type of expected) {
      expect(REGISTRY[type], `${type} should be registered`).toBeDefined()
    }
  })

  it('each definition has required fields', () => {
    for (const [type, def] of Object.entries(REGISTRY)) {
      expect(def.type, `${type}.type`).toBe(type)
      expect(def.component, `${type}.component`).toBeDefined()
      expect(def.defaultNode, `${type}.defaultNode`).toBeDefined()
      expect(def.defaultNode.component, `${type}.defaultNode.component`).toBe(type)
      expect(Array.isArray(def.propsConfig), `${type}.propsConfig`).toBe(true)
      expect(Array.isArray(def.styleConfig), `${type}.styleConfig`).toBe(true)
      expect(Array.isArray(def.eventsConfig), `${type}.eventsConfig`).toBe(true)
    }
  })

  it('container definitions have children array in defaultNode', () => {
    const containers = Object.values(REGISTRY).filter(d => d.isContainer)
    for (const def of containers) {
      expect(Array.isArray(def.defaultNode.children), `${def.type} should have children array`).toBe(true)
    }
  })

  it('eventsConfig uses new kind/allowedEvents/allowedCalls format', () => {
    for (const [type, def] of Object.entries(REGISTRY)) {
      for (const evt of def.eventsConfig) {
        expect(evt.kind, `${type}.${evt.key}.kind`).toMatch(/^(event|functionCall)$/)
        expect('allowedActions' in evt, `${type}.${evt.key} should not have allowedActions`).toBe(false)
      }
    }
  })
})

describe('getDefinition', () => {
  it('returns definition for known type', () => {
    const def = getDefinition('Button')
    expect(def).toBeDefined()
    expect(def!.label).toBe('按钮')
  })

  it('returns undefined for unknown type', () => {
    expect(getDefinition('UnknownWidget')).toBeUndefined()
  })
})

describe('getRegisteredTypes', () => {
  it('returns a Set of all registered types', () => {
    const types = getRegisteredTypes()
    expect(types.has('Input')).toBe(true)
    expect(types.has('Button')).toBe(true)
    expect(types.has('Page')).toBe(true)
    expect(types.size).toBeGreaterThanOrEqual(23)
  })
})

describe('generateComponentCatalog', () => {
  it('starts with catalog header', () => {
    const catalog = generateComponentCatalog()
    expect(catalog).toMatch(/^可用组件列表/)
  })

  it('includes all registered types', () => {
    const catalog = generateComponentCatalog()
    for (const type of Object.keys(REGISTRY)) {
      expect(catalog).toContain(type)
    }
  })

  it('includes props and events info', () => {
    const catalog = generateComponentCatalog()
    expect(catalog).toContain('props(')
    expect(catalog).toContain('events(')
  })
})
