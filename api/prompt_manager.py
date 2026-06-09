from pathlib import Path
from datetime import datetime

PROMPTS_DIR = Path(__file__).parent.parent.parent / "prompts"


def ensure_prompts_dir():
    PROMPTS_DIR.mkdir(exist_ok=True)


def load_prompt_version(version: str | None = None) -> str:
    ensure_prompts_dir()
    if version:
        path = PROMPTS_DIR / f"{version}_prompt_template.txt"
    else:
        path = PROMPTS_DIR / "current_prompt.txt"
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def update_current_prompt(prompt_text: str) -> None:
    ensure_prompts_dir()
    (PROMPTS_DIR / "current_prompt.txt").write_text(prompt_text, encoding="utf-8")


def save_prompt_version(prompt_text: str) -> str:
    ensure_prompts_dir()
    version = datetime.now().strftime("%Y%m%d_%H%M%S")
    (PROMPTS_DIR / f"{version}_prompt_template.txt").write_text(prompt_text, encoding="utf-8")
    update_current_prompt(prompt_text)
    return version


def list_versions() -> list[dict]:
    ensure_prompts_dir()
    files = sorted(
        PROMPTS_DIR.glob("*_prompt_template.txt"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    return [
        {"version": p.stem.replace("_prompt_template", ""), "path": str(p)}
        for p in files
    ]
