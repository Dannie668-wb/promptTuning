## Context

移动端业务需要频繁交付表单、详情、打卡等结构化页面。当前依赖人工手写 React 代码，效率低且组件用法不一致。本变更构建 a2ui 组件库 + 可视化编辑器 + AI 生成系统，以 JSON Schema 为核心数据格式，打通"业务描述 → 生成 Schema → 渲染页面"的完整链路，并通过 DSPy + LangSmith 建立提示词持续优化机制。

## Goals / Non-Goals

**Goals:**
- 定义 a2ui JSON Schema 规范，作为组件库、编辑器、渲染引擎和 AI 生成的共同语言
- 构建可视化编辑器（拖拽组件、实时预览、配置面板）
- 实现 DSPy 离线优化 → 导出独立 prompt 文件 → FastAPI 生产使用的完整流程
- Playground 支持人工辅助：版本对比、修正样本保存、提示词手动打磨
- LangSmith 追踪每次生成，人工标注回流训练集

**Non-Goals:**
- 不支持自定义 JavaScript 事件逻辑（仅 Action DSL 预定义动作）
- 不构建完整低代码平台（无多页面路由管理、无数据源配置）
- 不支持 Anthropic/OpenAI 以外模型的切换（固定 DeepSeek V4）
- 不实现生成代码的自动部署

## Decisions

### D1: JSON Schema 作为核心数据格式（而非直接生成 JSX）

选择 JSON Schema 而非 JSX 代码生成。

**理由：** JSX 生成容易出现语法错误且难以自动验证；JSON Schema 结构固定，可强制约束 LLM 输出范围（组件类型白名单、props 字段校验），也便于 DSPy metric 自动评分。配置面板和渲染引擎都消费同一份 Schema，单一数据源。

**备选方案：** 直接生成 JSX → 被排除，因为无法结构化校验，且 LLM 容易"发明"不存在的组件。

### D2: Action DSL 处理事件（而非序列化函数）

事件使用预定义 Action 枚举（setField / submit / navigate / showToast / reset / checkIn），不允许任意代码。

**理由：** JSON 无法序列化函数；预定义枚举让 LLM 只能从有限集合选择，大幅降低幻觉概率；渲染引擎将 Action → 真实事件处理函数的转换集中在一处，可测试。

### D3: Python FastAPI 后端 + React 前端分离

AI 生成能力由 Python FastAPI 服务承载，前端通过 HTTP 调用。

**理由：** DSPy 是 Python 生态，LangSmith Python SDK 功能完整，DeepSeek 有 OpenAI 兼容接口。前后端分离后，提示词优化（Python）和页面渲染（React）可独立迭代。

**备选方案：** 前端直接调 DeepSeek API → 被排除，因为 DSPy 优化和 LangSmith 完整追踪均需 Python runtime。

### D4: DSPy 离线优化 + 导出独立 prompt（脱离 DSPy runtime）

生产环境不依赖 DSPy runtime，FastAPI 直接读取导出的 `current_prompt.txt`。

**理由：** 生产链路简单可靠，prompt 升级只需覆盖文件，不改代码；DSPy 优化可定期离线运行，不影响服务稳定性。prompt 文件版本化管理，支持回滚。

### D5: Component Registry 作为三方共享定义

Registry 同时服务渲染引擎（type → React 组件）、配置面板（type → 可编辑字段列表）、LLM 上下文（type → 约束 LLM 只用合法组件和 props）。

**理由：** 单一来源，新增组件只需在 Registry 注册一次，三处自动生效。避免配置面板和渲染引擎的组件定义出现漂移。

### D6: 配置面板常驻 + 选中高亮（而非弹出层）

配置面板始终显示在右侧，点击预览区组件高亮并切换配置内容。

**理由：** 类似 Figma 交互模型，用户无需频繁开关面板，配置和预览可同时观察。

## Risks / Trade-offs

- **[风险] DSPy 3个示例过少，优化效果有限** → 缓解：Playground 积累人工修正样本，定期重跑优化扩充训练集
- **[风险] Action DSL 覆盖不了复杂业务逻辑** → 缓解：明确 Non-Goal，复杂逻辑由开发者在组件外手动扩展
- **[风险] LangSmith 人工标注依赖人力，初期标注量不足** → 缓解：自动评估（JSON 合法性 + 组件白名单）作为基础指标，人工标注作为质量提升项
- **[风险] DeepSeek API 不稳定影响 Playground 体验** → 缓解：FastAPI 设置超时和重试，Playground 显示错误状态
- **[风险] JSON Schema 渲染引擎难以覆盖所有 ant-design-mobile 组件的交互复杂度** → 缓解：初版只支持 Registry 中已注册的组件，未注册类型渲染占位提示

## Open Questions

- LangSmith 标注队列的触发策略：是每次生成都入队，还是仅自动评分低于阈值时入队？
- DSPy 重优化的触发时机：手动触发还是训练集新增 N 条自动触发？
- Playground A/B 测试的对比对象：固定"上一版本 vs 当前版本"，还是用户自由选择两个版本？
