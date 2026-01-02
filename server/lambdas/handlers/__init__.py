"""
Lambda handlers for the Gratitude Board API.

Submodules:
- api/: REST API handlers (post_gratitude_note, get_today_gratitude_notes, delete_gratitude_note, email_feedback)
- events/: EventBridge & Step Functions handlers (step_archive_notes, step_prepare_event, step_record_note_event)
"""
