import json
from datetime import datetime, timezone

from notes.db import create_or_update_note
from shared.config import EVENT_BUS_NAME, events_client
from shared.api_gateway import json_response, load_json_body
from shared.logging import log_event

EVENTS = events_client()


def _publish_note_event(note: dict, event_type: str) -> None:
    """
    Publish a note lifecycle event (note.created or note.updated) to EventBridge.
    This event will be used for observability and future features (e.g., streak tracking).
    """
    detail = {
        "eventType": event_type,
        "noteId": note["id"],
        "gratitudeText": note.get("gratitude_text", ""),
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


def handler(event: dict, _context: object) -> dict:
    """Create or update a gratitude note."""
    body = load_json_body(event)
    
    # Normalize payload: trim name/email, map gratitudeText to gratitude_text
    normalized = {
        "name": body["name"].strip(),
        "email": body["email"].strip().lower(),
        "gratitude_text": body["gratitudeText"],
    }

    now = datetime.now(timezone.utc)
    date_str = now.date().isoformat()
    note_id = body.get("id")  # Optional ID for editing

    try:
        item, created = create_or_update_note(
            normalized,
            date_str=date_str,
            now_iso=now.isoformat(),
            note_id=note_id,
        )
    except ValueError as err:
        # Note not found or deleted
        log_event("put_note_not_found", {"id": note_id, "error": str(err)})
        return json_response(404, {"message": str(err)})
    except Exception as err:  # pylint: disable=broad-except
        log_event("put_note_store_failed", {"error": str(err)})
        return json_response(500, {"message": "Failed to save gratitude note."})

    log_event("put_note_created" if created else "put_note_replaced", {"id": item["id"]})
    
    # Emit appropriate event based on whether note was created or updated
    event_type = "note.created" if created else "note.updated"
    _publish_note_event(item, event_type)

    return json_response(201 if created else 200, {"id": item["id"], "owner_token": item.get("owner_token")})

