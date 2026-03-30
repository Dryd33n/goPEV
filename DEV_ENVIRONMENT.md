# goPEV Web — Development Environment

## IDE
WebStorm (JetBrains)
Open the repo root (goPEV/) not the web/ subfolder — otherwise path aliases break.

### Required plugins
- Prettier (set as default formatter for .ts .tsx .js .json .css)
- ESLint (set to Automatic ESLint configuration)
- Tailwind CSS (class name autocomplete)
- .env files support

### WebStorm settings
- Settings → Languages & Frameworks → Node.js
  → Node interpreter: ~/.volta/bin/node
- Settings → Languages & Frameworks → JavaScript → Prettier
  → Run on save: enabled
  → Run for files: {**/*,*}.{ts,tsx,js,jsx,json,css,md}
- Settings → Editor → Code Style → TypeScript
  → Use Prettier settings

---

## Node version management
Volta — pins Node version per project silently.

```bash
# install Volta (PowerShell, run once)
winget install Volta.Volta

# install Node LTS and pnpm
volta install node@20
volta install pnpm

# verify
node --version   # should print v20.x.x
pnpm --version
```

Target: Node 20 LTS. Do not upgrade to Node 22 — React Native tooling lags.

---

## First-time setup

```bash
# from repo root
cd web
pnpm install
cp .env.example .env.local
# fill in .env.local with your Mapbox token and Neon DATABASE_URL
pnpm dev
```

App runs on http://localhost:3000

---

## Environment variables

Create web/.env.local (never commit this file):
```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...    # get from mapbox.com → Tokens
REMOVED=sk.eyJ1...         # server-only, for Directions + Terrain API
DATABASE_URL=postgresql://...          # get from neon.tech → your project → Connection string
```

Get a Mapbox token:
1. mapbox.com → sign up (free)
2. Account → Tokens → Create a token
3. Public token (pk.*) for NEXT_PUBLIC_MAPBOX_TOKEN
4. Secret token (sk.*) with styles:read and datasets:read scopes for REMOVED

Get a Neon DATABASE_URL:
1. neon.tech → sign up (free)
2. Create project → name it gopev-dev
3. Run in SQL editor: CREATE EXTENSION IF NOT EXISTS postgis;
4. Dashboard → Connection Details → copy the connection string

---

## Useful dev commands

```bash
pnpm dev          # start dev server with hot reload
pnpm build        # production build (run before pushing to catch type errors)
pnpm lint         # ESLint
pnpm type-check   # tsc --noEmit (add to package.json scripts)
```

Add to web/package.json scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Vercel deployment setup (one-time)

1. Push repo to GitHub
2. vercel.com → Add New Project → import repo
3. Set Root Directory to: web
4. Framework Preset: Next.js (auto-detected)
5. Vercel dashboard → Integrations → add Neon
   (auto-injects DATABASE_URL for dev/preview/prod environments)
6. Vercel dashboard → Settings → Environment Variables
   → Add NEXT_PUBLIC_MAPBOX_TOKEN and REMOVED manually
7. Every push to main auto-deploys
8. Every PR gets a unique preview URL

---

## Database — local vs. cloud

No local Postgres needed. Neon's free tier has a dev branch.
Use the Neon SQL editor for schema changes during early development.
Connection from localhost works — Neon accepts connections from anywhere.

When schema stabilizes (post-milestone 3), add Drizzle ORM for migrations.
Until then, run DDL manually in the Neon SQL editor.

---

## Debugging tips

### Map not rendering
- Check browser console for "Invalid token" — means NEXT_PUBLIC_MAPBOX_TOKEN is missing
- Check that MapView is wrapped in dynamic(..., { ssr: false }) — SSR will crash on canvas

### API route errors
- Check Vercel function logs in the dashboard (or terminal in dev mode)
- All API routes return { error: string } on failure — check Network tab in DevTools

### Database connection errors
- Verify DATABASE_URL is set in .env.local
- Neon free tier pauses after 5 min inactivity — first query after pause is slow (~1s)
  This is normal. It will not happen in production with regular traffic.

### TypeScript path aliases not resolving in WebStorm
- Close and reopen the project from the repo ROOT (goPEV/), not from web/
- WebStorm needs to see tsconfig.json at the root of the opened folder
