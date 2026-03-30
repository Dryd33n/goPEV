# goPEV — Claude Code Instructions

## What this project is
goPEV is a navigation app for personal electric vehicles (PEVs): e-bikes, e-scooters,
e-skateboards, e-unicycles, and e-wheelchairs. It is a Google Maps alternative built
around battery-aware routing, charger infrastructure, and legal riding zone awareness.

## Repo structure
```
goPEV/
  web/      # Next.js 14 web app — see web/CLAUDE.md
  mobile/   # Expo React Native app — see mobile/CLAUDE.md
  CLAUDE.md
  STACK.md
  PLAN.md
```

No root-level package.json. No monorepo tooling yet. Each app is fully independent.
When shared code becomes painful to duplicate, we will add pnpm workspaces + Turborepo
at that point — not before.

## Cross-cutting rules
- Language: TypeScript everywhere, strict mode on
- Formatting: Prettier with default config
- No shared packages yet — duplicate types between web and mobile until it hurts
- All Mapbox API calls go through a server-side route handler, never from the client
  directly (keeps the secret token out of the browser)
- Database queries go in lib/db/ — never inline in route handlers
- Mapbox API calls go in lib/mapbox/ — never inline in route handlers
- Do not add infrastructure (Redis, separate Node API, Valhalla) until the feature
  that needs it is proven and the current approach is actually a bottleneck

## Naming conventions
- Components: PascalCase (MapView.tsx, RouteCard.tsx)
- Utilities: camelCase (getBatteryEstimate.ts, formatDistance.ts)
- API routes: kebab-case directories (api/route-directions/, api/nearby-chargers/)
- Database files: snake_case (vehicle_profiles, charger_locations)
- Environment variables: SCREAMING_SNAKE_CASE, NEXT_PUBLIC_ prefix only for values
  that are genuinely safe to expose to the browser

## Environment variables
All secrets live in .env.local (never committed). See web/.env.example and
mobile/.env.example for required keys. The only public-safe key is
NEXT_PUBLIC_MAPBOX_TOKEN — all others are server-side only.

## Git workflow
- main branch is always deployable
- Feature branches named: feature/milestone-N-description
- Commit messages: plain English, present tense ("Add battery drain estimate to route card")
- Never commit .env.local, node_modules, .next, or .expo
