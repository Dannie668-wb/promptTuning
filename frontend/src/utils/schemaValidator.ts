import type { PageBundle, A2UIComponent, A2UIAction } from '../types/schema'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

const VALID_COMPONENT_TYPES = new Set([
  'Page',
  'Input', 'Select', 'DatePicker', 'Radio', 'Checkbox', 'Switch', 'Form', 'FormItem',
  'Card', 'List', 'Cell', 'Tag', 'Badge', 'Image', 'Divider',
  'Button', 'ActionSheet', 'NavBar', 'TabBar',
  'Calendar', 'CheckInCard', 'Progress',
])

const VALID_SERVER_EVENTS = new Set(['submit', 'navigate', 'reset', 'checkIn'])
const VALID_FUNCTION_CALLS = new Set(['showToast', 'openUrl'])

function validateAction(value: unknown, path: string): string[] {
  const errors: string[] = []
  if (typeof value !== 'object' || value === null || !('action' in value)) {
    errors.push(`${path}: event handler must be { action: { event | functionCall } }`)
    return errors
  }
  const { action } = value as A2UIAction
  if ('event' in action) {
    if (typeof action.event.name !== 'string') {
      errors.push(`${path}.action.event.name must be a string`)
    }
  } else if ('functionCall' in action) {
    if (typeof action.functionCall.call !== 'string') {
      errors.push(`${path}.action.functionCall.call must be a string`)
    }
  } else {
    errors.push(`${path}.action must have 'event' or 'functionCall'`)
  }
  return errors
}

function validateDynamicValue(value: unknown, path: string): string[] {
  if (typeof value === 'object' && value !== null && 'path' in value) {
    const p = (value as { path: unknown }).path
    if (typeof p !== 'string' || !p.startsWith('/')) {
      return [`${path}: binding path must be a string starting with '/' (JSON Pointer)`]
    }
  }
  return []
}

function validateComponent(node: unknown, path: string): string[] {
  const errors: string[] = []
  if (typeof node !== 'object' || node === null) {
    errors.push(`${path}: must be an object`)
    return errors
  }
  const c = node as Record<string, unknown>

  if (typeof c.id !== 'string' || !c.id) {
    errors.push(`${path}: id must be a non-empty string`)
  }
  if (typeof c.component !== 'string' || !c.component) {
    errors.push(`${path}: component must be a non-empty string`)
  } else if (!VALID_COMPONENT_TYPES.has(c.component)) {
    errors.push(`${path}: unknown component type '${c.component}'`)
  }

  // children must be array of strings (container components)
  if ('children' in c) {
    if (!Array.isArray(c.children) || c.children.some(ch => typeof ch !== 'string')) {
      errors.push(`${path}.children: must be an array of id strings`)
    }
  }

  // value binding
  if ('value' in c) {
    errors.push(...validateDynamicValue(c.value, `${path}.value`))
  }

  // event handlers (onXxx properties)
  for (const [key, val] of Object.entries(c)) {
    if (key.startsWith('on') && key.length > 2) {
      errors.push(...validateAction(val, `${path}.${key}`))
    }
  }

  return errors
}

export function validatePageBundle(raw: unknown): ValidationResult {
  const errors: string[] = []

  if (typeof raw !== 'object' || raw === null) {
    return { valid: false, errors: ['PageBundle must be an object'] }
  }
  const b = raw as Record<string, unknown>

  for (const field of ['surfaceId', 'name', 'catalogId']) {
    if (typeof b[field] !== 'string' || !b[field]) {
      errors.push(`Missing or invalid field: '${field}'`)
    }
  }

  if (!Array.isArray(b.components)) {
    errors.push("'components' must be an array")
    return { valid: false, errors }
  }

  for (let i = 0; i < b.components.length; i++) {
    errors.push(...validateComponent(b.components[i], `components[${i}]`))
  }

  // Must have a root Page component
  const comps = b.components as A2UIComponent[]
  const root = comps.find(c => c.id === 'root')
  if (!root) {
    errors.push("components must contain a component with id='root'")
  } else if (root.component !== 'Page') {
    errors.push(`root component must have component='Page', got '${root.component}'`)
  }

  // All children IDs must reference an existing component
  const ids = new Set(comps.map(c => c.id))
  for (const c of comps) {
    if (Array.isArray(c.children)) {
      for (const childId of c.children) {
        if (!ids.has(childId)) {
          errors.push(`Component '${c.id}' references unknown child id '${childId}'`)
        }
      }
    }
  }

  // initialData must be object if present
  if ('initialData' in b && (typeof b.initialData !== 'object' || b.initialData === null)) {
    errors.push("'initialData' must be an object")
  }

  return { valid: errors.length === 0, errors }
}

export function validatePageBundleJSON(json: string): ValidationResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return { valid: false, errors: ['Invalid JSON string'] }
  }
  return validatePageBundle(parsed)
}

export { VALID_COMPONENT_TYPES, VALID_SERVER_EVENTS, VALID_FUNCTION_CALLS }
