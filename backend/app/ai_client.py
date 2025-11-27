import os
from typing import List, Dict, Any

from fastapi import HTTPException, status
from openai import OpenAI


def _get_client() -> OpenAI:
    api_key = os.getenv("ARK_API_KEY")
    if not api_key:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Missing ARK_API_KEY for AI assistant")
    base_url = os.getenv("AI_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
    return OpenAI(base_url=base_url, api_key=api_key)


def chat(messages: List[Dict[str, Any]], model: str | None = None) -> str:
    client = _get_client()
    model_id = model or os.getenv("AI_MODEL", "doubao-seed-code-preview-251028")
    try:
        resp = client.chat.completions.create(model=model_id, messages=messages)
        return resp.choices[0].message.content or ""
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"AI request failed: {exc}") from exc
