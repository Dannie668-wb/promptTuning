import json
import os
import uuid
import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langsmith import traceable
from .prompt_manager import load_prompt_version

AUTO_QUEUE = os.getenv("AUTO_ANNOTATION_QUEUE", "false").lower() == "true"

router = APIRouter()

DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")


class GenerateRequest(BaseModel):
    description: str


class GenerateResponse(BaseModel):
    bundle: dict
    run_id: str = ""


def build_prompt(description: str) -> str:
    template = load_prompt_version()
    if not template:
        raise HTTPException(status_code=503, detail="No prompt template found. Run DSPy optimization first.")
    return template.replace("{description}", description).replace("__export_trigger__", description)


@traceable(tags=["production"])
async def call_deepseek(prompt: str, temperature: float = 0.2) -> dict:
    async with httpx.AsyncClient(timeout=60) as client:
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

    return json.loads(content)


def _bundle_to_sse_messages(bundle: dict) -> list[str]:
    """Convert a PageBundle dict to the three a2ui SSE messages."""
    surface_id = bundle.get("surfaceId", f"page-{uuid.uuid4().hex[:8]}")
    catalog_id = bundle.get("catalogId", "antd-mobile")
    components = bundle.get("components", [])
    initial_data = bundle.get("initialData", {})

    create_surface = json.dumps({
        "createSurface": {
            "surfaceId": surface_id,
            "catalogId": catalog_id,
        }
    }, ensure_ascii=False)

    update_components = json.dumps({
        "updateComponents": {
            "surfaceId": surface_id,
            "components": components,
        }
    }, ensure_ascii=False)

    update_data = json.dumps({
        "updateDataModel": {
            "surfaceId": surface_id,
            "path": "/",
            "value": initial_data,
        }
    }, ensure_ascii=False)

    return [create_surface, update_components, update_data]


@router.post("/generate", response_model=GenerateResponse)
async def generate_page(req: GenerateRequest):
    try:
        prompt = build_prompt(req.description)
        bundle = await call_deepseek(prompt)
        run_id = ""
        if AUTO_QUEUE:
            try:
                from ai.langsmith.annotation import submit_for_review
                submit_for_review(run_id)
            except Exception:
                pass
        return GenerateResponse(bundle=bundle, run_id=run_id)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=422, detail=f"Model output is not valid JSON: {e}")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"DeepSeek API error: {e.response.status_code}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/generate/stream")
async def generate_page_stream(description: str = Query(..., description="业务页面的中文描述")):
    """Stream a2ui protocol messages (createSurface → updateComponents → updateDataModel → [DONE])."""
    try:
        prompt = build_prompt(description)
    except HTTPException:
        raise

    async def event_generator():
        try:
            bundle = await call_deepseek(prompt)
        except json.JSONDecodeError as e:
            yield f"data: {json.dumps({'error': f'Model output is not valid JSON: {e}'})}\n\n"
            return
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return

        for message in _bundle_to_sse_messages(bundle):
            yield f"data: {message}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
