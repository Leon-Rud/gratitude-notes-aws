# Environment Variables Reference

## Local Environment Setup

```bash
direnv allow              # Auto-loads .venv when cd'ing into project
source .venv/bin/activate # Manual activation
```

## Frontend (client/.env.local)

```
VITE_API_BASE_URL=https://xxxxx.execute-api.eu-west-1.amazonaws.com/prod
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## Backend (SAM Parameters)

Set via SAM template parameters or environment:

| Variable | Description |
|----------|-------------|
| `NOTES_TABLE` | DynamoDB table name |
| `SENDER_EMAIL` | SES sender address for feedback emails |
| `EVENT_BUS_NAME` | EventBridge bus for workflow events |
| `ARCHIVE_TIMEZONE` | Timezone for archive scheduler (e.g., `Europe/London`) |
