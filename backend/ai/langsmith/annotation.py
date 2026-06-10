"""LangSmith annotation queue management for a2ui page generation quality evaluation."""
from __future__ import annotations

import os
from functools import lru_cache

QUEUE_NAME = "a2ui页面生成质量评估"


@lru_cache(maxsize=1)
def _get_client():
    from langsmith import Client
    return Client()


def get_or_create_queue() -> str:
    """Returns the annotation queue ID, creating it if it doesn't exist."""
    client = _get_client()
    queues = list(client.list_annotation_queues(name=QUEUE_NAME))
    if queues:
        return str(queues[0].id)
    queue = client.create_annotation_queue(
        name=QUEUE_NAME,
        description="人工评估 a2ui 页面生成质量，标注好/差/需修正",
    )
    return str(queue.id)


def submit_for_review(run_id: str) -> None:
    """Add a generation run to the annotation queue for human review."""
    client = _get_client()
    queue_id = get_or_create_queue()
    client.add_runs_to_annotation_queue(
        queue_id=queue_id,
        run_ids=[run_id],
    )


def fetch_human_score(description: str) -> float:
    """Retrieve human annotation score for a given description from LangSmith.
    Returns 0.2 for positive feedback, 0.0 if not found or negative.
    """
    try:
        client = _get_client()
        project = os.getenv("LANGSMITH_PROJECT", "a2ui-page-generator")
        runs = list(client.list_runs(
            project_name=project,
            filter=f'eq(inputs.description, "{description}")',
            limit=5,
        ))
        if not runs:
            return 0.0
        run = runs[0]
        feedback_items = list(client.list_feedback(run_ids=[str(run.id)]))
        if not feedback_items:
            return 0.0
        scores = [f.score for f in feedback_items if f.score is not None]
        return 0.2 if scores and max(scores) > 0 else 0.0
    except Exception:
        return 0.0
