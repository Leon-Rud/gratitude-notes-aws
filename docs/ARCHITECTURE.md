# Architecture Reference

Deep reference for API endpoints, database schema, and event-driven workflows.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/gratitude-notes` | Create/update note (upsert per email per day) |
| GET | `/gratitude-notes/today` | List active notes for today |
| DELETE | `/gratitude-notes/{id}?token=OWNER_TOKEN` | Soft-delete note |
| POST | `/feedback` | Email feedback via SES |

## DynamoDB Schema

Table: `gratitude_notes`

| Index | Partition Key | Sort Key | Purpose |
|-------|---------------|----------|---------|
| Primary | `id` | — | Direct lookups |
| GSI1 (`gsi_date`) | `date` | `created_at` | List notes by day |
| GSI2 (`gsi_email_date`) | `email` | `date` | Upsert validation |

- **TTL**: 7 days auto-cleanup

## Event-Driven Workflows

### Archive Workflow
EventBridge Scheduler (23:00 local) → Step Functions → marks notes as `deleted`

### Observability Workflow
API handlers emit events → EventBridge → Step Functions → CloudWatch metrics

### Event Names

Events published to EventBridge:
- `gratitude.note.created`
- `gratitude.note.updated`
- `gratitude.note.deleted`
