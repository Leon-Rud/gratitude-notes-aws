from datetime import datetime, timezone
from typing import Any, Dict

from zoneinfo import ZoneInfo

from notes.db import archive_notes_by_date
from shared.config import ARCHIVE_TIMEZONE
from shared.logging import log_event

def _archive_date() -> str:
    try:
        tz = ZoneInfo(ARCHIVE_TIMEZONE)
    except Exception:
        tz = timezone.utc
    return datetime.now(tz).date().isoformat()


def handler(event: Dict[str, Any], _context) -> Dict[str, Any]:
    target_date = event.get("date") or _archive_date()
    now_iso = datetime.now(timezone.utc).isoformat()
    archived = archive_notes_by_date(target_date, now_iso=now_iso)

    log_event("step_archive_notes", {"date": target_date, "archived": archived})
    return {"date": target_date, "archived": archived}

