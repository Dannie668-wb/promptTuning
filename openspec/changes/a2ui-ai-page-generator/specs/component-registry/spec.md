## ADDED Requirements

### Requirement: Registry maps type to definition
系统 SHALL 维护一个 REGISTRY 映射，key 为组件 type 字符串，value 为 ComponentDefinition 对象。Registry 是渲染引擎、配置面板和 LLM 上下文生成的单一来源。

#### Scenario: Lookup by type
- **WHEN** 渲染引擎或配置面板传入 type 字符串
- **THEN** Registry 返回对应的 ComponentDefinition，包括 React 组件引用和配置元数据

#### Scenario: Unregistered type lookup
- **WHEN** 查找的 type 不在 Registry 中
- **THEN** 返回 undefined，调用方按 unknown 组件处理

### Requirement: Registry generates LLM component catalog
系统 SHALL 提供从 Registry 自动生成"组件目录文本"的函数，输出包含每个组件的 type、可用 props 及允许的 action 类型，用于注入 LLM 提示词上下文。

#### Scenario: Component catalog generation
- **WHEN** 调用 generateComponentCatalog()
- **THEN** 返回包含所有已注册组件 type、props 字段名和 allowedActions 的文本描述

### Requirement: New component registration
开发者 SHALL 能通过在 REGISTRY 对象中添加新条目完成组件注册，注册后立即在渲染引擎、配置面板和 LLM 上下文中生效，无需修改其他代码。

#### Scenario: Register new component
- **WHEN** 向 REGISTRY 添加新的 ComponentDefinition
- **THEN** 渲染引擎能渲染该类型，配置面板能显示其配置项，LLM 上下文包含该组件描述
