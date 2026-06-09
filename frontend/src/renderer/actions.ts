import type { A2UIAction } from '../types/schema'

// ── Data Model (JSON Pointer state) ──────────────────────────────────────────

export type DataModel = Record<string, unknown>

export type DataModelAction =
  | { type: 'setPath'; path: string; value: unknown }
  | { type: 'reset'; data: DataModel }

export function dataModelReducer(state: DataModel, action: DataModelAction): DataModel {
  switch (action.type) {
    case 'setPath':
      return setPath(state, action.path, action.value)
    case 'reset':
      return action.data
    default:
      return state
  }
}

// ── JSON Pointer (RFC 6901) helpers ───────────────────────────────────────────

function decodePart(part: string): string {
  return part.replace(/~1/g, '/').replace(/~0/g, '~')
}

export function resolvePath(data: DataModel, pointer: string): unknown {
  const parts = pointer.split('/').filter(Boolean).map(decodePart)
  let current: unknown = data
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

export function setPath(data: DataModel, pointer: string, value: unknown): DataModel {
  const parts = pointer.split('/').filter(Boolean).map(decodePart)
  if (parts.length === 0) {
    return typeof value === 'object' && value !== null ? { ...(value as DataModel) } : data
  }
  const result = { ...data }
  let current: Record<string, unknown> = result
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    const next = current[part]
    current[part] = next != null && typeof next === 'object' ? { ...(next as Record<string, unknown>) } : {}
    current = current[part] as Record<string, unknown>
  }
  current[parts[parts.length - 1]] = value
  return result
}

// ── A2UI Action Callbacks ─────────────────────────────────────────────────────

export interface A2UICallbacks {
  onSubmit?: (data: DataModel) => void
  onNavigate?: (to: string) => void
  onToast?: (message: string) => void
  onCheckIn?: () => void
  onReset?: () => void
}

export function createActionHandler(
  actionWrapper: A2UIAction,
  getDataModel: () => DataModel,
  dataDispatch: React.Dispatch<DataModelAction>,
  callbacks: A2UICallbacks,
): (...args: unknown[]) => void {
  const a = actionWrapper.action

  if ('event' in a) {
    const { name, context } = a.event
    return () => {
      switch (name) {
        case 'submit':
          callbacks.onSubmit?.(getDataModel())
          break
        case 'navigate':
          callbacks.onNavigate?.((context?.to as string) ?? '/')
          break
        case 'reset':
          dataDispatch({ type: 'reset', data: {} })
          callbacks.onReset?.()
          break
        case 'checkIn':
          callbacks.onCheckIn?.()
          break
      }
    }
  }

  if ('functionCall' in a) {
    const { call, args } = a.functionCall
    return () => {
      if (call === 'showToast') {
        callbacks.onToast?.((args?.message as string) ?? '')
      }
    }
  }

  return () => {}
}
