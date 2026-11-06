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

## Commands

```bash
npm run build
npm run lint
npm test
```
