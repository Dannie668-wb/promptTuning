## ADDED Requirements

### Requirement: Component categories
a2ui 组件库 SHALL 包含三类组件：表单类（Input、Select、DatePicker、Radio、Checkbox、Switch、Form、FormItem）、展示类（Card、List、Cell、Tag、Badge、Avatar、Image、Divider）、操作类（Button、ActionSheet、NavBar、TabBar）以及打卡专用组件（Calendar、CheckInCard、Progress）。

#### Scenario: Form component rendering
- **WHEN** Schema 中使用 Input 组件且提供 label、placeholder 属性
- **THEN** 渲染出带标签和占位符的输入框，与 ant-design-mobile Input 视觉一致

### Requirement: Component definition metadata
每个 a2ui 组件 SHALL 导出 ComponentDefinition 对象，包含：type（字符串）、label（中文显示名）、component（React 组件引用）、defaultSchema（拖入画布时的初始 Schema 节点）、propsConfig（可配置属性列表）、styleConfig（可配置样式列表）、eventsConfig（可配置事件列表）。

#### Scenario: Default schema on drag
- **WHEN** 用户将组件拖入预览区
- **THEN** 使用该组件的 defaultSchema 初始化组件节点，包含合理的默认 props

### Requirement: Props/style/events config shape
propsConfig 中每项 SHALL 包含 key、type（string/number/boolean/select）、label 字段；styleConfig 同 propsConfig；eventsConfig 中每项 SHALL 包含 key、label、allowedActions（Action 类型数组）字段。

#### Scenario: Config panel field generation
- **WHEN** 用户在编辑器中选中 Input 组件
- **THEN** 配置面板根据 InputDefinition.propsConfig 自动生成对应编辑控件（文本框、开关等）
