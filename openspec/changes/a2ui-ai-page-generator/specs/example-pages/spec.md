## ADDED Requirements

### Requirement: Three example page schemas
系统 SHALL 提供三个示例页面的 JSON Schema 文件，分别为：表单页（用户信息编辑，含姓名/手机号/生日输入）、详情页（订单详情展示，含状态/金额/商品列表）、打卡页（每日打卡，含今日状态/历史记录/打卡按钮）。

#### Scenario: Form page schema validity
- **WHEN** 加载 form-page.json
- **THEN** Schema 通过 JSON 合法性校验且所有 type 字段均在 Registry 白名单中

#### Scenario: Detail page schema validity
- **WHEN** 加载 detail-page.json
- **THEN** Schema 通过 JSON 合法性校验且所有 type 字段均在 Registry 白名单中

#### Scenario: Check-in page schema validity
- **WHEN** 加载 checkin-page.json
- **THEN** Schema 通过 JSON 合法性校验且所有 type 字段均在 Registry 白名单中

### Requirement: Training data file
系统 SHALL 维护 `src/examples/training_data.json`，存储用于 DSPy 训练的输入/输出对，初始包含三个示例页面的业务描述和对应 Schema，支持持续追加。

#### Scenario: Training data format
- **WHEN** 读取 training_data.json
- **THEN** 每个条目包含 input（业务描述字符串）、output（页面 Schema 对象）、source（来源标记）、timestamp 字段

#### Scenario: Append new example
- **WHEN** Playground 保存人工修正的样本
- **THEN** 新条目追加到 training_data.json 末尾，不覆盖已有数据
