"""
Core note domain logic: normalize input, build note items, serialization, TTL helpers.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from shared.logging import log_event


def ttl_in_seconds(days: int) -> int:
    return int((datetime.now(timezone.utc) + timedelta(days=days)).timestamp())


def normalize_note_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize note payload: trim name/email, split gratitudeText by newlines.
    Frontend validates all fields before sending.
    """

    gratitude_text = payload["gratitudeText"]
    note_items = []
    for line in gratitude_text.splitlines():
        if line.strip():
            note_items.append(line.strip())

    return { 
        "name": payload["name"].strip(), 
        "email": payload["email"].strip().lower(), 
        "note_items": note_items,
    }



def build_note_item(normalized: Dict[str, Any]) -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    note_id = uuid.uuid4().hex
    owner_token = uuid.uuid4().hex

    return {
        "id": note_id,
        "name": normalized["name"],
        "email": normalized["email"],
        "note_items": normalized["note_items"],
        "status": "active",
        "date": now.strftime("%Y-%m-%d"),
        "created_at": int(now.timestamp()),
        "created_at_iso": now.isoformat(),
        "owner_token": owner_token,
        "ttl": ttl_in_seconds(7),
    }


def serialize_note_item(item: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": item.get("id"),
        "name": item.get("name"),
        "email": item.get("email"),
        "note_items": item.get("note_items", []),
        "status": item.get("status"),
        "created_at": item.get("created_at_iso") or item.get("created_at"),
    }

