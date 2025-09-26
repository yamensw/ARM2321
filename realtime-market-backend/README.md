# Realtime Market Backend

Express + Prisma + Socket.IO backend powering the realtime marketplace.

## Requirements

- Node.js 18+
- PostgreSQL (Neon recommended) or SQLite for quick local development

## Environment

Copy `.env.example` to `.env` and fill in values. For fast local development you can point `DATABASE_URL` to `file:./dev.db` and set `DATABASE_PROVIDER=sqlite` to use SQLite.

```
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public
DATABASE_PROVIDER=postgresql
CORS_ORIGINS=http://localhost:5173,https://<your-gh-username>.github.io
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

## Setup

```bash
npm install
npx prisma db push
npm run dev
```

The server exposes:

- `GET /health` → `{ ok: true }`
- `GET /api/listings` → `{ items: Listing[] }`
- `POST /api/listings` → `{ listing }` and emits `listing:new`

## Deployment

1. **Database**: provision a Neon Postgres instance and set `DATABASE_URL` accordingly (keep `DATABASE_PROVIDER=postgresql`).
2. **Render/Railway**: create a new web service, set environment variables, build command `npm install && npm run build && npx prisma generate`, start command `npm start`. Run `npx prisma db push` once via shell to sync schema.

## Scripts

- `npm run dev` – run with `ts-node-dev`
- `npm run build` – compile TypeScript
- `npm start` – run compiled app
- `npm run db:push` – apply Prisma schema

## Code Overview

- `src/index.ts` – Express app + Socket.IO setup
- `src/env.ts` – environment loading & validation
- `src/listings/` – listings schema, routes, service
- `prisma/schema.prisma` – data model definition
