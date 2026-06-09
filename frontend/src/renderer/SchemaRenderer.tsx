import { useReducer, useMemo, useRef, createElement } from 'react'
import type { PageBundle, A2UIComponent } from '../types/schema'
import { isDynamicBinding } from '../types/schema'
import { getDefinition } from '../registry'
import {
  dataModelReducer,
  resolvePath,
  createActionHandler,
  type DataModel,
  type DataModelAction,
  type A2UICallbacks,
} from './actions'

// ── Prop normalization: map a2ui props → antd-mobile component props ──────────

const PROP_NORMALIZERS: Record<string, (p: Record<string, unknown>) => Record<string, unknown>> = {
  Button: (p) => ({ ...p, children: p.text ?? p.children }),
  NavBar: (p) => ({ ...p, children: p.title ?? p.children }),
  Tag: (p) => ({ ...p, children: p.text ?? p.children }),
  Divider: (p) => ({ ...p, children: p.content ?? p.children }),
}

function normalizeProps(componentType: string, props: Record<string, unknown>): Record<string, unknown> {
  return PROP_NORMALIZERS[componentType]?.(props) ?? props
}

// ── Per-node prop resolver ────────────────────────────────────────────────────

function resolveNodeProps(
  node: A2UIComponent,
  dataModel: DataModel,
  dataDispatch: React.Dispatch<DataModelAction>,
  getDataModel: () => DataModel,
  callbacks: A2UICallbacks,
): Record<string, unknown> {
  const props: Record<string, unknown> = {}

  for (const [key, val] of Object.entries(node)) {
    if (key === 'id' || key === 'component' || key === 'children' || key === 'style') continue

    if (key === 'value') {
      if (isDynamicBinding(val)) {
        const path = (val as { path: string }).path
        props.value = resolvePath(dataModel, path)
        props.onChange = (v: unknown) => dataDispatch({ type: 'setPath', path, value: v })
      } else {
        props.value = val
      }
      continue
    }

    if (key.startsWith('on') && key.length > 2 && typeof val === 'object' && val !== null && 'action' in val) {
      props[key] = createActionHandler(
        val as import('../types/schema').A2UIAction,
        getDataModel,
        dataDispatch,
        callbacks,
      )
      continue
    }

    props[key] = val
  }

  return normalizeProps(node.component, props)
}

// ── Recursive node renderer ───────────────────────────────────────────────────

interface RenderNodeProps {
  nodeId: string
  componentMap: Map<string, A2UIComponent>
  dataModel: DataModel
  dataDispatch: React.Dispatch<DataModelAction>
  getDataModel: () => DataModel
  callbacks: A2UICallbacks
  selectedId?: string
  onSelect?: (id: string) => void
}

function RenderNode({
  nodeId, componentMap, dataModel, dataDispatch, getDataModel, callbacks, selectedId, onSelect,
}: RenderNodeProps) {
  const node = componentMap.get(nodeId)
  if (!node) return null

  const childElements = node.children?.map(childId => (
    <RenderNode
      key={childId}
      nodeId={childId}
      componentMap={componentMap}
      dataModel={dataModel}
      dataDispatch={dataDispatch}
      getDataModel={getDataModel}
      callbacks={callbacks}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  ))

  // Page root: render as layout container
  if (node.component === 'Page') {
    const layout = (node as Record<string, unknown>).layout as string ?? 'scroll'
    const containerStyle: React.CSSProperties =
      layout === 'scroll'
        ? { height: '100%', overflowY: 'auto' }
        : { height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }
    return <div style={{ ...containerStyle, ...(node.style as React.CSSProperties) }}>{childElements}</div>
  }

  const def = getDefinition(node.component)
  if (!def) {
    return (
      <div style={{ padding: '8px', border: '1px dashed #ccc', color: '#999', fontSize: '12px' }}>
        未知组件: {node.component}
      </div>
    )
  }

  const resolvedProps = resolveNodeProps(node, dataModel, dataDispatch, getDataModel, callbacks)
  const isSelected = selectedId === node.id

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    outline: isSelected ? '2px solid #1677ff' : 'none',
    outlineOffset: '2px',
  }

  const componentProps = { style: node.style, ...resolvedProps }

  return (
    <div
      style={wrapperStyle}
      onClick={e => { e.stopPropagation(); onSelect?.(node.id) }}
    >
      {childElements?.length
        ? createElement(def.component, componentProps, ...childElements)
        : createElement(def.component, componentProps)
      }
    </div>
  )
}

// ── Public renderer ───────────────────────────────────────────────────────────

interface A2UIRendererProps {
  bundle: PageBundle
  selectedId?: string
  onSelect?: (id: string) => void
  onSubmit?: (data: DataModel) => void
  onNavigate?: (to: string) => void
  onToast?: (message: string) => void
  onCheckIn?: () => void
}

export default function A2UIRenderer({
  bundle, selectedId, onSelect, onSubmit, onNavigate, onToast, onCheckIn,
}: A2UIRendererProps) {
  const [dataModel, dataDispatch] = useReducer(
    dataModelReducer,
    bundle.initialData ?? {},
  )

  // Stable ref so action handlers always see latest dataModel without re-creating
  const dataModelRef = useRef(dataModel)
  dataModelRef.current = dataModel
  const getDataModel = () => dataModelRef.current

  const componentMap = useMemo(
    () => new Map(bundle.components.map(c => [c.id, c])),
    [bundle.components],
  )

  const callbacks: A2UICallbacks = { onSubmit, onNavigate, onToast, onCheckIn }

  return (
    <RenderNode
      nodeId="root"
      componentMap={componentMap}
      dataModel={dataModel}
      dataDispatch={dataDispatch}
      getDataModel={getDataModel}
      callbacks={callbacks}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  )
}

// Keep old name as alias for backward compatibility during migration
export { A2UIRenderer as SchemaRenderer }
