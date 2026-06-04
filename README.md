# Music App Web

Next.js 15 frontend for the music app. This project is safe to deploy to Vercel. It does not store music files or run `yt-dlp`; browser HTTP requests go through the Next.js `/api/*` proxy, which forwards to the Express backend through `BACKEND_API_URL`.

## Environment

Copy the example:

```bash
cp .env.example .env.local
```

Local:

```bash
BACKEND_API_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_BACKEND_WS_URL=http://localhost:4000
```

Production on Vercel:

```bash
BACKEND_API_URL=https://api.your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_BACKEND_WS_URL=https://api.your-domain.com
```

WebSocket connections still open directly from the browser to the backend, so your API must allow the frontend URL in `CORS_ORIGIN`.

## Local Development

```bash
npm install
npm run dev
```

Web runs at:

```text
http://localhost:3010
```

## Build

```bash
npm run typecheck
npm run build
```

## Vercel Deployment

In Vercel:

- Project root directory: the frontend repo root
- Build command: `npm run build`
- Install command: `npm install`
- Output: Next.js default
- Environment variables:
  - `BACKEND_API_URL=https://api.your-domain.com`
  - `NEXT_PUBLIC_API_URL=https://api.your-domain.com`
  - `NEXT_PUBLIC_BACKEND_WS_URL=https://api.your-domain.com`

If you import this as its own repository, no monorepo root-directory setting is needed.

## What Stays Client-Side

Each browser has its own playback state:

- current song
- queue
- shuffle/repeat
- play/pause
- seek position

The library, playlists, downloads, recycle bin, MP3 files, and thumbnails are shared through the backend API.
