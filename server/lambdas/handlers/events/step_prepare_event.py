import json
from typing import Any, Dict

from shared.logging import log_event


def handler(event: Dict[str, Any], _context) -> Dict[str, Any]:
    """
    Step Function task that prepares events for processing.
    
    Handles both archive.nightly (from Scheduler) and note.created (from EventBridge rule).
    Normalizes event payloads from different sources into a consistent format.
    """
    if not isinstance(event, dict):
        raise ValueError("Event payload must be an object.")

    # Handle EventBridge event structure: event comes with "detail" containing JSON string
    # OR direct input from Scheduler: event has "eventType" directly
    event_type = None
    detail_data = {}

    # Check if this is an EventBridge event (has "detail" key with JSON string)
    if "detail" in event:
        try:
            # EventBridge passes detail as JSON string, parse it
            if isinstance(event["detail"], str):
                detail_data = json.loads(event["detail"])
            else:
                detail_data = event["detail"]
            event_type = detail_data.get("eventType")
        except (json.JSONDecodeError, TypeError) as err:
            log_event("step_prepare_event_parse_error", {"error": str(err), "detail": str(event.get("detail"))})
            raise ValueError(f"Failed to parse event detail: {err}")

    # Fallback: direct input (e.g., from Scheduler)
    if not event_type:
        event_type = event.get("eventType")

    if not event_type:
        raise ValueError("Event must contain 'eventType' either directly or in 'detail' JSON.")

    # Supported event types
    supported_types = ["archive.nightly", "note.created", "note.updated", "note.deleted"]
    if event_type not in supported_types:
        raise ValueError(f"Unsupported event type: {event_type}. Supported: {supported_types}")

    # Build normalized event
    normalized = {"eventType": event_type}

    # For note lifecycle events, include noteId and other fields from detail
    if event_type in ["note.created", "note.updated"]:
        normalized["noteId"] = detail_data.get("noteId")
        if "gratitudeText" in detail_data:
            normalized["gratitudeText"] = detail_data["gratitudeText"]
    elif event_type == "note.deleted":
        # For deleted events, only include noteId (no gratitudeText needed)
        normalized["noteId"] = detail_data.get("noteId")

    log_event("step_prepare_event", {"eventType": event_type, "normalized": normalized})
    return normalized

