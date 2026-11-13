# The Small Web

A browser for a fictional web of community-published, single-page sites. Built with Next.js, NestJS, MongoDB, and TypeScript.

## Local setup

Requirements: Node.js 22+, npm, and a MongoDB database. The quickest setup without Docker is a free MongoDB Atlas cluster.

In Atlas, create a free cluster, a database user, and an IP access list entry for your current IP. In **Connect → Drivers**, copy the Node.js connection string. Put it in `.env` as `MONGODB_URI`, replacing the username and password placeholders and appending `/small-web` before the query string. If the password contains reserved URI characters, URL-encode them. Keep `.env` private.

Alternatively on Windows, install MongoDB Community Server using the official Windows x64 MSI and select **Install MongoDB as a Service**. The default service listens on `localhost:27017`. Docker is optional; if already installed, `docker compose up -d` starts the same database locally.

```powershell
Copy-Item .env.example .env
npm install --prefix apps/api
npm install --prefix apps/web
npm run seed
```

Run the API and web app in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

The web app runs at `http://localhost:3000` and the API at `http://localhost:4000`. If port 3000 is occupied and Next.js starts on `http://localhost:3001`, change `WEB_ORIGIN` in the root `.env` to `http://localhost:3001` and restart the API. The API only accepts browser requests from the origin set there. `NEXT_PUBLIC_API_URL` should still point to the API on port 4000. Run `npm run seed` again to confirm it reports the same 5 people, 10 sites, and 32 seeded visits. The seed updates those records without duplicating them.

The tracked `.env.example` contains placeholder local defaults. `.env` and `.env.local` are ignored by Git. Reviewers can copy the example, supply their own MongoDB URI, install dependencies, seed, and run both apps with the commands above. Share the repository link without sharing your credentials.

## API

```text
GET  /api                       Health check
GET  /api/people                List available people
GET  /api/sites/search?q=...    Search site titles and page text
GET  /api/sites/:address        Resolve an address
POST /api/sites                 Publish a site
POST /api/visits                Record a successful or broken visit
GET  /api/people/:id/history    Read a person's newest visits
```

## Commands

```bash
npm run build
npm run lint
npm test
```
