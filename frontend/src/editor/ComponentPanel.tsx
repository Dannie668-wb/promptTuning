import { REGISTRY } from '../registry'
import type { ComponentDefinition } from '../types/component'
import { useEditor } from './EditorContext'

const CATEGORIES: { key: ComponentDefinition['category']; label: string }[] = [
  { key: 'form', label: '表单类' },
  { key: 'display', label: '展示类' },
  { key: 'action', label: '操作类' },
  { key: 'checkin', label: '打卡专用' },
]

export default function ComponentPanel() {
  const { dispatch } = useEditor()

  function handleDragStart(e: React.DragEvent, type: string) {
    e.dataTransfer.setData('componentType', type)
  }

  function handleAdd(type: string) {
    const def = REGISTRY[type]
    if (!def) return
    dispatch({ type: 'ADD_COMPONENT', node: def.defaultSchema })
  }

  return (
    <div style={{ width: '200px', borderRight: '1px solid #e5e7eb', overflowY: 'auto', background: '#fafafa' }}>
      <div style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e5e7eb', fontSize: '14px' }}>
        组件库
      </div>
      {CATEGORIES.map(cat => {
        const defs = Object.values(REGISTRY).filter(d => d.category === cat.key)
        if (!defs.length) return null
        return (
          <div key={cat.key}>
            <div style={{ padding: '8px 16px', fontSize: '12px', color: '#6b7280', fontWeight: 600, background: '#f3f4f6' }}>
              {cat.label}
            </div>
            {defs.map(def => (
              <div
                key={def.type}
                draggable
                onDragStart={e => handleDragStart(e, def.type)}
                onClick={() => handleAdd(def.type)}
                style={{
                  padding: '8px 16px',
                  cursor: 'grab',
                  fontSize: '13px',
                  borderBottom: '1px solid #f0f0f0',
                  userSelect: 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                {def.label}
                <span style={{ color: '#9ca3af', fontSize: '11px', marginLeft: '4px' }}>
                  {def.type}
                </span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
