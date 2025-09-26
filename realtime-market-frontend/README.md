# Realtime Market Frontend

React + Vite single-page app for the realtime marketplace.

## Environment

Create a `.env` file with your local backend URL and Cloudinary preset. See `.env` and `.env.production` for examples.

```
VITE_API_BASE=http://localhost:4000
VITE_CLOUDINARY_CLOUD=your_cloud_name
VITE_CLOUDINARY_UNSIGNED_PRESET=market_unsigned
```

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173. Submit the form to publish listings; they will appear instantly on all connected clients through Socket.IO.

## Deployment

1. Update `homepage` in `package.json` and `base` in `vite.config.ts` with your GitHub username/repo.
2. Configure `.env.production` with your deployed backend URL.
3. Run `npm run deploy` to build and push to GitHub Pages (requires repository to be configured with `gh-pages`).

## Scripts

- `npm run dev` – Vite dev server
- `npm run build` – build static assets
- `npm run deploy` – deploy to GitHub Pages (`gh-pages` branch)
