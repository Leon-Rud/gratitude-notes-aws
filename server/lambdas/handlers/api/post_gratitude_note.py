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


def _publish_created_event(note: dict) -> None:
    """
    Publish a gratitude.note.created event to EventBridge.
    This event will be used by future features (e.g., streak tracking).
    """
    detail = {
        "eventType": "note.created",
        "noteId": note["id"],
        "noteItems": note.get("note_items", []),
    }
    try:
        EVENTS.put_events(
            Entries=[
                {
                    "Source": "gratitude.note",
                    "DetailType": "gratitude.note.created",
                    "Detail": json.dumps(detail),
                    "EventBusName": EVENT_BUS_NAME,
                }
            ]
        )
        log_event("post_note_event_emitted", {"noteId": note["id"], "detailType": "gratitude.note.created"})
    except Exception as err:  # pylint: disable=broad-except
        log_event(
            "post_note_event_error",
            {"noteId": note["id"], "detailType": "gratitude.note.created", "error": str(err)},
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
    _publish_created_event(item)

    return json_response(201 if created else 200, {"id": item["id"], "owner_token": item.get("owner_token")})

