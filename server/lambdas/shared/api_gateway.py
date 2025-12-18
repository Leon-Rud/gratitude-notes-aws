"""
HTTP helpers: CORS headers and JSON responses.
"""
import json
from typing import Any, Dict, Tuple

HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,POST,DELETE",
}


def json_response(status_code: int, body: Any) -> Dict[str, Any]:
    return {
        "statusCode": status_code,
        "headers": HEADERS,
        "body": json.dumps(body),
    }


def load_json_body(event) -> Dict[str, Any]:
    try:
        return json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return {}


def extract_path_id(event) -> Tuple[str, str]:
    value = (event.get("pathParameters") or {}).get("id")
    if not isinstance(value, str):
        return "", "Path parameter 'id' is required."

    note_id = value.strip()
    if not note_id:
        return "", "Path parameter 'id' must be a non-empty string."
    if len(note_id) > 64:
        return "", "Path parameter 'id' is too long."
    return note_id, ""

