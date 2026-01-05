# CLAUDE.md

Operational guidance for Claude Code when working in this repository.

## Project Overview

Full-stack serverless app for sharing daily gratitude notes with automatic archiving.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS (port 5173)
- **Backend**: Python 3.13 Lambda + DynamoDB + AWS SAM
- **Region**: eu-west-1

## Default Working Protocol

1. **Plan** — understand the task, ask clarifying questions if needed
2. **Smallest diff** — make the minimal change that solves the problem
3. **Run commands** — build/lint/test as appropriate
4. **Stop** — do not iterate unless user provides new output or feedback

## Token / Usage Policy

- Avoid validation loops (repeated "does this look good?" exchanges)
- Request minimal artifacts; don't ask for full file contents unless necessary
- Only request screenshots or Playwright when the task is specifically UI/layout

## Commands

### Frontend (client/)

```bash
npm run dev      # Dev server (localhost:5173)
npm run build    # TypeScript check + Vite build
npm run lint     # TypeScript checking (tsc --noEmit)
```

### Backend (server/)

```bash
python -m pytest server/tests/test_gratitude_notes.py      # All tests
python -m pytest server/tests/test_gratitude_notes.py -v   # Verbose
python -m pytest server/tests/test_gratitude_notes.py::test_name  # Single test
```

## Deployment

```bash
./scripts/deploy_backend.sh               # Deploy SAM stack
./scripts/capture_outputs.sh <STACK_NAME> # Export API URL to client/.env.production
./scripts/deploy_frontend.sh              # Deploy to S3/CloudFront
```

## Repo Structure

```
client/src/
├── api/           # API client (callApi<T>())
├── components/ui/ # Design system primitives
├── components/    # Feature components
├── contexts/      # AuthContext (Google OAuth)
├── pages/         # Page components
└── lib/cn.ts      # Class merging utility

server/
├── lambdas/handlers/  # API + Step Functions handlers
├── lambdas/notes/     # DynamoDB access layer
├── lambdas/shared/    # Config, logging, email, API helpers
├── infra/template.yaml
└── tests/
```

## Design System Rules

**Use tokens + primitives first.** Before writing custom Tailwind classes:
1. Check design tokens in `tailwind.config.cjs`
2. Check UI primitives in `client/src/components/ui/`

→ Full reference: [client/DESIGN_SYSTEM.md](client/DESIGN_SYSTEM.md)

## Auth + API Notes

- **Frontend**: Google OAuth via `@react-oauth/google`, stored in `localStorage`
- **Backend**: No auth for create/list; DELETE requires `owner_token` from POST response

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

## When to Read What

Only load these docs when the task requires deeper reference:

| Task involves... | Read |
|------------------|------|
| UI, layout, tokens, components | [client/DESIGN_SYSTEM.md](client/DESIGN_SYSTEM.md) |
| API endpoints, DynamoDB, workflows, events | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Environment variables, config | [docs/ENV.md](docs/ENV.md) |
| Tests, mocking patterns | [docs/TESTING.md](docs/TESTING.md) |

## Git Rules

- **NEVER** run `git push` without explicit user approval
- **NEVER** commit changes automatically — always wait for user to validate changes first
- Commit messages should be concise and descriptive — do NOT include the Claude Code branding footer or Co-Authored-By lines
