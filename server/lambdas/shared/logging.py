"""
Logger setup + minimal structured logging helpers.

Rules:
- Log only what's needed (errors + key events)
- Do not log secrets/PII (email addresses, tokens)
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict

logger = logging.getLogger()
if not logger.handlers:
    logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.INFO)


_REDACT_KEYS = {
    "email",
    "recipient",
    "to",
    "token",
    "owner_token",
    "authorization",
    "cookie",
}


def _scrub(value: Any) -> Any:
    if isinstance(value, dict):
        out: Dict[str, Any] = {}
        for k, v in value.items():
            if isinstance(k, str) and k.lower() in _REDACT_KEYS:
                out[k] = "[redacted]"
            else:
                out[k] = _scrub(v)
        return out
    if isinstance(value, list):
        return [_scrub(v) for v in value]
    return value


def log_event(action: str, data: Dict[str, Any] | None = None) -> None:
    payload: Dict[str, Any] = {"action": action}
    if data:
        payload.update(_scrub(data))
    logger.info(json.dumps(payload))

