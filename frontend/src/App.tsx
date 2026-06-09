import { useState } from 'react'
import Editor from './editor/Editor'
import Playground from './playground/Playground'

type Page = 'editor' | 'playground'

export default function App() {
  const [page, setPage] = useState<Page>('editor')

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ display: 'flex', gap: '0', borderBottom: '1px solid #e5e7eb', background: '#fff', flexShrink: 0 }}>
        {([
          { key: 'editor', label: '编辑器' },
          { key: 'playground', label: 'Playground' },
        ] as { key: Page; label: string }[]).map(item => (
          <button
            key={item.key}
            onClick={() => setPage(item.key)}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderBottom: page === item.key ? '2px solid #1677ff' : '2px solid transparent',
              background: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: page === item.key ? '#1677ff' : '#374151',
              fontWeight: page === item.key ? 600 : 400,
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {page === 'editor' ? <Editor /> : <Playground />}
      </div>
    </div>
  )
}
