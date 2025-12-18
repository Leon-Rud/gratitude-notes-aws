import json

from notes.db import get_note
from notes.service import serialize_note_item
from shared.api_gateway import extract_path_id, json_response
from shared.logging import log_event


def handler(event, _context):
    note_id, error = extract_path_id(event)
    if error:
        return json_response(400, {"message": error})

    try:
        item = get_note(note_id)
    except Exception as err:  # pylint: disable=broad-except
        log_event("get_note_error", {"id": note_id, "error": str(err)})
        return json_response(500, {"message": "Failed to load gratitude note."})

    if not item or item.get("status") == "deleted":
        return json_response(404, {"message": "Note not found."})

    response = serialize_note_item(item)
    log_event("get_note_success", {"id": note_id})
    return json_response(200, response)

