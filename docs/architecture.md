## Architecture Overview

### High-Level Flow

- External **job feeds** (XML) are fetched by the backend.
- Each fetched job item is converted to JSON and pushed as a message into a **BullMQ queue** in Redis.
- A **worker process** consumes jobs from the queue and **upserts** them into MongoDB:
  - If a job with the same external ID already exists → update it.
  - Otherwise → create a new job document.
- For each feed import, the backend creates an **import log** document in `import_logs`:
  - `timestamp`
  - `feedUrl` (shown as “fileName” in the UI)
  - `totalFetched`
  - `totalImported`
  - `newJobs`
  - `updatedJobs`
  - `failedJobs[]` with `reason`
- The Next.js UI calls `GET /api/import-logs` and renders a table of these logs.

### Backend (server/)

- **Framework**: Express with function-based routing and controllers.
- **Database**: MongoDB via Mongoose.

#### Main Modules

- `src/config/env.js` – reads environment variables with defaults.
- `src/config/db.js` – connects to MongoDB.
- `src/queue/queue.js` – creates and exports a BullMQ queue and worker.
- `src/models/Job.js` – Mongoose schema/model for job documents.
- `src/models/ImportLog.js` – Mongoose schema/model for import logs.
- `src/services/jobFetchService.js` – fetches XML feeds and converts them to JSON job objects.
- `src/services/importService.js` – coordinates imports:
  - creates an import log
  - enqueues jobs with import metadata
- `src/routes/importRoutes.js` – HTTP endpoints for:
  - triggering manual import
  - listing import logs.
- `src/index.js` – Express app entrypoint.

#### Queue Processing

- **Library**: BullMQ (function-based).
- **Queue name**: `job-import-queue`.
- Each job payload includes:
  - parsed job data
  - `feedUrl`
  - `importLogId`
- The worker:
  - computes a stable `externalId` (e.g., from the feed’s GUID or link+title).
  - uses `findOneAndUpdate` with upsert to insert/update the job.
  - updates the associated `ImportLog` counters (`newJobs`, `updatedJobs`, `failedJobs`, `totalImported`).

#### Scheduling / Cron

- For simplicity, the demo uses a **simple interval timer** inside the backend to periodically trigger imports (e.g., every 60 minutes).
- The schedule duration is configurable via environment variable in the future if needed.
- There is also a manual trigger endpoint for testing.

-### Frontend (client/)
- 
- **Framework**: Next.js App Router with Tailwind CSS for styling.
- One main page:
  - `app/page.js` – Import History table.
  - Uses axios on the client to call `http://localhost:4000/api/import/...` directly.
  - Displays:
    - `fileName` (feed URL)
    - `timestamp`
    - `totalFetched`
    - `totalImported`
    - `newJobs`
    - `updatedJobs`
    - `failedJobs` (count, and optional tooltip or joined text of reasons).

### Scalability Considerations

- **Horizontal scaling**:
  - The worker is stateless; multiple worker processes can be run in parallel, all consuming from the same BullMQ queue.
  - Import logic is encapsulated in services, making it easy to break out into a separate **import microservice** later.
- **Configurable concurrency & batch size**:
  - BullMQ worker concurrency is set via `IMPORT_CONCURRENCY`.
  - Batch size for each feed is limited in the fetch service (can be promoted to an env variable).
- **Resilience**:
  - Each job is isolated; failures only affect that job and are recorded in `import_logs.failedJobs`.
  - Redis and MongoDB can be replaced by cloud equivalents (Redis Cloud, MongoDB Atlas) without changing core code.

### Assumptions

- Feeds are reasonably small; per-job logging to `import_logs` is acceptable.
- External feeds are trusted to have basic fields like title, link, description, publish date, etc.
- Only the last few hundred import logs need to be shown in the UI (we paginate or limit in the backend).


