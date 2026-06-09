import { describe, it, expect } from 'vitest'
import { validatePageSchema, validateSchemaJSON } from './schemaValidator'

const TYPES = new Set(['Input', 'Button', 'Form', 'NavBar'])

const validSchema = {
  id: 'page-001',
  name: '测试页',
  type: 'page' as const,
  layout: 'scroll' as const,
  components: [
    {
      id: 'comp-001',
      type: 'NavBar',
      props: { title: '测试' },
      style: {},
      events: {},
    },
    {
      id: 'comp-002',
      type: 'Button',
      props: { text: '提交' },
      style: {},
      events: { onClick: { action: 'submit' as const } },
    },
  ],
}

describe('validatePageSchema', () => {
  it('passes for a valid schema', () => {
    const result = validatePageSchema(validSchema, TYPES)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails when type is not "page"', () => {
    const result = validatePageSchema({ ...validSchema, type: 'form' }, TYPES)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('type: must be "page"')
  })

  it('fails when components is missing', () => {
    const { components: _, ...rest } = validSchema
    const result = validatePageSchema(rest, TYPES)
    expect(result.valid).toBe(false)
  })

  it('fails when component type is not in registry', () => {
    const schema = {
      ...validSchema,
      components: [{ ...validSchema.components[0], type: 'UnknownWidget' }],
    }
    const result = validatePageSchema(schema, TYPES)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toMatch(/not a registered component/)
  })

  it('fails for unknown action type', () => {
    const schema = {
      ...validSchema,
      components: [
        {
          ...validSchema.components[1],
          events: { onClick: { action: 'flyAway' } },
        },
      ],
    }
    const result = validatePageSchema(schema, TYPES)
    expect(result.valid).toBe(false)
  })

  it('skips type check when allowedTypes is empty', () => {
    const result = validatePageSchema(validSchema, new Set())
    expect(result.valid).toBe(true)
  })
})

describe('validateSchemaJSON', () => {
  it('returns invalid for bad JSON', () => {
    const result = validateSchemaJSON('not json')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('invalid JSON')
  })

  it('validates parsed JSON against schema rules', () => {
    const result = validateSchemaJSON(JSON.stringify(validSchema), TYPES)
    expect(result.valid).toBe(true)
  })
})
