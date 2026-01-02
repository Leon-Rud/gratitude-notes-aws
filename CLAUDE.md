# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack serverless application for sharing daily gratitude notes with automatic archiving and event-driven observability.

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS (port 5173)
- **Backend**: Python 3.13 Lambda + DynamoDB + AWS SAM
- **Region**: eu-west-1

## Commands

### Frontend (client/)

```bash
npm run dev          # Start dev server (localhost:5173)
npm run build        # TypeScript check + Vite build
npm run lint         # TypeScript checking (tsc --noEmit)
```

### Backend (server/)

```bash
python -m pytest server/tests/test_gratitude_notes.py      # Run all tests
python -m pytest server/tests/test_gratitude_notes.py -v   # Verbose output
python -m pytest server/tests/test_gratitude_notes.py::test_name  # Single test
```

### Deployment

```bash
./scripts/deploy_backend.sh               # Deploy SAM stack
./scripts/capture_outputs.sh <STACK_NAME> # Export API URL to client/.env.production
./scripts/deploy_frontend.sh              # Deploy to S3/CloudFront
```

### Environment

```bash
direnv allow           # Auto-loads .venv when cd'ing into project
source .venv/bin/activate
```

## Architecture

### Frontend Structure

```
client/src/
├── api/              # API client (callApi<T>() generic function)
├── components/
│   ├── ui/           # Design system primitives (Button, Card, Input, Textarea, Typography)
│   └── notes/        # Note-related components
├── contexts/         # AuthContext (Google OAuth)
├── pages/            # Page components
└── lib/cn.ts         # Class merging utility (clsx + tailwind-merge)
```

### Backend Structure

```
server/
├── lambdas/
│   ├── handlers/     # API handlers + Step Functions handlers
│   ├── notes/db.py   # DynamoDB access layer
│   └── shared/       # Config, logging, email, API helpers
├── infra/
│   └── template.yaml # SAM CloudFormation template
└── tests/
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/gratitude-notes` | Create/update note (upsert per email per day) |
| GET | `/gratitude-notes/today` | List active notes for today |
| DELETE | `/gratitude-notes/{id}?token=OWNER_TOKEN` | Soft-delete note |
| POST | `/feedback` | Email feedback via SES |

### DynamoDB Schema

Table `gratitude_notes` with:
- **GSI1** (`gsi_date`): `date` + `created_at` - list notes by day
- **GSI2** (`gsi_email_date`): `email` + `date` - upsert validation
- **TTL**: 7 days auto-cleanup

### Event-Driven Workflows

- **Archive**: EventBridge Scheduler (23:00 local) → Step Functions → marks notes as `deleted`
- **Observability**: API handlers emit events → EventBridge → Step Functions → CloudWatch metrics

Events published: `gratitude.note.{created|updated|deleted}`

## Design System

**Rule: Use tokens + primitives first.** Before writing custom Tailwind classes, check:
1. Design tokens in `tailwind.config.cjs`
2. UI primitives in `client/src/components/ui/`

See `client/DESIGN_SYSTEM.md` for full documentation.

### Key Tokens

- Colors: `bg-ui-glass`, `bg-ui-overlay`, `border-ui-glassBorder`, `bg-ui-input`
- Radii: `rounded-card` (16px), `rounded-pill` (60px)
- Blur: `backdrop-blur-glass` (7.5px), `backdrop-blur-hero` (17.5px)
- Fonts: `font-poppins` (headings), `font-manrope` (body)

### UI Primitives

- `Button` - variants: primary/outline/ghost, sizes: sm/md/lg/xl
- `Typography` - variants: h1/h2/body/n1/label/caption
- `Card` - variants: glass/solid
- `Input`, `Textarea` - variants: default/subtle, error state

## Authentication

- **Frontend**: Google OAuth via `@react-oauth/google`, stored in `localStorage`
- **Backend**: No auth for create/list; DELETE requires `owner_token` from POST response

## Environment Variables

### Frontend (client/.env.local)

```
VITE_API_BASE_URL=https://xxxxx.execute-api.eu-west-1.amazonaws.com/prod
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Backend (set via SAM parameters)

- `NOTES_TABLE`, `SENDER_EMAIL`, `EVENT_BUS_NAME`, `ARCHIVE_TIMEZONE`

## Testing Patterns

Tests mock DB functions directly without `conftest.py`:

```python
# Add lambdas to sys.path
LAMBDA_DIR = Path(__file__).resolve().parents[1] / "lambdas"
sys.path.insert(0, str(LAMBDA_DIR))

# Mock in tests
post_note.db.create_or_update_note = _mock_create_or_update_note()
```

## Code Conventions

### Frontend
- Use `cn()` utility for class merging
- Use Typography component instead of raw `<p>` tags
- Use design tokens over raw Tailwind values

### Backend
- `handler(event, _context)` as Lambda entry point
- `_underscore` prefix for private functions
- Normalize email to lowercase before DB operations
- Use `log_event(action, data)` for structured logging (auto-redacts PII)

## Git Workflow

- **NEVER** run `git push` without explicit user approval
- **NEVER** commit changes automatically — always wait for user to validate changes first
- Commit messages should be concise and descriptive — do NOT include the Claude Code branding footer or Co-Authored-By lines
