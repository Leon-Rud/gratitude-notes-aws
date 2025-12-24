# Daily Gratitude Notes

**🚧 This is an ongoing project and still under active development.**

A full-stack serverless application for sharing daily gratitude notes with automatic archiving and event-driven observability.

## Table of Contents

- [Architecture](#architecture)
- [Quickstart](#quickstart)
- [API Reference](#api-reference)
- [Event-Driven Workflow](#event-driven-workflow)
- [Observability](#observability)
- [Testing](#testing)
- [Deployment](#deployment)

<a id="architecture"></a>

## 📐 Architecture

### System Architecture

![Architecture Diagram](docs/architecture/architecture-diagram.png)

_High-level system architecture showing API Gateway, Lambda functions, DynamoDB, EventBridge, and Step Functions integration._

### Workflow Orchestration

![Step Functions Workflow](docs/architecture/step-functions-workflow.png)

_Step Functions state machine orchestrating archive and observability workflows._

### Monitoring & Observability

![CloudWatch Monitoring Dashboard](docs/architecture/cloudwatch-dashboard.png)

_Real-time CloudWatch dashboard tracking note lifecycle events and system health._

**Components:**

- **API Gateway** – REST endpoints (`/gratitude-notes`, `/feedback`)
- **Lambda Functions** – `PostGratitudeNotesFn`, `GetTodayGratitudeNotesFn`, `DeleteGratitudeNoteFn`, `PostFeedbackFn`
- **DynamoDB** – `gratitude_notes` table (TTL: 7 days)
- **Step Functions** – `GratitudeWorkflow` orchestrates archive and observability workflows
- **EventBridge** – Routes note lifecycle events to Step Functions via `NoteEventRule`
- **CloudWatch** – Custom metrics (`DailyGratitude` namespace) and dashboard (`Gratitude-notes-workflow-monitor`)

<a id="quickstart"></a>

## 🚀 Quickstart

### Backend

```bash
./scripts/deploy_backend.sh  # Deploys to eu-west-1, stack: daily-gratitude
```

The script outputs `GratitudeApiBaseUrl` for frontend configuration.

### Frontend

```bash
cd client
npm install
npm run dev  # http://localhost:5173
```

Create `client/.env.local`:

```bash
VITE_API_BASE_URL=https://xxxxx.execute-api.eu-west-1.amazonaws.com/prod
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

<a id="api-reference"></a>

## 📡 API Reference

| Method   | Path                                      | Description                                                                                                                      |
| -------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/gratitude-notes`                        | Upsert note (body: `{name, email, gratitudeText}`). Returns 201 if created, 200 if updated. Enforces one note per day per email. |
| `GET`    | `/gratitude-notes/today`                  | List all active notes for today. Returns `{items: [{id, name, note_items, created_at}]}`                                         |
| `DELETE` | `/gratitude-notes/{id}?token=OWNER_TOKEN` | Soft-delete note (sets `status=deleted`). Requires owner token from POST response.                                               |
| `POST`   | `/feedback`                               | Send feedback email to developer (body: `{feedback}`). Requires SES sandbox verification.                                        |

**Examples:**

```bash
# Create/update note
curl -X POST "$API_BASE_URL/gratitude-notes" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex","email":"alex@example.com","gratitudeText":"Morning coffee\nSupportive team"}'

# List today's notes
curl "$API_BASE_URL/gratitude-notes/today"

# Delete note
curl -X DELETE "$API_BASE_URL/gratitude-notes/{id}?token={owner_token}"
```

<a id="event-driven-workflow"></a>

## 🔄 Event-Driven Workflow

The `GratitudeWorkflow` Step Functions state machine handles two workflows:

**Archive Workflow:**

- EventBridge Scheduler triggers at 23:00 (Asia/Jerusalem timezone)
- Directly invokes Step Functions with `{"eventType":"archive.nightly"}`
- Routes to `StepArchiveNotesFn` → marks day's notes as `deleted` in DynamoDB

**Observability Workflow:**

- API handlers publish EventBridge events with `DetailType`: `gratitude.note.created`, `gratitude.note.updated`, `gratitude.note.deleted`
- `NoteEventRule` matches these events and triggers Step Functions
- `StepPrepareEventFn` normalizes events: extracts `eventType` from EventBridge `detail` JSON (e.g., `note.created`, `note.updated`, `note.deleted`)
- Routes to `RecordNoteEventFn` → emits CloudWatch metrics

**Event Naming:**

- **EventBridge DetailType**: `gratitude.note.{created|updated|deleted}` (used in EventBridge rules)
- **Step Functions eventType**: `note.{created|updated|deleted}` (normalized by `StepPrepareEventFn`)
- **CloudWatch MetricName**: `NoteCreated`, `NoteUpdated`, `NoteDeleted` (namespace: `DailyGratitude`)

<a id="observability"></a>

## 📊 Observability

**CloudWatch Custom Metrics** (namespace: `DailyGratitude`):

- `NoteCreated` – dimension: `EventType=note.created`
- `NoteUpdated` – dimension: `EventType=note.updated`
- `NoteDeleted` – dimension: `EventType=note.deleted`

**Dashboard** (`Gratitude-notes-workflow-monitor`):

- Total today summary (created/updated/deleted counts)
- Activity over time (time-series graph)
- Lambda errors (24h)

<a id="testing"></a>

## 🧪 Testing

```bash
python -m pytest server/tests/test_gratitude_notes.py
```

Tests cover: note creation/updates, listing, deletion, and archive handler. Tests are self-contained (no `conftest.py`).

<a id="deployment"></a>

## 📦 Deployment

| Script                         | Purpose                                          |
| ------------------------------ | ------------------------------------------------ |
| `./scripts/deploy_backend.sh`  | Builds & deploys SAM stack, prints API URL       |
| `./scripts/capture_outputs.sh` | Exports API base URL to `client/.env.production` |
| `./scripts/deploy_frontend.sh` | Builds SPA and uploads to S3/CloudFront          |

**Region:** `eu-west-1`  
**Stack Name:** `daily-gratitude`
