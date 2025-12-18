"""
Core note domain logic: normalize input, build note items, serialization, TTL helpers.
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

from shared.logging import log_event
from .validation import is_valid_email, parse_note_text


def ttl_in_seconds(days: int) -> int:
    return int((datetime.now(timezone.utc) + timedelta(days=days)).timestamp())


def _ensure_payload_dict(payload: Any) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    if not isinstance(payload, dict):
        return None, "Body must be a JSON object."
    return payload, None


def _extract_name(payload: Dict[str, Any]) -> Tuple[Optional[str], Optional[str]]:
    name = payload.get("name")
    if not isinstance(name, str) or not name.strip():
        return None, "Field 'name' is required."
    return name.strip(), None


def _extract_email(payload: Dict[str, Any]) -> Tuple[Optional[str], Optional[str]]:
    email = payload.get("email")
    if not is_valid_email(email or ""):
        return None, "Field 'email' must be a valid email address."
    return email.strip().lower(), None


def _extract_note_items(payload: Dict[str, Any]) -> Tuple[Optional[List[str]], Optional[str]]:
    text_field = payload.get("gratitudeText")

    if text_field is None:
        return None, "Field 'gratitudeText' must be provided (one item per line)."

    items, err = parse_note_text(text_field)
    if err:
        return None, err
    return items, None


def normalize_note_payload(payload: Any) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    payload_dict, err = _ensure_payload_dict(payload)
    if err:
        return None, err

    name, err = _extract_name(payload_dict)
    if err:
        return None, err

    email, err = _extract_email(payload_dict)
    if err:
        return None, err

    items, err = _extract_note_items(payload_dict)
    if err:
        return None, err

    return {
        "name": name,
        "email": email,
        "note_items": items,
    }, None


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

