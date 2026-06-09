## ADDED Requirements

### Requirement: Trace every generation call
每次调用 DeepSeek V4 生成页面 Schema 时，系统 SHALL 通过 LangSmith 追踪该调用，记录输入描述、输出 Schema、模型参数、token 用量，并附加 source 标签（"production" 或 "playground"）。

#### Scenario: Production trace recorded
- **WHEN** /generate 端点被调用并返回结果
- **THEN** LangSmith 中新增一条 run 记录，包含输入描述和输出 Schema

### Requirement: Annotation queue for human review
系统 SHALL 维护 LangSmith Annotation Queue "a2ui页面生成质量评估"，支持将生成的 run 加入队列，供人工评审打分（好/差/需修正）。

#### Scenario: Add run to queue
- **WHEN** 调用 submit_for_review(run_id)
- **THEN** 对应 run 出现在 LangSmith Annotation Queue 中，等待人工评审

### Requirement: Retrieve human scores for DSPy metric
系统 SHALL 提供 fetch_human_score(description) 函数，根据业务描述从 LangSmith 标注中检索对应 run 的人工评分，用于 DSPy metric 计算。

#### Scenario: Human score available
- **WHEN** 该描述对应的 run 已有人工标注（好=0.2，差=0）
- **THEN** fetch_human_score 返回对应分值

#### Scenario: No human annotation
- **WHEN** 该描述对应的 run 尚未被人工标注
- **THEN** fetch_human_score 返回 0，不影响自动评分
