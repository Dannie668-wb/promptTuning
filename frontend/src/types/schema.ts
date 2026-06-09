// ── Dynamic value (literal or JSON Pointer binding) ──────────────────────────

export type DynamicValue<T> = T | { path: string }

// ── a2ui Actions ──────────────────────────────────────────────────────────────

export interface ServerAction {
  event: { name: string; context?: Record<string, unknown> }
}

export interface LocalAction {
  functionCall: { call: string; args?: Record<string, unknown> }
}

export interface A2UIAction {
  action: ServerAction | LocalAction
}

// Convenience type-guards
export function isServerAction(a: ServerAction | LocalAction): a is ServerAction {
  return 'event' in a
}

export function isLocalAction(a: ServerAction | LocalAction): a is LocalAction {
  return 'functionCall' in a
}

export function isDynamicBinding(v: unknown): v is { path: string } {
  return typeof v === 'object' && v !== null && 'path' in v && typeof (v as { path: unknown }).path === 'string'
}

// ── Component node (flat adjacency list entry) ───────────────────────────────

export interface A2UIComponent {
  id: string
  component: string
  /** Container components list child IDs; leaf components omit this field. */
  children?: string[]
  style?: Record<string, string | number>
  /** Two-way data binding — accepts literal or JSON Pointer path. */
  value?: DynamicValue<unknown>
  /** All other component-specific props and onXxx event handlers are flat here. */
  [prop: string]: unknown
}

// ── Page bundle (what the LLM generates; one surface worth of content) ────────

export interface PageBundle {
  surfaceId: string
  name: string
  catalogId: string
  /** Flat list; MUST contain exactly one component with id="root" and component="Page". */
  components: A2UIComponent[]
  /** Initial JSON data model for data binding. */
  initialData?: Record<string, unknown>
}

// ── a2ui Protocol messages (server → client) ──────────────────────────────────

export interface CreateSurface {
  createSurface: {
    surfaceId: string
    catalogId: string
    theme?: {
      primaryColor?: string
      agentDisplayName?: string
      iconUrl?: string
    }
  }
}

export interface UpdateComponents {
  updateComponents: {
    surfaceId: string
    components: A2UIComponent[]
  }
}

export interface UpdateDataModel {
  updateDataModel: {
    surfaceId: string
    path: string
    value?: unknown
  }
}

export interface DeleteSurface {
  deleteSurface: { surfaceId: string }
}

export type A2UIMessage = CreateSurface | UpdateComponents | UpdateDataModel | DeleteSurface

// ── Page layout ───────────────────────────────────────────────────────────────

export type PageLayout = 'scroll' | 'fixed'

// ── Well-known server event names ────────────────────────────────────────────

export type ServerEventName = 'submit' | 'navigate' | 'reset' | 'checkIn'

// ── Well-known local function call names ─────────────────────────────────────

export type LocalFunctionName = 'showToast' | 'openUrl'
