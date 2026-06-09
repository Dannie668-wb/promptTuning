import { EditorProvider } from './EditorContext'
import ComponentPanel from './ComponentPanel'
import PreviewArea from './PreviewArea'
import ConfigPanel from './ConfigPanel'

export default function Editor() {
  return (
    <EditorProvider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        <ComponentPanel />
        <PreviewArea />
        <ConfigPanel />
      </div>
    </EditorProvider>
  )
}
