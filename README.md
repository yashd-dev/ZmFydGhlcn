# grid

Wind forecast and retrospective accuracy dashboard.

## Run locally

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:8000

## Checks

```bash
cd web && npm run check && npm run build
cd backend && uv run pytest
```
