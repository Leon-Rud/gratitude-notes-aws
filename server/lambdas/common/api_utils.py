import json

from .customer_id_helpers import sanitize_customer_id

HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT,DELETE",
}


def json_response(status_code: int, body) -> dict:
    """Return a JSON serializable API Gateway response with shared headers."""
    return {
        "statusCode": status_code,
        "headers": HEADERS,
        "body": json.dumps(body),
    }


def extract_path_customer_id(event, *, param_name: str = "id"):
    """Pull and validate a customer ID from API Gateway path parameters."""
    customer_id = (event.get("pathParameters") or {}).get(param_name)
    normalized, error = sanitize_customer_id(
        customer_id,
        missing_message=f"Path parameter '{param_name}' is required.",
        length_message=f"Path parameter '{param_name}' must be 3 to 100 characters.",
    )
    if error:
        return None, error
    return normalized, None
