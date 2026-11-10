# The Small Web

A browser for a fictional web of community-published, single-page sites. Built with Next.js, NestJS, MongoDB, and TypeScript.

## Local setup

Requirements: Node.js 22+, npm, and Docker.

```bash
docker compose up -d
copy .env.example .env
npm install --prefix apps/api
npm install --prefix apps/web
```

Run the API and web app in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

The web app runs at `http://localhost:3000` and the API at `http://localhost:4000`.

Seed the fictional web with deterministic people, sites, and visit history:

```bash
npm run seed
```

Running the seed command again updates the same records instead of creating duplicates.

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
