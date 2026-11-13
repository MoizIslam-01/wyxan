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

The web app runs at `http://localhost:3000` and the API at `http://localhost:4000`. Run `npm run seed` again to confirm it reports the same 5 people, 10 sites, and 32 seeded visits. The seed updates those records without duplicating them.

## Deploy: Vercel, Railway, Atlas

Deploy the NestJS API to Railway first, then the Next.js frontend to Vercel. Both services use this repository; each has its own root directory. The database stays on Atlas.

1. In Railway, create a service from the GitHub repository and set **Root Directory** to `/apps/api`. Set **Build Command** to `npm run build`, **Start Command** to `npm run start:prod`, and **Healthcheck Path** to `/api`. Add `MONGODB_URI` in Railway Variables. Generate a public Railway domain and check `https://YOUR-API.up.railway.app/api` returns `{"status":"ok","service":"small-web-api"}`. Railway provides `PORT`; the API listens on it automatically.
2. In Vercel, import the same GitHub repository, set **Root Directory** to `apps/web`, and use the detected Next.js settings. Add `NEXT_PUBLIC_API_URL=https://YOUR-API.up.railway.app` to Vercel Environment Variables, with no trailing slash or `/api`. Deploy the frontend.
3. In Railway, set `WEB_ORIGIN=https://YOUR-WEB.vercel.app` to the exact Vercel production origin, with no trailing slash. Redeploy the API. If the Vercel URL changes, update `WEB_ORIGIN` and redeploy. `NEXT_PUBLIC_API_URL` is embedded in the frontend build, so changing it requires a new Vercel deployment.
4. Seed the Atlas database once from a trusted local checkout using `npm run seed` with your local `.env` pointing to the same Atlas cluster. Do not run the seed as an automatic deploy command; it deliberately rewrites the demo records to their deterministic state.

Atlas must allow connections from both your computer and the Railway service. Railway's outbound IP may change unless you configure a static egress IP; set Atlas Network Access accordingly. Use a dedicated database user and keep its credentials in Railway Variables and local `.env`, never in Git.

The tracked `.env.example` contains placeholder local defaults. `.env` and `.env.local` are ignored by Git. Reviewers can copy the example, supply their own MongoDB URI, install dependencies, seed, and run both apps with the commands above. Share the repository and deployed frontend URL; do not share your credentials.

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
