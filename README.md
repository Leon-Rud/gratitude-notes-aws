# Daily Gratitude Notes

A full-stack portfolio demo that lets people share a short list of daily gratitudes and automatically archive the day's notes at 23:00 (Asia/Jerusalem timezone). The project uses a React/Vite SPA for the client and an AWS SAM stack (API Gateway + Lambda + DynamoDB + EventBridge + Step Functions + SES) for the backend.

## Architecture Overview

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────┐
│  API Gateway    │
│  /gratitude-notes│
└──────┬──────────┘
       │
       ├──► POST /gratitude-notes ──► Lambda ──► DynamoDB
       ├──► GET /gratitude-notes/today ──► Lambda ──► DynamoDB
       ├──► GET /gratitude-notes/{id} ──► Lambda ──► DynamoDB
       ├──► DELETE /gratitude-notes/{id} ──► Lambda ──► DynamoDB
       └──► POST /feedback ──► Lambda ──► SES (email)

┌──────────────────┐
│ EventBridge      │
│ Scheduler        │
│ (23:00 daily)    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Step Functions   │
│ (Archive Workflow)│
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Lambda           │
│ (Archive Notes)  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ DynamoDB         │
│ (gratitude_notes)│
└──────────────────┘
```

- **API Gateway (`/gratitude-notes`)** – public REST interface handled by Lambda functions:
  - `POST /gratitude-notes` – create a note (name, email, gratitude text)
  - `GET /gratitude-notes/today` – list today's notes (newest first)
  - `GET /gratitude-notes/{id}` – fetch a note
  - `DELETE /gratitude-notes/{id}?token=OWNER_TOKEN` – delete/withdraw a note via the owner token
  - `POST /feedback` – send UI/UX feedback to the developer
- **DynamoDB tables** – `gratitude_notes` (notes)
- **EventBridge Scheduler + Step Functions** – handles scheduled archiving:
  - A scheduled AWS Scheduler rule fires at 23:00 (configurable timezone) → Step Function workflow marks the day's notes as `deleted`
  - Step Functions orchestrates the archive workflow: PrepareEvent → RouteEvent → ArchiveNotes
- **CloudWatch dashboard** – monitors note creation, Lambda errors/duration, API Gateway metrics, and the Step Function health
- **SES (eu-west-1 sandbox)** – sends feedback emails to the developer

_No API keys are required. The legacy customer-ID workflow has been fully removed and everything in the stack is now dedicated to the gratitude notes experience._

## Backend (SAM) Setup

```bash
./scripts/deploy_backend.sh          # default stack name `daily-gratitude`
# or run manually:
# sam build -t server/infra/template.yaml
# sam deploy -t server/infra/template.yaml --guided --stack-name daily-gratitude
```

Script highlights:

- Validates & builds the SAM template (`server/infra/template.yaml`)
- Deploys to `eu-west-1` by default
- Prints the CloudFormation output `GratitudeApiBaseUrl`
- Exports helper env vars: `export VITE_API_BASE_URL="<api-url>"` and intentionally unsets `VITE_API_KEY`

Alternatively you can run `source scripts/capture_outputs.sh` to populate `client/.env.production` with the detected API base URL.

### Infrastructure resources

| Resource                             | Purpose                                                |
| ------------------------------------ | ------------------------------------------------------ |
| `PostGratitudeNotesFn`               | POST `/gratitude-notes`                                |
| `GetTodayGratitudeNotesFn`           | GET `/gratitude-notes/today`                           |
| `GetGratitudeNoteFn`                 | GET `/gratitude-notes/{id}`                            |
| `DeleteGratitudeNoteFn`              | DELETE `/gratitude-notes/{id}`                         |
| `PostFeedbackFn`                     | POST `/feedback`                                       |
| `GratitudeWorkflow` (Step Functions) | handles `archive.nightly` scheduled archiving workflow |
| `gratitude_notes` DynamoDB table     | note storage (TTL = 7 days)                            |
| `DailyGratitudeDashboard`            | CloudWatch dashboard for metrics (TODO: re-implement)  |

## Frontend Setup

```bash
cd client
npm install
npm run dev          # http://localhost:5173
```

Create `client/.env.local` (or set env vars before `npm run build`). You can copy `client/env.example`:

```bash
VITE_API_BASE_URL=https://xxxxxxxx.execute-api.eu-west-1.amazonaws.com/prod
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
# Optional: enable the in-app feedback button for testers
# VITE_ENABLE_FEEDBACK=true
# no API key is needed
```

Google OAuth: add the following Authorized JavaScript origins in Google Cloud Console:

- `http://localhost:5173`
- Your deployed frontend URL (e.g., the S3 static site URL output by `deploy_frontend.sh`)

