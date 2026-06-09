## ADDED Requirements

### Requirement: Render page schema to interactive React
渲染引擎 SHALL 接受页面 JSON Schema，递归渲染为真实可交互的 React 组件树，表单可填写、按钮可点击。

#### Scenario: Form page rendering
- **WHEN** 传入包含 Form 和 Input 组件的页面 Schema
- **THEN** 渲染出可输入的表单，用户填写内容后表单状态更新

#### Scenario: Nested children rendering
- **WHEN** Schema 中有 Form 包含多个 FormItem 子节点
- **THEN** 子组件按 children 数组顺序渲染在父组件内部

### Requirement: Action DSL to real event handlers
渲染引擎 SHALL 将每个组件节点 events 中的 Action DSL 转换为真实的 React 事件处理函数，通过页面状态管理（useReducer）执行对应操作。

#### Scenario: setField action execution
- **WHEN** Input onChange 绑定了 `{ "action": "setField", "field": "name" }`，用户输入内容
- **THEN** 页面状态中 name 字段值更新，Input 显示最新值

#### Scenario: submit action execution
- **WHEN** Button onClick 绑定了 `{ "action": "submit" }`，用户点击按钮
- **THEN** onSubmit 回调被调用，携带当前所有表单字段值

### Requirement: Page state isolation
每个渲染引擎实例 SHALL 维护独立的页面状态，多个渲染实例（如 Playground A/B 对比）之间状态互不影响。

#### Scenario: Independent state
- **WHEN** 同一页面 Schema 被两个渲染实例渲染（Playground 对比模式）
- **THEN** 在实例 A 中填写的值不影响实例 B 的状态
