# Gridbricks

Gridbricks is a wind forecast and retrospective accuracy dashboard for Great
Britain. It compares published wind forecasts with actual generation, showing
the forecast available at a selected decision-time cutoff and how accurate those
forecasts were after delivery.

## What it shows

- **Overview:** the eligible forecast for each delivery hour, daily forecast
  energy, and recent accuracy metrics.
- **Accuracy:** forecast-versus-actual intervals and mean absolute error (MAE),
  root mean squared error (RMSE), and bias for the selected evaluation period.
- **Decision policy:** the forecast cutoff is interpreted in Europe/London.
  Actual generation can be evaluated as the average of the two
  half-hour values in an hour (`hour_mean`) or as the first half-hour value
  (`hour_start_point`).

Forecast and actual data are fetched from the [Elexon BMRS API](https://data.elexon.co.uk/bmrs/).
On startup, the backend creates the database tables and loads the built-in
evaluation date range when that range is not already present. The first startup needs
network access to BMRS and can take a little while.

## Tech stack

| Part | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Recharts |
| API | Python 3.14, FastAPI, Pydantic, Uvicorn |
| Database | PostgreSQL 17, Psycopg connection pool |
| Tooling | Bun, uv, Docker Compose, pytest |

## Run with Docker Compose

### Requirements

- Docker Engine or Docker Desktop with the Compose plugin
- Internet access on first startup to fetch BMRS data

From the repository root, build and start the database, API, and frontend:

```bash
docker compose up --build
```

Open:

- Dashboard: <http://localhost:5173>
- API health: <http://localhost:8000/api/v1/health>
- API documentation: <http://localhost:8000/docs>

Compose keeps PostgreSQL data in the `postgres_data` volume. Stop the services
with `Ctrl+C`; run `docker compose down` to remove the containers. To also
delete the stored database data and trigger a fresh seed next time, run
`docker compose down --volumes`.

## Run frontend and backend separately

Use this setup when you want hot reload or want to run one part outside Docker.
You need PostgreSQL, [uv](https://docs.astral.sh/uv/), and
[Bun](https://bun.sh/) installed. Python 3.14 or newer is required.

### 1. Start PostgreSQL

Start only the Compose database service:

```bash
docker compose up -d db
```

The default local database is `gridbricks`, with user and password `postgres`,
available at `localhost:5432`.

### 2. Start the API

In a terminal from the repository root:

```bash
cd backend
uv sync --dev
```

Create `backend/.env` (or export these variables in your shell):

```dotenv
DB_URL=postgresql://postgres:postgres@localhost:5432/gridbricks
ALLOWED_ORIGINS=http://localhost:5173
```

Start the API:

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend creates its schema and seeds BMRS data at startup. Keep this
terminal running.

### 3. Start the frontend

In a second terminal from the repository root:

```bash
cd web
bun install --frozen-lockfile
```

Create `web/.env` with the API URL:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Run the Vite development server:

```bash
bun run dev -- --host 0.0.0.0
```

Open <http://localhost:5173>.

## Configuration

Backend settings are read from environment variables. For local development,
the backend also loads `backend/.env` if it exists.

| Variable | Default | Purpose |
| --- | --- | --- |
| `DB_URL` | — | PostgreSQL connection URL; required to start the API |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated browser origins allowed by CORS |

The frontend reads `VITE_API_BASE_URL` at build/dev-server startup. When unset,
it uses a relative API URL, suitable when the API is served from the same
origin.

The evaluation policy is fixed in the application: the default cutoff is
09:00 Europe/London, and the evaluation window is 2026-01-02 through
2026-02-01. The API can still accept a different cutoff per request.

## API endpoints

All endpoints are under `/api/v1`:

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Confirms the API can reach PostgreSQL |
| `GET /forecasts` | Returns forecasts for a date range and marks forecasts published by the cutoff as eligible |
| `GET /accuracy` | Returns hourly forecast/actual matches, exclusions, and accuracy metrics |

The date-range endpoints require `start_date` and `end_date` in `YYYY-MM-DD`
format. They also accept `cutoff` (for example, `09:00`); `/accuracy` accepts
`alignment` (`hour_mean` or `hour_start_point`). The API serves the fixed
evaluation window and limits each request to at most 32 calendar dates.

## Development checks

Run from the repository root:

```bash
cd web && bun run check && bun run build
cd ../backend && uv run pytest
```

The frontend check runs Ultracite lint/format checks; the build also runs the
TypeScript compiler. Backend tests use pytest.
