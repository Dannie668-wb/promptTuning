import type { PageBundle, A2UIMessage } from '../types/schema'

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export interface VersionInfo {
  version: string
  path: string
}

export async function fetchVersions(): Promise<VersionInfo[]> {
  const res = await fetch(`${BASE}/playground/versions`)
  const data = await res.json()
  return data.versions
}

export async function testPrompt(params: {
  description: string
  custom_prompt?: string
  version?: string
  temperature?: number
  n_samples?: number
}): Promise<{ bundles: PageBundle[]; run_id: string }> {
  const res = await fetch(`${BASE}/playground/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json()
}

export async function saveExample(params: {
  description: string
  corrected_bundle: PageBundle
  run_id?: string
}): Promise<void> {
  await fetch(`${BASE}/playground/save-example`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
}

export async function saveVersion(prompt_text: string): Promise<{ version: string }> {
  const res = await fetch(`${BASE}/playground/save-version`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt_text }),
  })
  return res.json()
}

export async function* generateStream(description: string): AsyncGenerator<A2UIMessage> {
  const res = await fetch(`${BASE}/generate/stream?description=${encodeURIComponent(description)}`)
  if (!res.ok || !res.body) return

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const chunks = buffer.split('\n\n')
    buffer = chunks.pop() ?? ''
    for (const chunk of chunks) {
      const data = chunk.replace(/^data: /, '').trim()
      if (!data || data === '[DONE]') continue
      try { yield JSON.parse(data) as A2UIMessage } catch { /* skip malformed */ }
    }
  }
}
