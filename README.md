# a2ui AI Page Generator

基于 ant-design-mobile 的自研组件库，配套可视化编辑器 + AI 页面生成系统。

通过 DSPy 优化提示词、DeepSeek V4 生成页面 Schema、LangSmith 追踪评估，实现"业务描述 → 移动端页面"的完整链路。

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 + TypeScript + Vite + antd-mobile 5 |
| 后端 | Python 3.11+ + FastAPI + uvicorn |
| AI 优化 | DSPy (BootstrapFewShot) |
| AI 模型 | DeepSeek V4 (OpenAI 兼容接口) |
| 评估追踪 | LangSmith |

---

## 项目结构

```
a2ui-ai-page-generator/
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── types/              # TypeScript 类型（PageSchema、ActionDSL 等）
│   │   ├── registry/           # 组件注册表 + 目录数据
│   │   ├── components/         # a2ui 组件定义（form/display/action/checkin）
│   │   ├── renderer/           # JSON Schema → React 渲染引擎
│   │   ├── editor/             # 可视化编辑器（三栏布局）
│   │   ├── playground/         # Playground 页面
│   │   └── examples/           # 示例页面 + 训练数据
│   └── scripts/
│       └── build-catalog.ts    # 同步组件目录到后端
├── backend/                    # Python 后端
│   ├── main.py                 # FastAPI 入口
│   ├── api/
│   │   ├── generate.py         # POST /generate
│   │   ├── playground.py       # Playground 相关端点
│   │   └── prompt_manager.py   # prompt 版本文件管理
│   └── ai/
│       ├── dspy/
│       │   ├── optimize_and_export.py  # DSPy 优化 + 导出
│       │   ├── component_catalog.txt   # 自动生成，供 LLM 使用
│       │   └── valid_types.json        # 自动生成，供校验使用
│       └── langsmith/
│           └── annotation.py   # LangSmith 标注队列
└── prompts/                    # 导出的 prompt 版本文件
    ├── current_prompt.txt      # 当前生产使用的 prompt
    └── *_prompt_template.txt   # 历史版本
```

---

## 快速开始

### 1. 环境要求

- Node.js >= 18
- Python >= 3.11
- [uv](https://docs.astral.sh/uv/)（Python 包管理器）
- DeepSeek API Key（[获取地址](https://platform.deepseek.com)）
- LangSmith API Key（[获取地址](https://smith.langchain.com)）

### 2. 配置 API Key

编辑 `backend/.env`：

```env
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
LANGSMITH_API_KEY=lsv2_xxxxxxxxxxxxxxxx
LANGSMITH_PROJECT=a2ui-page-generator
LANGSMITH_TRACING=true
AUTO_ANNOTATION_QUEUE=false
```

### 3. 安装依赖

```bash
# 前端
cd frontend
npm install

# 后端
cd backend
uv sync
```

### 4. 启动服务

**终端 1 — 前端：**

```bash
cd frontend
npm run dev
# 访问 http://localhost:5173
```

**终端 2 — 后端：**

```bash
cd backend
uv run uvicorn main:app --reload
# API 运行于 http://localhost:8000
```

---

## 使用说明

### 可视化编辑器

访问 `http://localhost:5173`，默认进入编辑器页面：

- **左侧**：组件面板，按表单/展示/操作/打卡分类，点击或拖拽添加组件
- **中间**：手机预览区，真实交互渲染，点击组件高亮选中
- **右侧**：配置面板（常驻），切换属性/样式/事件三 Tab 编辑
- 右上角「导出」按钮下载当前页面 JSON Schema

### Playground

点击顶部导航切换到 Playground：

| 功能 | 操作 |
|------|------|
| 测试提示词 | 输入业务描述，点击「生成」 |
| 切换版本 | 左侧版本选择下拉 |
| 手动编辑 prompt | 左侧文本框直接修改 |
| A/B 对比 | 勾选「A/B 对比」，选择版本 B |
| 人工评分 | 生成结果下方 👍 / 👎 / ✏️ 修正 |
| 保存训练样本 | 修正后点击「保存样本」 |
| 发布新版本 | 编辑 prompt 后点击「保存为当前版本」 |

---

## AI 提示词优化流程

### 第一次运行（初始优化）

```bash
cd backend
uv run python -m ai.dspy.optimize_and_export
```

流程：
1. 读取 `frontend/src/examples/training_data.json`（3 个示例）
2. DSPy BootstrapFewShot 自动优化 few-shot 示例排列和指令措辞
3. 导出到 `prompts/current_prompt.txt`（FastAPI 自动热重载）

### 持续优化循环

```
用户使用 Playground 生成页面
        │
        ▼
LangSmith 追踪每次调用
        │
        ▼
人工在 Playground 评分 / 修正
        │
        ▼
training_data.json 积累新样本
        │
        ▼
重跑 python -m ai.dspy.optimize_and_export
        │
        ▼
新版本 current_prompt.txt 自动生效
```

### 新增 a2ui 组件后同步

每次在 `frontend/src/registry/catalog-data.ts` 添加新组件后，运行：

```bash
cd frontend
npm run build:catalog
```

自动更新 `backend/ai/dspy/component_catalog.txt` 和 `valid_types.json`，LLM 上下文和校验规则同步生效。

---

## API 接口

后端文档：`http://localhost:8000/docs`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/generate` | 生成页面 Schema |
| POST | `/playground/test` | Playground 测试（支持自定义 prompt） |
| POST | `/playground/save-example` | 保存修正样本到训练集 |
| POST | `/playground/save-version` | 保存 prompt 版本并设为当前 |
| GET  | `/playground/versions` | 获取所有 prompt 版本列表 |
| GET  | `/health` | 健康检查 |

**生成接口示例：**

```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"description": "员工请假申请表单，包含姓名、部门、请假天数和原因"}'
```

---

## 开发指南

### 运行测试

```bash
cd frontend
npm test           # 监听模式
npm run test:run   # 单次运行（20 个测试）
```

### 新增 a2ui 组件

1. 在 `frontend/src/registry/catalog-data.ts` 添加 `ComponentMeta`
2. 在 `frontend/src/components/definitions/` 对应文件添加 `ComponentDefinition`（含 React 组件引用）
3. 在 `frontend/src/registry/index.ts` 注册到 `REGISTRY`
4. 运行 `npm run build:catalog` 同步到后端

### prompt 版本管理

```
prompts/
├── current_prompt.txt              ← FastAPI 读取此文件（热重载）
├── 20260609_120000_prompt_template.txt
├── 20260609_120000_dspy_program.json   ← 可用于继续 DSPy 优化
└── 20260610_093000_prompt_template.txt
```

回滚版本：将目标版本内容复制到 `current_prompt.txt` 即可。

---

## 数据流总览

```
Registry (catalog-data.ts)
        │
        │ npm run build:catalog
        ▼
component_catalog.txt ──── 注入 LLM 提示词
valid_types.json      ──── DSPy metric 校验

training_data.json (3 seed + 人工积累)
        │
        │ python -m ai.dspy.optimize_and_export
        ▼
current_prompt.txt ──── FastAPI /generate ──── LangSmith 追踪
                                │
                                ▼
                         生成 JSON Schema
                                │
                                ▼
                         SchemaRenderer (前端真实交互渲染)
```
