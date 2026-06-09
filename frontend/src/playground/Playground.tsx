import { useState, useEffect } from 'react'
import A2UIRenderer from '../renderer/SchemaRenderer'
import type { PageBundle } from '../types/schema'
import { fetchVersions, testPrompt, saveExample, saveVersion } from './api'
import type { VersionInfo } from './api'
import trainingData from '../examples/training_data.json'

type RatingState = 'good' | 'bad' | 'correcting' | null

interface ResultPane {
  bundle: PageBundle | null
  runId: string
  rating: RatingState
  correctedBundle: string
  version?: string
}

function ResultDisplay({ pane, description, onRate, onCorrectionChange, onSaveExample }: {
  pane: ResultPane
  description: string
  onRate: (r: RatingState) => void
  onCorrectionChange: (s: string) => void
  onSaveExample: () => void
}) {
  const [view, setView] = useState<'json' | 'preview'>('preview')

  if (!pane.bundle) return <div style={{ color: '#9ca3af', padding: '32px', textAlign: 'center' }}>暂无结果</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setView('preview')} style={{ padding: '4px 12px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '4px', background: view === 'preview' ? '#1677ff' : '#fff', color: view === 'preview' ? '#fff' : '#374151' }}>预览</button>
        <button onClick={() => setView('json')} style={{ padding: '4px 12px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '4px', background: view === 'json' ? '#1677ff' : '#fff', color: view === 'json' ? '#fff' : '#374151' }}>JSON</button>
      </div>

      {view === 'preview' ? (
        <div style={{ height: '500px', overflow: 'hidden', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <A2UIRenderer bundle={pane.bundle} />
        </div>
      ) : (
        <pre style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', fontSize: '11px', overflow: 'auto', maxHeight: '500px', margin: 0 }}>
          {JSON.stringify(pane.bundle, null, 2)}
        </pre>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => onRate('good')} style={{ flex: 1, padding: '6px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '4px', background: pane.rating === 'good' ? '#f0fdf4' : '#fff', color: '#16a34a' }}>👍 好</button>
        <button onClick={() => onRate('bad')} style={{ flex: 1, padding: '6px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '4px', background: pane.rating === 'bad' ? '#fef2f2' : '#fff', color: '#dc2626' }}>👎 差</button>
        <button onClick={() => onRate('correcting')} style={{ flex: 1, padding: '6px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '4px', background: pane.rating === 'correcting' ? '#eff6ff' : '#fff' }}>✏️ 修正</button>
      </div>

      {pane.rating === 'correcting' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea
            value={pane.correctedBundle}
            onChange={e => onCorrectionChange(e.target.value)}
            style={{ width: '100%', height: '200px', fontFamily: 'monospace', fontSize: '12px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
            placeholder="修正后的 PageBundle JSON..."
          />
          <button
            onClick={onSaveExample}
            style={{ padding: '8px', cursor: 'pointer', background: '#1677ff', color: '#fff', border: 'none', borderRadius: '4px' }}
          >
            保存样本
          </button>
        </div>
      )}
    </div>
  )
}

export default function Playground() {
  const [versions, setVersions] = useState<VersionInfo[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string>('')
  const [promptText, setPromptText] = useState('')
  const [description, setDescription] = useState('')
  const [temperature, setTemperature] = useState(0.2)
  const [abMode, setAbMode] = useState(false)
  const [versionB, setVersionB] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paneA, setPaneA] = useState<ResultPane>({ bundle: null, runId: '', rating: null, correctedBundle: '' })
  const [paneB, setPaneB] = useState<ResultPane>({ bundle: null, runId: '', rating: null, correctedBundle: '' })
  const [enabledExamples, setEnabledExamples] = useState<boolean[]>(trainingData.map(() => true))

  useEffect(() => {
    fetchVersions().then(vs => {
      setVersions(vs)
      if (vs.length > 0) setSelectedVersion(vs[0].version)
    }).catch(() => {})
  }, [])

  async function handleGenerate() {
    setError(null)
    setLoading(true)
    try {
      const params = {
        description,
        temperature,
        custom_prompt: promptText || undefined,
        version: !promptText ? selectedVersion || undefined : undefined,
      }
      const result = await testPrompt(params)
      const bundle = result.bundles[0]
      setPaneA({ bundle, runId: result.run_id, rating: null, correctedBundle: JSON.stringify(bundle, null, 2) })

      if (abMode && versionB) {
        const resultB = await testPrompt({ ...params, custom_prompt: undefined, version: versionB })
        const bundleB = resultB.bundles[0]
        setPaneB({ bundle: bundleB, runId: resultB.run_id, rating: null, correctedBundle: JSON.stringify(bundleB, null, 2) })
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveVersion() {
    await saveVersion(promptText)
    const vs = await fetchVersions()
    setVersions(vs)
    if (vs.length > 0) setSelectedVersion(vs[0].version)
    alert('版本已保存')
  }

  async function handleSaveExample(pane: ResultPane) {
    try {
      const bundle = JSON.parse(pane.correctedBundle) as PageBundle
      await saveExample({ description, corrected_bundle: bundle, run_id: pane.runId })
      alert('样本已保存，可重新运行 DSPy 优化')
    } catch {
      alert('JSON 格式错误，请检查修正内容')
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Left: Prompt editor */}
      <div style={{ width: '380px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
        <div style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e5e7eb', fontSize: '14px' }}>提示词编辑</div>

        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>版本选择</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={selectedVersion}
              onChange={e => setSelectedVersion(e.target.value)}
              style={{ flex: 1, padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}
            >
              <option value="">手动编辑</option>
              {versions.map(v => <option key={v.version} value={v.version}>{v.version}</option>)}
            </select>
          </div>
        </div>

        <div style={{ padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'auto' }}>
          <label style={{ fontSize: '12px', color: '#6b7280' }}>Prompt 内容（可手动编辑）</label>
          <textarea
            value={promptText}
            onChange={e => setPromptText(e.target.value)}
            placeholder="留空则使用版本选择中的 prompt"
            style={{ flex: 1, minHeight: '200px', fontFamily: 'monospace', fontSize: '11px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', resize: 'none' }}
          />

          <label style={{ fontSize: '12px', color: '#6b7280' }}>Few-shot 示例（可勾选）</label>
          {(trainingData as { input: string }[]).map((ex, i) => (
            <label key={i} style={{ fontSize: '12px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
              <input type="checkbox" checked={enabledExamples[i]} onChange={e => setEnabledExamples(prev => prev.map((v, j) => j === i ? e.target.checked : v))} />
              <span style={{ color: '#374151' }}>{ex.input}</span>
            </label>
          ))}

          {promptText && (
            <button onClick={handleSaveVersion} style={{ padding: '8px', cursor: 'pointer', background: '#fff', border: '1px solid #1677ff', color: '#1677ff', borderRadius: '4px', fontSize: '13px' }}>
              保存为当前版本
            </button>
          )}
        </div>
      </div>

      {/* Right: Test area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', background: '#fff', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>业务描述</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="例：用户信息编辑表单，包含姓名和手机号"
              style={{ width: '100%', padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>温度</label>
            <input type="number" min={0} max={1} step={0.1} value={temperature} onChange={e => setTemperature(Number(e.target.value))} style={{ width: '64px', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }} />
          </div>
          <label style={{ fontSize: '13px', display: 'flex', gap: '6px', alignItems: 'center', paddingBottom: '6px' }}>
            <input type="checkbox" checked={abMode} onChange={e => setAbMode(e.target.checked)} />
            A/B 对比
          </label>
          {abMode && (
            <select value={versionB} onChange={e => setVersionB(e.target.value)} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px' }}>
              <option value="">选择版本 B</option>
              {versions.map(v => <option key={v.version} value={v.version}>{v.version}</option>)}
            </select>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading || !description}
            style={{ padding: '6px 20px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: '4px', cursor: loading || !description ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: loading || !description ? 0.6 : 1 }}
          >
            {loading ? '生成中...' : '生成'}
          </button>
        </div>

        {error && (
          <div style={{ padding: '8px 16px', background: '#fef2f2', color: '#dc2626', fontSize: '13px', borderBottom: '1px solid #fecaca' }}>
            错误: {error}
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', overflow: 'auto', gap: 0 }}>
          <div style={{ flex: 1, padding: '16px', overflow: 'auto', borderRight: abMode ? '1px solid #e5e7eb' : 'none' }}>
            {abMode && <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>版本 A: {selectedVersion || '手动编辑'}</div>}
            <ResultDisplay
              pane={paneA}
              description={description}
              onRate={r => setPaneA(p => ({ ...p, rating: r }))}
              onCorrectionChange={s => setPaneA(p => ({ ...p, correctedBundle: s }))}
              onSaveExample={() => handleSaveExample(paneA)}
            />
          </div>

          {abMode && (
            <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px', color: '#6b7280' }}>版本 B: {versionB}</div>
              <ResultDisplay
                pane={paneB}
                description={description}
                onRate={r => setPaneB(p => ({ ...p, rating: r }))}
                onCorrectionChange={s => setPaneB(p => ({ ...p, correctedBundle: s }))}
                onSaveExample={() => handleSaveExample(paneB)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
