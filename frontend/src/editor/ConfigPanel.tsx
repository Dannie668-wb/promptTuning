import { useState } from 'react'
import { useEditor } from './EditorContext'
import { getDefinition } from '../registry'
import type { PropConfigItem, EventConfigItem } from '../types/component'
import type { A2UIAction } from '../types/schema'

type TabKey = 'props' | 'style' | 'events'

function PropField({ item, value, onChange }: { item: PropConfigItem; value: unknown; onChange: (v: unknown) => void }) {
  if (item.type === 'boolean') {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
        <label style={{ fontSize: '13px', color: '#374151' }}>{item.label}</label>
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />
      </div>
    )
  }
  if (item.type === 'number') {
    return (
      <div style={{ padding: '6px 0' }}>
        <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>{item.label}</label>
        <input
          type="number"
          value={String(value ?? '')}
          onChange={e => onChange(Number(e.target.value))}
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
        />
      </div>
    )
  }
  if (item.type === 'select' && item.options) {
    return (
      <div style={{ padding: '6px 0' }}>
        <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>{item.label}</label>
        <select
          value={String(value ?? '')}
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
        >
          {item.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    )
  }
  return (
    <div style={{ padding: '6px 0' }}>
      <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>{item.label}</label>
      <input
        type="text"
        value={String(value ?? '')}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
      />
    </div>
  )
}

function BindingField({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const isBinding = typeof value === 'object' && value !== null && 'path' in value
  const pathValue = isBinding ? (value as { path: string }).path : ''
  return (
    <div style={{ padding: '6px 0' }}>
      <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>数据绑定路径</label>
      <input
        type="text"
        placeholder="/formData/field"
        value={pathValue}
        onChange={e => {
          const p = e.target.value.trim()
          onChange(p ? { path: p } : undefined)
        }}
        style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace' }}
      />
    </div>
  )
}

function EventField({ item, value, onChange }: {
  item: EventConfigItem
  value: A2UIAction | undefined
  onChange: (v: A2UIAction | undefined) => void
}) {
  const allOptions: { label: string; value: string }[] = [
    ...(item.allowedEvents ?? []).map(e => ({ label: `event: ${e}`, value: `event:${e}` })),
    ...(item.allowedCalls ?? []).map(c => ({ label: `call: ${c}`, value: `call:${c}` })),
  ]

  let currentValue = ''
  if (value) {
    const a = value.action
    if ('event' in a) currentValue = `event:${a.event.name}`
    else if ('functionCall' in a) currentValue = `call:${a.functionCall.call}`
  }

  function buildAction(raw: string): A2UIAction | undefined {
    if (!raw) return undefined
    const [kind, name] = raw.split(':')
    if (kind === 'event') return { action: { event: { name } } }
    if (kind === 'call') return { action: { functionCall: { call: name, args: {} } } }
    return undefined
  }

  return (
    <div style={{ padding: '6px 0' }}>
      <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>{item.label} ({item.key})</label>
      <select
        value={currentValue}
        onChange={e => onChange(buildAction(e.target.value))}
        style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', marginBottom: '4px' }}
      >
        <option value="">-- 不绑定 --</option>
        {allOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {value && 'action' in value && 'event' in value.action && value.action.event.name === 'navigate' && (
        <input
          placeholder="目标路径 /home"
          value={(value.action.event.context?.to as string) ?? ''}
          onChange={e => onChange({ action: { event: { name: 'navigate', context: { to: e.target.value } } } })}
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
        />
      )}
      {value && 'action' in value && 'functionCall' in value.action && value.action.functionCall.call === 'showToast' && (
        <input
          placeholder="提示文字 message"
          value={(value.action.functionCall.args?.message as string) ?? ''}
          onChange={e => onChange({ action: { functionCall: { call: 'showToast', args: { message: e.target.value } } } })}
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
        />
      )}
    </div>
  )
}

export default function ConfigPanel() {
  const { state, dispatch } = useEditor()
  const [activeTab, setActiveTab] = useState<TabKey>('props')

  const selectedNode = state.selectedId
    ? state.bundle.components.find(c => c.id === state.selectedId) ?? null
    : null
  const def = selectedNode ? getDefinition(selectedNode.component) : null

  const tabStyle = (tab: TabKey): React.CSSProperties => ({
    flex: 1,
    padding: '8px 0',
    textAlign: 'center',
    fontSize: '13px',
    cursor: 'pointer',
    borderBottom: activeTab === tab ? '2px solid #1677ff' : '2px solid transparent',
    color: activeTab === tab ? '#1677ff' : '#6b7280',
    fontWeight: activeTab === tab ? 600 : 400,
  })

  function handleExport() {
    const json = JSON.stringify(state.bundle, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${state.bundle.name || 'bundle'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ width: '260px', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <div style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e5e7eb', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{selectedNode ? `${selectedNode.component} · 配置` : '配置面板'}</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {selectedNode && (
            <button
              onClick={() => dispatch({ type: 'DELETE_COMPONENT', id: selectedNode.id })}
              title="删除组件 (Delete)"
              style={{ fontSize: '12px', padding: '2px 8px', cursor: 'pointer', border: '1px solid #fca5a5', borderRadius: '4px', background: '#fff5f5', color: '#ef4444' }}
            >
              删除
            </button>
          )}
          <button
            onClick={handleExport}
            style={{ fontSize: '12px', padding: '2px 8px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '4px', background: '#fff' }}
          >
            导出
          </button>
        </div>
      </div>

      {!selectedNode && (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
          点击预览区组件开始配置
        </div>
      )}

      {selectedNode && def && (
        <>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            {(['props', 'style', 'events'] as TabKey[]).map(tab => (
              <div key={tab} style={tabStyle(tab)} onClick={() => setActiveTab(tab)}>
                {{ props: '属性', style: '样式', events: '事件' }[tab]}
              </div>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
            {activeTab === 'props' && (
              <>
                {def.supportsBinding && (
                  <BindingField
                    value={selectedNode.value}
                    onChange={v => dispatch({ type: 'UPDATE_NODE', id: selectedNode.id, fields: { value: v } })}
                  />
                )}
                {def.propsConfig.map(item => (
                  <PropField
                    key={item.key}
                    item={item}
                    value={(selectedNode as Record<string, unknown>)[item.key]}
                    onChange={v => dispatch({ type: 'UPDATE_NODE', id: selectedNode.id, fields: { [item.key]: v } })}
                  />
                ))}
                {!def.supportsBinding && def.propsConfig.length === 0 && (
                  <div style={{ color: '#9ca3af', fontSize: '13px', padding: '16px 0' }}>该组件无可配置属性</div>
                )}
              </>
            )}

            {activeTab === 'style' && def.styleConfig.map(item => (
              <PropField
                key={item.key}
                item={item}
                value={(selectedNode.style as Record<string, unknown>)?.[item.key]}
                onChange={v => dispatch({ type: 'UPDATE_STYLE', id: selectedNode.id, style: { [item.key]: v as string } })}
              />
            ))}

            {activeTab === 'events' && def.eventsConfig.map(item => (
              <EventField
                key={item.key}
                item={item}
                value={(selectedNode as Record<string, unknown>)[item.key] as A2UIAction | undefined}
                onChange={v => dispatch({
                  type: 'UPDATE_NODE',
                  id: selectedNode.id,
                  fields: { [item.key]: v } as Partial<import('../types/schema').A2UIComponent>,
                })}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
