import json
import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langsmith import Client as LangSmithClient, traceable
from .prompt_manager import load_prompt_version, save_prompt_version, list_versions
from pathlib import Path

router = APIRouter()

DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
TRAINING_DATA_PATH = Path(__file__).parent.parent.parent / "frontend" / "src" / "examples" / "training_data.json"


class PlaygroundTestRequest(BaseModel):
    description: str
    custom_prompt: str | None = None
    version: str | None = None
    temperature: float = 0.2
    n_samples: int = 1


class SaveExampleRequest(BaseModel):
    description: str
    corrected_bundle: dict
    run_id: str = ""


class SaveVersionRequest(BaseModel):
    prompt_text: str


@traceable(tags=["playground"])
async def call_deepseek_playground(prompt: str, temperature: float, n: int) -> list[dict]:
    results = []
    async with httpx.AsyncClient(timeout=60) as client:
        for _ in range(n):
            resp = await client.post(
                DEEPSEEK_API_URL,
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": temperature,
                },
                headers={"Authorization": f"Bearer {DEEPSEEK_API_KEY}"},
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            results.append(json.loads(content))
    return results


@router.post("/playground/test")
async def playground_test(req: PlaygroundTestRequest):
    if req.custom_prompt:
        prompt_text = req.custom_prompt
    else:
        prompt_text = load_prompt_version(req.version)
        if not prompt_text:
            raise HTTPException(status_code=503, detail="No prompt found for the specified version.")

    prompt = prompt_text.replace("{description}", req.description).replace("__export_trigger__", req.description)

    try:
        bundles = await call_deepseek_playground(prompt, req.temperature, req.n_samples)
        return {"bundles": bundles, "run_id": ""}
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=422, detail=f"Model output is not valid JSON: {e}")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"DeepSeek API error: {e.response.status_code}")


@router.post("/playground/save-example")
async def save_example(req: SaveExampleRequest):
    data: list = []
    if TRAINING_DATA_PATH.exists():
        data = json.loads(TRAINING_DATA_PATH.read_text(encoding="utf-8"))

    from datetime import datetime, timezone
    data.append({
        "input": req.description,
        "output": req.corrected_bundle,
        "source": "playground_correction",
        "run_id": req.run_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    TRAINING_DATA_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"message": "已保存，可重新运行 DSPy 优化"}


@router.post("/playground/save-version")
async def save_version(req: SaveVersionRequest):
    version = save_prompt_version(req.prompt_text)
    return {"version": version, "message": "版本已保存并设为当前版本"}


@router.get("/playground/versions")
async def get_versions():
    return {"versions": list_versions()}
