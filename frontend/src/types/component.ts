import type { ComponentType } from 'react'
import type { A2UIComponent } from './schema'

export type PropConfigType = 'string' | 'number' | 'boolean' | 'select'

export interface PropConfigItem {
  key: string
  type: PropConfigType
  label: string
  options?: string[]
  defaultValue?: unknown
}

export interface EventConfigItem {
  key: string
  label: string
  /** 'event' → server event dispatch; 'functionCall' → local function call */
  kind: 'event' | 'functionCall'
  /** Allowed event names when kind='event' (e.g. 'submit', 'navigate') */
  allowedEvents?: string[]
  /** Allowed function call names when kind='functionCall' (e.g. 'showToast') */
  allowedCalls?: string[]
}

export interface ComponentDefinition {
  /** Component type name matching A2UIComponent.component */
  type: string
  label: string
  category: 'layout' | 'form' | 'display' | 'action' | 'checkin'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>
  /** Default node shape when dragged onto canvas (omits id) */
  defaultNode: Omit<A2UIComponent, 'id'>
  /** Whether this is a container (has children) */
  isContainer: boolean
  propsConfig: PropConfigItem[]
  styleConfig: PropConfigItem[]
  eventsConfig: EventConfigItem[]
  /** True if component supports value binding via { path } */
  supportsBinding?: boolean
}
