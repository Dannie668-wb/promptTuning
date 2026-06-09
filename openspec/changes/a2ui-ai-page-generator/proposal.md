## Why

移动端业务页面开发重复度高，表单页、详情页、打卡页等场景高度相似，人工编写耗时且不一致。通过构建 a2ui 组件库（基于 ant-design-mobile + React）和 AI 页面生成系统（DSPy + DeepSeek V4 + LangSmith），让业务描述直接驱动页面 Schema 生成，提升交付效率并建立可持续优化的提示词管理机制。

## What Changes

- 构建 a2ui 自研组件库，封装 ant-design-mobile，附带 JSON Schema 规范定义（props/style/events）
- 实现可视化编辑器：左侧组件面板、中间真实交互预览区、右侧常驻配置面板（属性/样式/事件三 Tab）
- 设计 JSON Schema 页面描述格式 + Action DSL 事件系统
- 实现 JSON Schema → React 渲染引擎（支持真实交互）
- 构建三个示例页面（表单页、详情页、打卡页）作为 few-shot 训练数据
- 接入 DSPy 提示词自动优化，支持导出独立 prompt 文件（脱离 DSPy runtime 直接使用）
- 接入 LangSmith 追踪生成质量，支持人工标注（Annotation Queue）
- 构建 Playground：支持提示词版本管理、A/B 对比测试、人工修正后保存为训练样本
- FastAPI 后端服务：调用 DeepSeek V4，加载导出的 prompt，对接 LangSmith 追踪

## Capabilities

### New Capabilities

- `a2ui-component-library`: a2ui 组件库，封装 ant-design-mobile，每个组件附带 Schema 定义（propsConfig/styleConfig/eventsConfig）和默认 Schema
- `component-registry`: 组件注册表，type 字符串 → React 组件 + Schema 定义，同时服务渲染引擎、配置面板和 LLM 上下文
- `page-schema`: JSON Schema 页面描述规范 + Action DSL 事件系统（setField/submit/navigate/showToast/checkIn）
- `schema-renderer`: JSON Schema → React 真实交互渲染引擎，处理 Action DSL → 真实事件处理函数转换
- `visual-editor`: 可视化编辑器（组件面板 + 预览区 + 配置面板），拖拽组件、点选高亮、实时编辑 Schema
- `example-pages`: 三个示例页面（表单页/详情页/打卡页）的 JSON Schema，作为 DSPy few-shot 训练数据
- `dspy-optimizer`: DSPy 提示词优化程序，含评估指标（自动 + 人工混合）、训练集管理、优化后 prompt 导出流程
- `langsmith-evaluation`: LangSmith 追踪 + 人工标注队列，评估生成质量，标注结果回流训练集
- `ai-generation-api`: FastAPI 后端，加载导出的 prompt_template，调用 DeepSeek V4 生成页面 Schema，集成 LangSmith 追踪
- `playground`: Playground 页面，支持提示词版本选择/手动编辑、A/B 对比测试、生成结果预览、人工评分与样本保存

### Modified Capabilities

## Impact

- 新增 React + TypeScript 前端项目（Vite 构建）
- 新增 Python FastAPI 后端服务（DSPy、LangSmith、httpx 依赖）
- 外部依赖：DeepSeek V4 API、LangSmith API
- 提示词版本以文件形式管理（`prompts/` 目录），FastAPI 热重载读取 `current_prompt.txt`
- 训练数据以 JSON 文件管理（`src/examples/training_data.json`），可持续积累扩充
