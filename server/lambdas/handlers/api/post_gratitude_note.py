import json
import os
from datetime import datetime, timezone

from notes.db import put_note, find_note_for_day, update_note_items
from notes.service import build_note_item, normalize_note_payload
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

    # Enforce one note per email per day
    if not ALLOW_MULTIPLE_NOTES_PER_DAY:
        existing = find_note_for_day(normalized["email"], date_str)
        if existing:
            # Replace (overwrite) instead of 409: enables "edit" behavior with the same POST endpoint.
            # Keep the same id and owner_token.
            existing_item = existing[0]
            now_iso = now.isoformat()
            try:
                update_note_items(existing_item["id"], normalized["note_items"], now_iso=now_iso)
            except Exception as err:  # pylint: disable=broad-except
                log_event("update_note_items_failed", {"id": existing_item.get("id"), "error": str(err)})
                return json_response(500, {"message": "Failed to update gratitude note."})

            log_event("put_note_replaced", {"id": existing_item["id"]})
            _publish_created_event({**existing_item, "note_items": normalized["note_items"]})
            return json_response(200, {"id": existing_item["id"], "owner_token": existing_item.get("owner_token")})

    item = build_note_item(normalized)
    item["date"] = date_str

    try:
        put_note(item)
    except Exception as err:  # pylint: disable=broad-except
        log_event("put_note_store_failed", {"id": item["id"], "error": str(err)})
        return json_response(500, {"message": "Failed to save gratitude note."})

    # Minimal logging: do not log emails/tokens
    log_event("put_note_created", {"id": item["id"]})
    _publish_created_event(item)

    # Return owner_token so the client can store it and later delete the note securely.
    # Do not log this token anywhere.
    return json_response(201, {"id": item["id"], "owner_token": item.get("owner_token")})

