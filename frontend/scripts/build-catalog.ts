/**
 * Syncs the a2ui component catalog from the frontend Registry to the backend.
 * Run: npm run build:catalog
 *
 * Outputs:
 *   backend/ai/dspy/component_catalog.txt  — LLM context for prompt
 *   backend/ai/dspy/valid_types.json       — type whitelist for DSPy metric
 */
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { COMPONENT_META, getMetaRegisteredTypes, generateMetaCatalog } from '../src/registry/catalog-data.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BACKEND_DSP_DIR = resolve(__dirname, '../../backend/ai/dspy')

mkdirSync(BACKEND_DSP_DIR, { recursive: true })

// ── 1. component_catalog.txt ──────────────────────────────────────────────────

const A2UI_PROTOCOL_DOCS = `
a2ui PageBundle 完整格式（LLM 输出此格式）：
{
  "surfaceId": "page-唯一ID",
  "name": "页面名称",
  "catalogId": "antd-mobile",
  "components": [
    {
      "id": "root",
      "component": "Page",
      "layout": "scroll",
      "style": {},
      "children": ["navbar-001", "form-001", "btn-save"]
    },
    {
      "id": "input-name",
      "component": "Input",
      "label": "姓名",
      "placeholder": "请输入姓名",
      "required": true,
      "style": {},
      "value": { "path": "/formData/name" }
    },
    {
      "id": "btn-save",
      "component": "Button",
      "text": "保存",
      "color": "primary",
      "block": true,
      "style": {},
      "onClick": { "action": { "event": { "name": "submit" } } }
    }
  ],
  "initialData": { "formData": { "name": "" } }
}

Action 格式（event handler 属性值）：
- Server Event: { "action": { "event": { "name": "submit|navigate|reset|checkIn" } } }
- 带参数:       { "action": { "event": { "name": "navigate", "context": { "to": "/home" } } } }
- Local Call:   { "action": { "functionCall": { "call": "showToast", "args": { "message": "提示文字" } } } }

重要约束：
1. components 中必须包含 id="root" 且 component="Page" 的根组件
2. 容器组件（Page/Form/Card/List）的 children 是子组件 id 字符串数组（非嵌套对象）
3. 叶子组件（Button/Tag/NavBar）文本内容用 text/title prop，不用 children
4. 表单组件用 value: {"path":"/..."} 替代 onChange 事件处理数据绑定
5. 数据绑定路径必须以 / 开头（JSON Pointer RFC 6901）
6. props 直接平铺在组件节点上，不用 props:{} 包装层`.trim()

const catalog = [
  `# a2ui 组件目录（自动生成，勿手动编辑）`,
  `# 生成时间: ${new Date().toISOString()}`,
  '',
  generateMetaCatalog(),
  '',
  A2UI_PROTOCOL_DOCS,
].join('\n')

writeFileSync(resolve(BACKEND_DSP_DIR, 'component_catalog.txt'), catalog, 'utf-8')
console.log(`✓ component_catalog.txt — ${COMPONENT_META.length} 个组件`)

// ── 2. valid_types.json ───────────────────────────────────────────────────────

const categories: Record<string, string[]> = {}
for (const m of COMPONENT_META) {
  ;(categories[m.category] ??= []).push(m.type)
}

const validTypes = {
  generated_at: new Date().toISOString(),
  types: [...getMetaRegisteredTypes()].sort(),
  categories,
}

writeFileSync(
  resolve(BACKEND_DSP_DIR, 'valid_types.json'),
  JSON.stringify(validTypes, null, 2),
  'utf-8',
)
console.log(`✓ valid_types.json — ${validTypes.types.length} 个类型: ${validTypes.types.join(', ')}`)
