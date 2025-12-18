"""
Validation helpers for gratitude notes.
"""
import re
from typing import List, Optional, Tuple

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def is_valid_email(email: str) -> bool:
    return isinstance(email, str) and bool(EMAIL_RE.match(email.strip()))


def parse_note_text(note_text: str) -> Tuple[Optional[List[str]], Optional[str]]:
    if not isinstance(note_text, str):
        return None, "Field 'gratitudeText' must be a string."

    lines = [line.strip() for line in note_text.splitlines()]
    items = [line for line in lines if line]

    if len(items) == 0:
        return None, "Provide at least one gratitude item."

    for item in items:
        if len(item) > 150:
            return None, "Each gratitude item must be at most 150 characters."

    return items, None


