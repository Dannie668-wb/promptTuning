## ADDED Requirements

### Requirement: POST /generate endpoint
FastAPI SHALL 提供 POST /generate 端点，接受 `{ "description": string }` 请求体，加载 `prompts/current_prompt.txt`，调用 DeepSeek V4 API，返回 `{ "schema": object, "run_id": string }`。

#### Scenario: Successful generation
- **WHEN** 发送 POST /generate with description "用户信息编辑表单"
- **THEN** 返回 200，body 包含合法的页面 Schema 对象和 LangSmith run_id

#### Scenario: DeepSeek API error
- **WHEN** DeepSeek API 调用失败或超时
- **THEN** 返回 502，body 包含错误描述

### Requirement: Hot reload current prompt
FastAPI 启动时 SHALL 加载 `prompts/current_prompt.txt`，该文件更新后下一次请求 SHALL 读取最新内容，无需重启服务。

#### Scenario: Prompt hot reload
- **WHEN** current_prompt.txt 文件内容被更新后发起新的生成请求
- **THEN** 新请求使用更新后的 prompt 文本

### Requirement: POST /playground/test endpoint
SHALL 提供 POST /playground/test 端点，支持 `{ "description", "custom_prompt"?, "version"?, "temperature", "n_samples" }` 请求体，返回多次生成结果供对比。

#### Scenario: Custom prompt test
- **WHEN** 请求体包含 custom_prompt 字段
- **THEN** 使用 custom_prompt 而非 current_prompt.txt 调用 DeepSeek

### Requirement: POST /playground/save-example endpoint
SHALL 提供 POST /playground/save-example 端点，接受 `{ "description", "corrected_schema", "run_id" }` 请求体，将修正后的样本追加到 training_data.json。

#### Scenario: Save corrected example
- **WHEN** 发送 POST /playground/save-example with 修正后的 schema
- **THEN** training_data.json 新增一条 source="playground_correction" 的记录

### Requirement: POST /playground/save-version endpoint
SHALL 提供 POST /playground/save-version 端点，接受 `{ "prompt_text" }` 请求体，保存为版本化文件并更新 current_prompt.txt。

#### Scenario: Save and activate prompt version
- **WHEN** 发送 POST /playground/save-version with prompt_text
- **THEN** 新版本文件创建，current_prompt.txt 更新，后续生成请求使用新 prompt
