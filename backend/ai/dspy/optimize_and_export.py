"""
DSPy prompt optimization and export for a2ui page generation.

Usage:
    python -m ai.dspy.optimize_and_export
"""
from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import dspy
from dotenv import load_dotenv

load_dotenv()

TRAINING_DATA_PATH = Path(__file__).parent.parent.parent.parent / "frontend" / "src" / "examples" / "training_data.json"
PROMPTS_DIR = Path(__file__).parent.parent.parent.parent / "prompts"
COMPONENT_CATALOG_PATH = Path(__file__).parent / "component_catalog.txt"
VALID_TYPES_PATH = Path(__file__).parent / "valid_types.json"

VALID_SERVER_EVENTS = {"submit", "navigate", "reset", "checkIn"}
VALID_FUNCTION_CALLS = {"showToast", "openUrl"}


def _load_valid_types() -> set[str]:
    if VALID_TYPES_PATH.exists():
        data = json.loads(VALID_TYPES_PATH.read_text(encoding="utf-8"))
        return set(data.get("types", []))
    return {
        "Page",
        "Input", "Select", "DatePicker", "Radio", "Checkbox", "Switch", "Form", "FormItem",
        "Card", "List", "Cell", "Tag", "Badge", "Image", "Divider",
        "Button", "ActionSheet", "NavBar", "TabBar",
        "Calendar", "CheckInCard", "Progress",
    }


VALID_COMPONENT_TYPES = _load_valid_types()

_CATALOG_TEXT = COMPONENT_CATALOG_PATH.read_text(encoding="utf-8") if COMPONENT_CATALOG_PATH.exists() else ""


# ── 1. DSPy Signature ─────────────────────────────────────────────────────────

class PageGenerator(dspy.Signature):
    """根据业务页面描述，生成符合 a2ui v0.9.1 规范的 PageBundle JSON。"""
    description: str = dspy.InputField(desc="业务页面的中文描述")
    bundle: str = dspy.OutputField(desc="符合 a2ui 规范的 PageBundle JSON 字符串（纯 JSON，不含 ```json``` 代码块）")


PageGenerator.__doc__ = f"""根据业务页面描述，生成符合 a2ui v0.9.1 规范的 PageBundle JSON。

{_CATALOG_TEXT}

输出格式要求（必须严格遵守）：
- 纯 JSON 字符串，不含任何 Markdown 代码块标记（禁止 ```json 等）
- 顶层字段：surfaceId（字符串）、name（字符串）、catalogId="antd-mobile"、components（数组）、initialData（对象，可选）
- components 中必须包含 id="root" 且 component="Page" 的根组件
- 每个节点必须包含：id（字符串）、component（从上方列表选择），props 直接平铺，不用 props:{{}} 包装
- 容器组件的 children 是子组件 id 字符串数组（非嵌套对象）
- 表单组件用 value: {{"path": "/..."}} 替代 onChange 事件
- event handler 格式：{{ "action": {{ "event": {{ "name": "事件名" }} }} }} 或 {{ "action": {{ "functionCall": {{ "call": "函数名", "args": {{...}} }} }} }}
"""


# ── 2. Training data ──────────────────────────────────────────────────────────

def load_trainset() -> list[dspy.Example]:
    raw = json.loads(TRAINING_DATA_PATH.read_text(encoding="utf-8"))
    examples = []
    for item in raw:
        output = item["output"]
        is_valid, errors = _validate_page_bundle(output)
        if not is_valid:
            print(
                f"Warning: training example '{item['input'][:60]}' "
                f"has PageBundle violations: {errors}",
                file=sys.stderr,
            )
        examples.append(
            dspy.Example(
                description=item["input"],
                bundle=json.dumps(output, ensure_ascii=False),
            ).with_inputs("description")
        )
    return examples


# ── 3. Metric ─────────────────────────────────────────────────────────────────

def _validate_action(value: object, path: str) -> list[str]:
    errors: list[str] = []
    if not isinstance(value, dict) or "action" not in value:
        errors.append(f"{path}: event handler must be {{action: {{event|functionCall}}}}")
        return errors
    action = value["action"]
    if not isinstance(action, dict):
        errors.append(f"{path}.action must be an object")
        return errors
    if "event" in action:
        event = action["event"]
        if not isinstance(event, dict) or not isinstance(event.get("name"), str):
            errors.append(f"{path}.action.event.name must be a string")
    elif "functionCall" in action:
        fc = action["functionCall"]
        if not isinstance(fc, dict) or not isinstance(fc.get("call"), str):
            errors.append(f"{path}.action.functionCall.call must be a string")
    else:
        errors.append(f"{path}.action must have 'event' or 'functionCall'")
    return errors


