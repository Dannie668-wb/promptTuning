## ADDED Requirements

### Requirement: Page schema structure
系统 SHALL 使用 JSON 格式描述页面，顶层结构包含 id、name、type、layout、components 字段。type 固定为 "page"，layout 取值为 "scroll" 或 "fixed"。

#### Scenario: Valid page schema
- **WHEN** 提供符合规范的页面 JSON
- **THEN** 渲染引擎能正确解析并渲染页面

### Requirement: Component node structure
每个组件节点 SHALL 包含 id（唯一字符串）、type（Registry 中已注册的组件类型）、props（对象）、style（对象）、events（对象）字段，容器组件 SHALL 支持 children 数组。

#### Scenario: Component node with children
- **WHEN** 组件节点包含 children 数组
- **THEN** 渲染引擎递归渲染子组件

#### Scenario: Unknown component type
- **WHEN** 组件节点的 type 不在 Registry 中
- **THEN** 渲染引擎显示占位提示而非崩溃

### Requirement: Action DSL for events
events 对象的值 SHALL 为 Action DSL 对象，格式为 `{ "action": "<actionType>", ...params }`，支持的 actionType 枚举：setField、submit、navigate、showToast、reset、checkIn。

#### Scenario: setField action
- **WHEN** 触发绑定了 setField action 的事件
- **THEN** 页面状态中对应 field 的值更新为事件携带的新值

#### Scenario: submit action
- **WHEN** 触发绑定了 submit action 的事件
- **THEN** 系统收集当前表单所有字段值并触发提交回调

#### Scenario: navigate action
- **WHEN** 触发绑定了 navigate action 且携带 to 参数的事件
- **THEN** 页面跳转到 to 指定的路径

#### Scenario: showToast action
- **WHEN** 触发绑定了 showToast action 且携带 message 参数的事件
- **THEN** 页面显示对应文字的 Toast 提示

#### Scenario: unsupported action type
- **WHEN** action 的类型不在支持枚举中
- **THEN** 系统忽略该 action 并在控制台输出警告
