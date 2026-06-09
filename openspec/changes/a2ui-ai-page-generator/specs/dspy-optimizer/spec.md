## ADDED Requirements

### Requirement: PageGenerator DSPy Signature
系统 SHALL 定义 PageGenerator Signature，输入字段为 description（业务页面描述字符串），输出字段为 schema（JSON Schema 字符串）。

#### Scenario: Signature inference
- **WHEN** 向 PageGenerator 传入业务描述
- **THEN** 返回包含 schema 字段的预测结果，值为 JSON 字符串

### Requirement: Composite metric for optimization
DSPy 评估指标 SHALL 综合自动评分和人工评分：自动部分检查 JSON 合法性（0.3）、组件类型白名单（0.3）、必要字段存在性（0.2）；人工部分从 LangSmith 标注拉取（0.2），无标注时默认 0。

#### Scenario: Valid schema scores high
- **WHEN** 预测结果为合法 JSON 且组件类型全在白名单，且含 type="page" 和 components 字段
- **THEN** 自动评分达到 0.8

#### Scenario: Invalid JSON scores zero
- **WHEN** 预测结果无法解析为 JSON
- **THEN** 总评分为 0.0

### Requirement: Prompt export after optimization
优化完成后 SHALL 执行导出流程：将 DSPy 程序保存为版本化 JSON 文件（`prompts/v{timestamp}_dspy_program.json`）；触发一次推理以捕获完整 prompt 文本，保存为版本化文本文件（`prompts/v{timestamp}_prompt_template.txt`）；更新 `prompts/current_prompt.txt` 为最新版本内容。

#### Scenario: Export creates versioned files
- **WHEN** 调用 export_prompt(optimized_program)
- **THEN** prompts/ 目录下新增 v{timestamp}_dspy_program.json 和 v{timestamp}_prompt_template.txt 两个文件

#### Scenario: current_prompt.txt updated
- **WHEN** 导出完成
- **THEN** prompts/current_prompt.txt 内容与最新版本 prompt_template.txt 一致

### Requirement: Training data management
系统 SHALL 提供 load_trainset() 函数从 training_data.json 加载 DSPy Example 对象列表，以及 append_to_training_data() 函数向文件追加新样本。

#### Scenario: Load training set
- **WHEN** 调用 load_trainset()
- **THEN** 返回与 training_data.json 条目数量一致的 dspy.Example 列表，每条 with_inputs("description")