To enable the feedback widget for UI/UX sessions, set `VITE_ENABLE_FEEDBACK=true` and ensure the backend `/feedback` endpoint is deployed.

The SPA is a single hash-router page:

- `#/` shows the form + today's public feed
- `#/notes/{id}` shows a single note detail view

## API Reference (public, no auth)

| Method & Path                                    | Description                                                                      |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `POST /gratitude-notes`                          | Body `{ name, email, gratitudeText }` → creates a note, enforces 1 per day/email |
| `GET /gratitude-notes/today`                     | Returns `{ items: [{ id, name, note_items, created_at }] }`                      |
| `GET /gratitude-notes/{id}`                      | Returns the note metadata unless it has been deleted/archived                    |
| `DELETE /gratitude-notes/{id}?token=OWNER_TOKEN` | Marks the note as `deleted`                                                      |
| `POST /feedback`                                 | Body `{ feedback }` → sends feedback email to the developer                      |

### Example curl flow

```bash
# Create a note
curl -X POST "$GratitudeApiBaseUrl/gratitude-notes" \
     -H "Content-Type: application/json" \
     -d '{
           "name": "Alex",
           "email": "alex@example.com",
           "gratitudeText": "Morning coffee\nSupportive team\nA quiet walk"
         }'

# Fetch today's feed
curl "$GratitudeApiBaseUrl/gratitude-notes/today"

# Delete via owner token (returned in POST response)
curl -X DELETE "$GratitudeApiBaseUrl/gratitude-notes/<NOTE_ID>?token=<OWNER_TOKEN>"
```

## Event-Driven Workflow

The Step Function workflow handles scheduled archiving:

- **EventBridge Scheduler** triggers at 23:00 (configurable timezone, default: UTC)
- **Step Functions Workflow** (`GratitudeWorkflow`):
  1. `PrepareEvent` - Validates the archive event
  2. `RouteEvent` - Routes to archive processing
  3. `ArchiveNotes` - Queries `gratitude_notes` for the current date and sets `status = deleted, archived_at = now`

View the execution history in Step Functions or the CloudWatch dashboard widgets to confirm the workflow is firing.

## Testing

Backend unit tests rely on the fake fixtures in `server/tests/conftest.py`:

```bash
python -m pytest server/tests/test_gratitude_notes.py   # install pytest first if needed
```

The test suite covers creating notes, listing today's feed, sending feedback, deleting notes, and running the nightly archive handler.

## CloudWatch Dashboard

`DailyGratitudeDashboard` surfaces:

- Notes created and emails sent (namespace `DailyGratitude`)
- Lambda errors/duration for the gratitude functions
- API Gateway 4XX/5XX + latency
- DynamoDB read/write capacity for `gratitude_notes`

_Note: Dashboard is currently disabled (TODO: re-implement with correct metric structure)_

## Deployment Scripts Recap

| Script                         | Purpose                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| `./scripts/deploy_backend.sh`  | Builds & deploys SAM stack (`daily-gratitude`), prints API URL, unsets `VITE_API_KEY` |
| `./scripts/capture_outputs.sh` | Helper to export the API base URL and regenerate `client/.env.production`             |
| `./scripts/deploy_frontend.sh` | Builds the SPA and uploads to S3/CloudFront (only needs `VITE_API_BASE_URL`)          |

## Notes

- SES is still in sandbox mode (verified sender email required). Use verified recipient emails or upgrade your SES account before demoing.
- `gratitude_notes` TTL is set to 7 days; archived notes remain queryable (with `status = deleted`) until the TTL expires.
- The previous customer-ID API, API keys, and unsubscribe flows have been removed; every Lambda now serves the gratitude notes experience.
- Archive schedule runs at 23:00 in Asia/Jerusalem timezone (configured via AWS Scheduler).
