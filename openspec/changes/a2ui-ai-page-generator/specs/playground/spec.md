## ADDED Requirements

### Requirement: Playground page layout
Playground SHALL 呈现左右两栏布局：左侧为提示词编辑区（版本选择下拉 + 可编辑 prompt 文本框 + few-shot 示例列表 + 保存按钮），右侧为测试区（描述输入框 + 参数配置 + 生成结果展示）。

#### Scenario: Playground loads current version
- **WHEN** 用户打开 Playground 页面
- **THEN** 左侧自动加载 current_prompt.txt 内容，版本选择器显示"当前版本"

### Requirement: Generate and preview result
用户 SHALL 能在右侧输入业务描述，点击"生成"后通过 /playground/test 调用后端，结果以 JSON Schema 和真实交互预览两种视图并排展示。

#### Scenario: Generate and render
- **WHEN** 用户输入描述并点击生成
- **THEN** 右侧显示生成的 JSON Schema 文本和对应的真实交互页面渲染

#### Scenario: Generation error display
- **WHEN** 后端返回错误
- **THEN** 右侧显示错误信息，不崩溃

### Requirement: A/B comparison mode
Playground SHALL 支持 A/B 对比模式，选择两个不同 prompt 版本后，同一描述同时调用两个版本，结果左右并排展示，每侧均有"选择此版本"按钮。

#### Scenario: Side-by-side comparison
- **WHEN** 用户选择两个不同版本并点击"对比生成"
- **THEN** 两侧同时显示各自生成结果的预览和 Schema

#### Scenario: Select winner
- **WHEN** 用户点击某侧"选择此版本"
- **THEN** 对应版本被设为 current，调用 /playground/save-version

### Requirement: Human annotation in playground
用户 SHALL 能对生成结果打分（好/差/需修正），打分通过 LangSmith SDK 提交至 Annotation Queue；选择"需修正"时弹出 Schema 编辑框，修正完成后点击"保存样本"调用 /playground/save-example。

#### Scenario: Rate as good
- **WHEN** 用户点击"好"
- **THEN** LangSmith 对应 run 新增正向标注

#### Scenario: Correct and save
- **WHEN** 用户点击"需修正"，编辑 Schema 后点击"保存样本"
- **THEN** 修正后的 input/output 对追加到 training_data.json

### Requirement: Prompt version history
Playground 版本选择器 SHALL 列出 prompts/ 目录下所有版本文件，按时间倒序排列，显示版本时间戳。

#### Scenario: Version list loads
- **WHEN** 用户打开版本选择下拉
- **THEN** 显示所有历史版本，最新版本排在最前
