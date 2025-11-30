## Job Importer with Queue Processing & History Tracking

This project is a small demo system that:

- Fetches jobs from external XML feeds every hour.
- Converts them to JSON and pushes them to a Redis-backed queue.
- Imports / upserts jobs into MongoDB using worker processes.
- Tracks each import run in `import_logs`.
- Exposes a small Next.js admin UI to view import history.

### Tech Stack

- **Frontend**: Next.js (React, function components only)
- **Backend**: Node.js + Express (function-based modules)
- **Database**: MongoDB (Mongoose)
- **Queue**: BullMQ
- **Queue Store**: Redis

### Repository Structure

- `client/` – Next.js admin UI
- `server/` – Express backend + worker + cron import
- `docs/architecture.md` – High level design and decisions

### Quick Start

1. **Clone & install**

   ```bash
   # in the project root
   cd server
   npm install

   cd ../client
   npm install
   ```

2. **Environment variables**

   Create `server/.env`:

   ```bash
   MONGO_URI=mongodb://localhost:27017/job_importer
   REDIS_URL=redis://localhost:6379
   PORT=4000
   IMPORT_CRON=*/60 * * * *  # not used directly, but kept for future cron scheduling
   IMPORT_CONCURRENCY=5
   ```

   (You can also point MongoDB and Redis to hosted services like MongoDB Atlas and Redis Cloud.)

3. **Run backend**

   ```bash
   cd server
   npm run dev
   ```

   The backend exposes:

   - `GET /api/import-logs` – list import runs (for the admin UI)
   - `POST /api/import/run` – trigger an immediate import of all feeds

4. **Run frontend**

   ```bash
   cd client
   npm install  # first time only
   npm run dev
   ```

   Optionally create `client/.env.local` with `NEXT_PUBLIC_API_BASE=http://localhost:4000` (defaults to that in dev).  
   Then open `http://localhost:3000` to see the Import History table. The App Router page uses axios to call the Express backend directly.

### Notes

- All logic is implemented with **functions**, not classes.
- The design is intentionally kept small and readable instead of “enterprise-level” complexity.
- See `docs/architecture.md` for more details and assumptions.


