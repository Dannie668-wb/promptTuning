import A2UIRenderer from '../renderer/SchemaRenderer'
import { useEditor } from './EditorContext'
import { REGISTRY } from '../registry'
import formPage from '../examples/form-page.json'
import detailPage from '../examples/detail-page.json'
import checkinPage from '../examples/checkin-page.json'
import type { PageBundle } from '../types/schema'

const EXAMPLES: { label: string; bundle: PageBundle }[] = [
  { label: '表单页', bundle: formPage as PageBundle },
  { label: '详情页', bundle: detailPage as PageBundle },
  { label: '打卡页', bundle: checkinPage as PageBundle },
]

export default function PreviewArea() {
  const { state, dispatch } = useEditor()

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const type = e.dataTransfer.getData('componentType')
    if (!type) return
    const def = REGISTRY[type]
    if (!def) return
    dispatch({ type: 'ADD_COMPONENT', node: def.defaultNode })
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const currentName = state.bundle.name

  return (
    <div
      style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f0f0f0', overflowY: 'auto' }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Example switcher */}
      <div style={{ display: 'flex', gap: '8px', padding: '12px 24px 0', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#6b7280', marginRight: '4px' }}>示例：</span>
        {EXAMPLES.map(ex => (
          <button
            key={ex.label}
            onClick={() => dispatch({ type: 'SET_BUNDLE', bundle: ex.bundle })}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              border: '1px solid',
              borderColor: currentName === ex.bundle.name ? '#1677ff' : '#d1d5db',
              borderRadius: '4px',
              background: currentName === ex.bundle.name ? '#e6f0ff' : '#fff',
              color: currentName === ex.bundle.name ? '#1677ff' : '#374151',
              cursor: 'pointer',
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '16px 24px 24px' }}>
      {/* Phone shell */}
      <div
        style={{
          width: '375px',
          minHeight: '667px',
          background: '#fff',
          borderRadius: '36px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          border: '8px solid #1a1a1a',
          position: 'relative',
        }}
      >
        {/* Status bar */}
        <div style={{ height: '28px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '80px', height: '16px', background: '#1a1a1a', borderRadius: '8px' }} />
        </div>

        {/* Content area */}
        <div style={{ height: 'calc(667px - 28px)', overflowY: 'auto' }}>
          <A2UIRenderer
            bundle={state.bundle}
            selectedId={state.selectedId ?? undefined}
            onSelect={id => dispatch({ type: 'SELECT', id })}
          />
        </div>
      </div>
      </div>
    </div>
  )
}
