from datetime import datetime, timezone

from notes.db import get_note, mark_deleted
from shared.api_gateway import extract_path_id, json_response
from shared.logging import log_event


def handler(event, _context):
    note_id, error = extract_path_id(event)
    if error:
        return json_response(400, {"message": error})

    query_params = event.get("queryStringParameters") or {}
    token = query_params.get("token")

    if not token:
        return json_response(400, {"message": "Query parameter 'token' is required."})

    try:
        item = get_note(note_id)
    except Exception as err:  # pylint: disable=broad-except
        log_event("delete_note_read_error", {"id": note_id, "error": str(err)})
        return json_response(500, {"message": "Failed to load gratitude note."})

    if not item or item.get("status") == "deleted":
        return json_response(404, {"message": "Note not found."})

    token_valid = token == item.get("owner_token")
    if not token_valid:
        return json_response(403, {"message": "Invalid token."})

    now_iso = datetime.now(timezone.utc).isoformat()
    try:
        mark_deleted(note_id, now_iso=now_iso)
    except Exception as err:  # pylint: disable=broad-except
        log_event("delete_note_update_error", {"id": note_id, "error": str(err)})
        return json_response(500, {"message": "Failed to delete gratitude note."})

    log_event("delete_note_success", {"id": note_id})
    return json_response(200, {"id": note_id, "deleted": True})

