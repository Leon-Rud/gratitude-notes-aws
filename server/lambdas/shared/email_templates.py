from __future__ import annotations

import html


def build_feedback_email_html(*, feedback_text: str, timestamp: str) -> str:
    escaped_feedback = html.escape(feedback_text)
    return (
        "<!DOCTYPE html>"
        "<html><head>"
        "<meta charset=\"UTF-8\"/>"
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
        "</head>"
        "<body style=\"font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;"
        "background:#f1f5f9;margin:0;padding:24px;\">"
        "<div style=\"max-width:560px;margin:0 auto;background:white;border-radius:12px;"
        "box-shadow:0 10px 30px rgba(15,23,42,0.08);overflow:hidden;\">"
        "<header style=\"background:#1e293b;color:white;padding:20px 24px;\">"
        "<h2 style=\"margin:0;font-size:20px;\">New Feedback</h2>"
        "</header>"
        "<section style=\"padding:24px;\">"
        "<p style=\"margin-top:0;color:#334155;\"><strong>Feedback received:</strong></p>"
        "<div style=\"background:#f8fafc;border-left:4px solid #3b82f6;padding:16px;margin:16px 0;"
        "border-radius:4px;white-space:pre-wrap;color:#1e293b;word-wrap:break-word;\">"
        + escaped_feedback +
        "</div>"
        "<p style=\"margin-top:16px;font-size:12px;color:#64748b;\">Received at: " + timestamp + "</p>"
        "</section></div></body></html>"
    )


