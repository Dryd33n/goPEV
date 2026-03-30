# goPEV — Full Stack Reference

## Overview
Two independent apps in one repo. No monorepo tooling at this stage.
Web deploys to Vercel. Mobile builds via EAS and deploys to Google Play + App Store.
All backend logic lives in Next.js API routes for now — no separate server.

---

## Web stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR for SEO on route/charger pages, API routes replace a separate server |
| Language | TypeScript (strict) | Catches unit/type bugs in navigation logic early |
| Styling | Tailwind CSS | Utility-first, responsive, no CSS file sprawl |
| Map | Mapbox GL JS | Fully customizable vector tiles, offline support, better cycling data than Google |
| State | Zustand | Lightweight, no boilerplate, works well with map state |
| Data fetching | React Query (TanStack) | Caching, refetch on focus, loading/error states for free |
| Database | Neon (PostgreSQL + PostGIS) | Serverless Postgres, PostGIS for geospatial queries, Vercel integration |
| Auth | NextAuth.js | Google OAuth to start — one provider is enough for MVP |
| Deployment | Vercel | Zero-config Next.js deployment, preview deploys on every PR |

## Mobile stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Expo (SDK 51+) | Managed workflow, EAS Build handles iOS from Windows |
| Language | TypeScript (strict) | Shared conventions with web |
| Map | @rnmapbox/maps | Same Mapbox ecosystem as web, actively maintained |
| Navigation | Expo Router | File-based routing, same mental model as Next.js App Router |
| State | Zustand | Same library as web — consistent patterns |
| Data fetching | React Query (TanStack) | Same library as web |
| Location | expo-location | Background GPS, geofencing support |
| Build + deploy | EAS Build + EAS Submit | Cloud iOS builds from Windows, direct store submission |

## Routing engine (current)
Mapbox Directions API (hosted) with cycling profile.
Called server-side from Next.js API routes.
Battery model applied as a post-processing step on the Directions response.
Elevation data from Mapbox Terrain API.

Migrate to self-hosted Valhalla when:
- Mapbox API costs become significant, OR
- Custom road cost functions are needed (penalizing steep grades in the router itself)

## Database (Neon)
PostgreSQL 16 + PostGIS 3.4
Hosted on Neon free tier initially.
PostGIS enables spatial queries: nearby chargers, zone intersection checks, route geometry.

Key tables (to be created in milestone 3+):
- users
- vehicle_profiles
- charger_locations (PostGIS point geometry)
- legal_zones (PostGIS polygon geometry)
- community_reports (PostGIS point geometry)
- saved_routes

## External APIs
| API | Purpose | Free tier |
|---|---|---|
| Mapbox Directions | Route calculation | 100,000 requests/month |
| Mapbox Geocoding | Search autocomplete | 100,000 requests/month |
| Mapbox Terrain | Elevation per route | Included in map loads |
| OpenChargeMap | Charger seed data | Free, no auth required |
| Open-Meteo | Weather for range adjustment (later) | Free, no API key |

## What is deliberately excluded at this stage
- Turborepo / pnpm workspaces — no shared packages yet
- Separate Node.js API server — Next.js API routes are sufficient
- Redis — no caching layer until there is something worth caching
- Self-hosted Valhalla — Mapbox hosted routing is sufficient for MVP
- React Compiler — still in beta, incompatible with some Mapbox/Expo native modules
- GraphQL — REST with fetch is fine until the API surface gets complex
- New React Native Architecture (Fabric) — not all map/location libs support it yet
