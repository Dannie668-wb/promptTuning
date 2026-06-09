## 1. 项目初始化

- [x] 1.1 创建 React + TypeScript 前端项目（Vite），配置 ant-design-mobile 依赖
- [x] 1.2 创建 Python FastAPI 后端项目，配置 dspy-ai、langsmith、httpx 依赖
- [x] 1.3 创建 prompts/ 目录和 src/examples/ 目录，初始化空的 training_data.json

## 2. Page Schema 与 Action DSL

- [x] 2.1 定义 TypeScript 类型：PageSchema、ComponentNode、ActionDSL（含六种 action 枚举）
- [x] 2.2 实现 JSON Schema 合法性校验函数（type 白名单检查、必要字段检查）
- [x] 2.3 编写 Schema 校验单元测试

## 3. a2ui 组件库

- [x] 3.1 定义 ComponentDefinition 类型接口（propsConfig/styleConfig/eventsConfig/defaultSchema）
- [x] 3.2 实现表单类组件定义：Input、Select、DatePicker、Radio、Checkbox、Switch、Form、FormItem
- [x] 3.3 实现展示类组件定义：Card、List、Cell、Tag、Badge、Avatar、Image、Divider
- [x] 3.4 实现操作类组件定义：Button、ActionSheet、NavBar、TabBar
- [x] 3.5 实现打卡专用组件定义：Calendar、CheckInCard、Progress

## 4. Component Registry

- [x] 4.1 实现 REGISTRY 映射，注册所有 a2ui 组件
- [x] 4.2 实现 generateComponentCatalog() 函数，输出 LLM 可用的组件目录文本
- [x] 4.3 编写 Registry 查找和目录生成的单元测试

## 5. Schema 渲染引擎

- [x] 5.1 实现 renderNode() 递归渲染函数，从 Registry 查找组件并注入 props/style
- [x] 5.2 实现 resolveEvents() 函数，将 Action DSL 转换为真实 React 事件处理函数
- [x] 5.3 实现页面级 useReducer 状态管理（处理 setField/submit/navigate/showToast/reset/checkIn）
- [x] 5.4 实现 SchemaRenderer 组件，管理页面状态并渲染根节点
- [x] 5.5 编写渲染引擎集成测试（表单填写、按钮提交）

## 6. 示例页面 JSON Schema

- [x] 6.1 编写表单页 Schema（form-page.json）：用户信息编辑，含姓名/手机号/生日
- [x] 6.2 编写详情页 Schema（detail-page.json）：订单详情，含状态/金额/商品列表
- [x] 6.3 编写打卡页 Schema（checkin-page.json）：每日打卡，含今日状态/历史/打卡按钮
- [x] 6.4 将三个示例写入 training_data.json（含 input 业务描述和 output Schema）

## 7. 可视化编辑器

- [x] 7.1 实现三栏布局框架（ComponentPanel / PreviewArea / ConfigPanel）
- [x] 7.2 实现 ComponentPanel：按分类展示 Registry 中的组件，支持拖拽
- [x] 7.3 实现 PreviewArea：手机外壳容器 + SchemaRenderer 渲染 + 组件点选高亮逻辑
- [x] 7.4 实现 ConfigPanel 三 Tab 框架（属性/样式/事件）
- [x] 7.5 实现 ConfigPanel 属性 Tab：根据 propsConfig 动态生成编辑控件，变更同步 Schema
- [x] 7.6 实现 ConfigPanel 样式 Tab：根据 styleConfig 动态生成样式编辑控件
- [x] 7.7 实现 ConfigPanel 事件 Tab：根据 eventsConfig 展示 Action 类型选择器和参数输入
- [x] 7.8 实现拖放逻辑：拖拽组件到 PreviewArea 后插入 defaultSchema 节点
- [x] 7.9 实现"导出 Schema"按钮功能

## 8. FastAPI 后端

- [x] 8.1 实现 prompt 版本文件管理工具函数（load_prompt_version / update_current_prompt / list_versions）
- [x] 8.2 实现 POST /generate 端点，加载 current_prompt.txt，调用 DeepSeek V4，返回 Schema + run_id
- [x] 8.3 集成 LangSmith 追踪装饰器，标注 source="production"
- [x] 8.4 实现 current_prompt.txt 热重载（每次请求读取文件，不缓存）
- [x] 8.5 实现 POST /playground/test 端点，支持 custom_prompt / version 参数
- [x] 8.6 实现 POST /playground/save-example 端点，追加样本到 training_data.json
- [x] 8.7 实现 POST /playground/save-version 端点，保存版本并更新 current
- [x] 8.8 实现 GET /playground/versions 端点，返回版本列表（按时间倒序）

## 9. DSPy 提示词优化

- [x] 9.1 实现 PageGenerator DSPy Signature（description → schema）
- [x] 9.2 实现复合评估指标 schema_metric（JSON 合法性 + 组件白名单 + 必要字段 + LangSmith 人工分）
- [x] 9.3 实现 load_trainset() 从 training_data.json 加载 dspy.Example 列表
- [x] 9.4 实现 optimize() 函数，配置 DeepSeek LM，运行 BootstrapFewShot 优化
- [x] 9.5 实现 export_prompt() 函数，导出版本化 DSPy 程序 JSON + prompt 文本 + 更新 current_prompt.txt
- [x] 9.6 实现命令行入口（python -m ai.dspy.optimize_and_export）

## 10. LangSmith 评估集成

- [x] 10.1 实现 LangSmith Annotation Queue 创建和 run 入队函数（submit_for_review）
- [x] 10.2 实现 fetch_human_score() 从 LangSmith 标注检索人工评分
- [x] 10.3 在 FastAPI 生成端点中集成自动入队逻辑（可配置开关）

## 11. Playground 前端

- [x] 11.1 实现 Playground 页面路由和整体左右两栏布局
- [x] 11.2 实现左侧提示词编辑区：版本选择下拉（调 /playground/versions）+ 可编辑文本框
- [x] 11.3 实现 few-shot 示例列表展示（可勾选包含/排除）
- [x] 11.4 实现右侧测试区：描述输入框 + 温度参数 + 生成按钮（调 /playground/test）
- [x] 11.5 实现生成结果展示：JSON Schema 文本视图 + SchemaRenderer 真实预览并排
- [x] 11.6 实现人工评分控件（好/差/需修正），调用 LangSmith 标注 API
- [x] 11.7 实现"需修正"弹出 Schema 编辑框 + "保存样本"（调 /playground/save-example）
- [x] 11.8 实现 A/B 对比模式：双版本选择 + 并排预览 + "选择此版本"按钮
- [x] 11.9 实现"保存为当前版本"按钮（调 /playground/save-version）

## 12. 整体联调与验收

- [ ] 12.1 用三个示例页面运行 DSPy 优化，导出 current_prompt.txt，验证文件生成正确（需 DEEPSEEK_API_KEY）
- [ ] 12.2 通过 /generate 端点测试端到端生成，验证返回 Schema 可被 SchemaRenderer 正确渲染（需 DEEPSEEK_API_KEY）
- [ ] 12.3 在 Playground 完成 A/B 对比测试流程，验证版本切换和结果展示正常（需 backend 启动）
- [ ] 12.4 保存人工修正样本，重跑 DSPy 优化，验证新版本 prompt 导出并生效（需 DEEPSEEK_API_KEY）
- [ ] 12.5 验证 LangSmith 追踪记录和 Annotation Queue 流程（需 LANGSMITH_API_KEY）