def _validate_page_bundle(bundle: dict) -> tuple[bool, list[str]]:
    """Validate a PageBundle dict. Returns (is_valid, errors)."""
    errors: list[str] = []

    for field in ("surfaceId", "name", "catalogId"):
        if not isinstance(bundle.get(field), str) or not bundle[field]:
            errors.append(f"missing or invalid field: '{field}'")

    if not isinstance(bundle.get("components"), list):
        errors.append("components must be an array")
        return False, errors

    components: list[dict] = bundle["components"]

    for i, node in enumerate(components):
        loc = f"components[{i}]"
        if not isinstance(node, dict):
            errors.append(f"{loc}: must be an object")
            continue
        if not isinstance(node.get("id"), str) or not node["id"]:
            errors.append(f"{loc}: id must be a non-empty string")
        comp = node.get("component")
        if not isinstance(comp, str) or not comp:
            errors.append(f"{loc}: component must be a non-empty string")
        elif comp not in VALID_COMPONENT_TYPES:
            errors.append(f"{loc}: unknown component '{comp}'")

        if "children" in node:
            ch = node["children"]
            if not isinstance(ch, list) or any(not isinstance(c, str) for c in ch):
                errors.append(f"{loc}.children: must be an array of id strings")

        if "value" in node:
            v = node["value"]
            if isinstance(v, dict) and "path" in v:
                if not isinstance(v["path"], str) or not v["path"].startswith("/"):
                    errors.append(f"{loc}.value.path must start with '/' (JSON Pointer)")

        for key, val in node.items():
            if key.startswith("on") and len(key) > 2:
                errors.extend(_validate_action(val, f"{loc}.{key}"))

    # Root component check
    ids = {c["id"] for c in components if isinstance(c, dict)}
    root = next((c for c in components if isinstance(c, dict) and c.get("id") == "root"), None)
    if root is None:
        errors.append("components must contain a component with id='root'")
    elif root.get("component") != "Page":
        errors.append(f"root component must have component='Page', got '{root.get('component')}'")

    # Children reference check
    for c in components:
        if not isinstance(c, dict):
            continue
        for child_id in (c.get("children") or []):
            if isinstance(child_id, str) and child_id not in ids:
                errors.append(f"Component '{c.get('id')}' references unknown child id '{child_id}'")

    if "initialData" in bundle and not isinstance(bundle["initialData"], dict):
        errors.append("initialData must be an object")

    return len(errors) == 0, errors


def _fetch_human_score(description: str) -> float:
    """Pull human annotation score from LangSmith. Returns 0.0 if unavailable."""
    try:
        from langsmith import Client
        client = Client()
        runs = list(client.list_runs(project_name=os.getenv("LANGSMITH_PROJECT", "a2ui-page-generator"), filter=f'eq(input.description, "{description}")'))
        if not runs:
            return 0.0
        run = runs[0]
        feedback = list(client.list_feedback(run_ids=[str(run.id)]))
        if not feedback:
            return 0.0
        scores = [f.score for f in feedback if f.score is not None]
        return 0.2 if scores and scores[0] > 0 else 0.0
    except Exception:
        return 0.0


def schema_metric(example: dspy.Example, prediction: dspy.Prediction, trace=None) -> float:
    try:
        bundle = json.loads(prediction.bundle)
    except (json.JSONDecodeError, AttributeError):
        return 0.0

    score = 0.2  # valid JSON

    is_valid, errors = _validate_page_bundle(bundle)
    if is_valid:
        score += 0.6  # full PageBundle compliance
    else:
        score += max(0.0, 0.6 - len(errors) * 0.1)

    score += _fetch_human_score(example.description)
    return min(score, 1.0)


# ── 4. Optimize ───────────────────────────────────────────────────────────────

def optimize() -> dspy.Predict:
    deepseek = dspy.LM(
        model="openai/deepseek-chat",
        api_base="https://api.deepseek.com",
        api_key=os.getenv("DEEPSEEK_API_KEY", ""),
        temperature=0.2,
    )
    dspy.configure(lm=deepseek)

    program = dspy.Predict(PageGenerator)
    teleprompter = dspy.BootstrapFewShot(
        metric=schema_metric,
        max_bootstrapped_demos=3,
        max_labeled_demos=5,
    )
    trainset = load_trainset()
    optimized = teleprompter.compile(program, trainset=trainset)
    return optimized


# ── 5. Export ─────────────────────────────────────────────────────────────────

def export_prompt(optimized_program: dspy.Predict) -> str:
    PROMPTS_DIR.mkdir(exist_ok=True)
    version = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")

    dspy_path = PROMPTS_DIR / f"{version}_dspy_program.json"
    optimized_program.save(str(dspy_path))

    try:
        optimized_program(description="__export_trigger__")
        history = dspy.inspect_history(n=1)
    except Exception:
        history = str(optimized_program.predict.extended_signature if hasattr(optimized_program, "predict") else "")

    prompt_path = PROMPTS_DIR / f"{version}_prompt_template.txt"
    prompt_path.write_text(history, encoding="utf-8")

    current_path = PROMPTS_DIR / "current_prompt.txt"
    current_path.write_text(history, encoding="utf-8")

    print(f"Exported: {prompt_path}")
    return str(prompt_path)


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Loading training data...")
    trainset = load_trainset()
    print(f"  {len(trainset)} examples loaded")

    print("Running DSPy optimization...")
    optimized = optimize()

    print("Exporting prompt...")
    path = export_prompt(optimized)
    print(f"Done. Prompt saved to: {path}")
