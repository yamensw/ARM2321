# Realtime Market Monorepo

Realtime listing marketplace with a Socket.IO-powered backend and Tailwind React frontend.

## Project Structure

```
realtime-market-backend/   # Express + Prisma + Socket.IO API
realtime-market-frontend/  # React + Vite client
```

## Quickstart

### Backend

```bash
cd realtime-market-backend
cp .env.example .env
# for fast local dev, you may set DATABASE_URL="file:./dev.db" and DATABASE_PROVIDER=sqlite
npm install
npx prisma db push
npm run dev
```

### Frontend

```bash
cd realtime-market-frontend
echo "VITE_API_BASE=http://localhost:4000" > .env
npm install
npm run dev
```

Open two browser tabs at http://localhost:5173, create a listing in one tab, and watch it appear instantly in both.

## Database Schema

Defined in `realtime-market-backend/prisma/schema.prisma` with the `Listing` model:

- `id` – cuid identifier
- `title` – string
- `description` – string
- `price` – decimal
- `imageUrl` – optional string
- `createdAt` – timestamp (default `now()`)

## Cloudinary Unsigned Upload Setup

1. Create a Cloudinary account and log in.
2. Navigate to **Settings → Upload**.
3. Under **Upload presets**, create a new unsigned preset named `market_unsigned` (or update `.env` to match your preset name).
4. Enable **Unsigned uploading** for the preset and optionally restrict allowed formats/sizes.
5. Note your cloud name and preset for the frontend environment variables.

## Deployment Guide

### Database (Neon)

1. Create a new Neon Postgres project.
2. Copy the connection string and set it as `DATABASE_URL` in your backend environment (keep `DATABASE_PROVIDER=postgresql`).
3. Run `npx prisma db push` to sync schema.

### Backend (Render or Railway)

1. Create a new Web Service and connect your repo or deploy via Git.
2. Set environment variables from `.env.example`.
3. Build command: `npm install && npm run build && npx prisma generate`
4. Start command: `npm start`
5. After the first deploy, run `npx prisma db push` from a shell to create tables.

### Frontend (GitHub Pages)

1. Update `homepage` in `realtime-market-frontend/package.json` and `base` in `vite.config.ts` with your repo name.
2. Set `.env.production` with the deployed backend URL.
3. From the frontend directory run `npm install` and `npm run deploy`.

## Additional Notes

- CORS origins are read from `CORS_ORIGINS` in the backend `.env`.
- Socket.IO broadcasts `listing:new` events to all connected clients whenever a listing is created.
- The frontend prefers WebSocket transport for snappy real-time updates.
