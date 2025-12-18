import json
from datetime import datetime, timezone
from typing import Any, Dict

from shared.api_gateway import json_response, load_json_body
from shared.config import SENDER_EMAIL, ses_client
from shared.email_templates import build_feedback_email_html
from shared.logging import log_event

SES = ses_client()

def handler(event: Dict[str, Any], _context) -> Dict[str, Any]:
    body = load_json_body(event)

    feedback_text = body.get("feedback", "").strip()
    if not feedback_text:
        return json_response(400, {"message": "Feedback text is required."})

    if not SENDER_EMAIL:
        return json_response(500, {"message": "Sender email is not configured."})

    recipient_email = SENDER_EMAIL
    now = datetime.now(timezone.utc)
    timestamp = now.strftime("%Y-%m-%d %H:%M:%S UTC")

    html = build_feedback_email_html(feedback_text=feedback_text, timestamp=timestamp)

    try:
        SES.send_email(
            Source=SENDER_EMAIL,
            Destination={"ToAddresses": [recipient_email]},
            ReplyToAddresses=[SENDER_EMAIL],
            Message={
                "Subject": {"Data": "New Feedback - Gratitude Board", "Charset": "UTF-8"},
                "Body": {
                    "Html": {"Data": html, "Charset": "UTF-8"},
                    "Text": {
                        "Data": f"New Feedback - Gratitude Board\n\n{feedback_text}\n\nReceived at: {timestamp}",
                        "Charset": "UTF-8",
                    },
                },
            },
        )
    except Exception as err:  # pylint: disable=broad-except
        # minimal logging: don't log feedback body
        log_event("email_feedback_send_error", {"error": str(err)})
        return json_response(500, {"message": f"Failed to send feedback email: {err}"})

    return json_response(200, {"message": "Feedback submitted successfully. Thank you!"})


