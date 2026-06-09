## ADDED Requirements

### Requirement: Three-panel editor layout
编辑器 SHALL 呈现三栏布局：左侧组件面板（按类别分组展示所有 Registry 组件）、中间预览区（手机外壳 + 真实交互渲染）、右侧配置面板（常驻，三 Tab）。

#### Scenario: Editor renders on load
- **WHEN** 用户打开编辑器页面
- **THEN** 三栏布局完整显示，左侧组件面板按表单/展示/操作分类展示组件

### Requirement: Drag component to canvas
用户 SHALL 能将左侧组件面板中的组件拖拽到预览区，松手后使用组件的 defaultSchema 在 Schema 树末尾插入新节点并立即渲染。

#### Scenario: Drag and drop
- **WHEN** 用户将 Input 组件从面板拖入预览区
- **THEN** 预览区出现一个带默认 label 的 Input，右侧配置面板切换为该 Input 的配置

### Requirement: Select component highlights and shows config
用户 SHALL 能点击预览区中的组件，被选中的组件高亮显示轮廓，右侧配置面板切换为该组件的配置内容。

#### Scenario: Component selection
- **WHEN** 用户点击预览区中的 Button 组件
- **THEN** Button 显示高亮轮廓，配置面板显示 Button 的 Props/Style/Events 配置

### Requirement: Config panel always visible with three tabs
右侧配置面板 SHALL 始终显示，包含"属性"、"样式"、"事件"三个 Tab，每个 Tab 根据当前选中组件的 ComponentDefinition 动态渲染编辑控件。

#### Scenario: Props tab editing
- **WHEN** 用户在属性 Tab 修改 Input 的 label 值
- **THEN** JSON Schema 中对应节点的 props.label 立即更新，预览区重新渲染显示新标签

#### Scenario: Events tab action config
- **WHEN** 用户在事件 Tab 为 Button 的 onClick 选择 submit action
- **THEN** Schema 中对应节点的 events.onClick 更新为 `{ "action": "submit" }`

### Requirement: Export schema
编辑器 SHALL 提供"导出 Schema"按钮，点击后下载当前页面 Schema 为 JSON 文件。

#### Scenario: Export
- **WHEN** 用户点击"导出 Schema"
- **THEN** 浏览器下载包含当前页面完整 Schema 的 JSON 文件
