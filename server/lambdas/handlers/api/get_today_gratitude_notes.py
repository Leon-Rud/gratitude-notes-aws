from datetime import datetime, timezone
from typing import Any, Dict, List

from notes.db import list_notes_for_date
from shared.api_gateway import json_response
from shared.logging import log_event


def _public_fields(item: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": item.get("id"),
        "name": item.get("name"),
        "email": item.get("email"),
        "gratitude_text": item.get("gratitude_text", ""),
        "status": item.get("status"),
        "created_at": item.get("created_at_iso") or item.get("created_at"),
    }


def handler(event, _context):
    try:
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        response_items = list_notes_for_date(date_str)

        items: List[Dict[str, Any]] = []
        for it in response_items:
            if it.get("status") == "deleted":
                continue
            items.append(_public_fields(it))

        return json_response(200, {"items": items})
    except Exception as e:
        log_event("get_today_notes_error", {"error": str(e)})
        return json_response(500, {"message": f"Error: {str(e)}"})

