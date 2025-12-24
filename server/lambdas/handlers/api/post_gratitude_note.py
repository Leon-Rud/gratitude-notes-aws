import json
import os
from datetime import datetime, timezone

from notes.db import create_or_replace_note
from notes.service import normalize_note_payload
from shared.config import EVENT_BUS_NAME, events_client
from shared.api_gateway import json_response, load_json_body
from shared.logging import log_event

EVENTS = events_client()

# Local testing escape hatch:
# Set ALLOW_MULTIPLE_NOTES_PER_DAY=true when running locally to bypass the "one per day" rule.
# TODO: Remove this bypass before production deploy.
ALLOW_MULTIPLE_NOTES_PER_DAY = os.environ.get("ALLOW_MULTIPLE_NOTES_PER_DAY", "").lower() == "true"


def _publish_note_event(note: dict, event_type: str) -> None:
    """
    Publish a note lifecycle event (note.created or note.updated) to EventBridge.
    This event will be used for observability and future features (e.g., streak tracking).
    """
    detail = {
        "eventType": event_type,
        "noteId": note["id"],
        "noteItems": note.get("note_items", []),
    }
    
    detail_type_map = {
        "note.created": "gratitude.note.created",
        "note.updated": "gratitude.note.updated",
    }
    
    detail_type = detail_type_map.get(event_type)
    if not detail_type:
        log_event("post_note_event_invalid_type", {"eventType": event_type, "noteId": note["id"]})
        return
    
    try:
        EVENTS.put_events(
            Entries=[
                {
                    "Source": "gratitude.note",
                    "DetailType": detail_type,
                    "Detail": json.dumps(detail),
                    "EventBusName": EVENT_BUS_NAME,
                }
            ]
        )
        log_event("post_note_event_emitted", {"noteId": note["id"], "detailType": detail_type, "eventType": event_type})
    except Exception as err:  # pylint: disable=broad-except
        log_event(
            "post_note_event_error",
            {"noteId": note["id"], "detailType": detail_type, "eventType": event_type, "error": str(err)},
        )


def handler(event, _context):
    body = load_json_body(event)
    normalized, error = normalize_note_payload(body)
    if error:
        return json_response(400, {"message": error})

    now = datetime.now(timezone.utc)
    date_str = now.date().isoformat()

    try:
        item, created = create_or_replace_note(
            normalized,
            date_str=date_str,
            now_iso=now.isoformat(),
            allow_multiple_per_day=ALLOW_MULTIPLE_NOTES_PER_DAY,
        )
    except Exception as err:  # pylint: disable=broad-except
        log_event("put_note_store_failed", {"error": str(err)})
        return json_response(500, {"message": "Failed to save gratitude note."})

    log_event("put_note_created" if created else "put_note_replaced", {"id": item["id"]})
    
    # Emit appropriate event based on whether note was created or updated
    event_type = "note.created" if created else "note.updated"
    _publish_note_event(item, event_type)

    return json_response(201 if created else 200, {"id": item["id"], "owner_token": item.get("owner_token")})

