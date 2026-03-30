# goPEV — Product Plan

## Problem statement
PEV riders (e-bikes, e-scooters, e-skateboards, e-unicycles, e-wheelchairs) have no
navigation app built for their actual constraints:
- Battery range is finite and terrain-dependent
- Charging infrastructure is invisible on mainstream maps
- Legal riding zones vary by street, city, and vehicle class
- Road surfaces and gradients matter in ways they don't for cars

Google Maps, Apple Maps, and Komoot are all built for cars or human-powered bikes.
None model battery drain, none surface PEV-specific chargers, none handle legal zone
routing. goPEV is built ground-up for these constraints.

---

## Target vehicles
- E-bike (30–120 km range)
- E-scooter (10–40 km range)
- E-skateboard (15–30 km range)
- E-unicycle (30–80 km range)

---

## Core differentiators
1. Battery-aware routing — estimates arrival charge using elevation + distance
2. Charger map — sourced from OpenChargeMap, cached in PostGIS
3. Legal zone overlays — riding restrictions by vehicle class and street
4. Surface + gradient routing — avoids rough surfaces for boards, flags steep grades
5. Community reporting — potholes, closed paths, enforcement spots

---

## MVP success metrics (90 days post-launch)
- 500+ DAU
- 40%+ D30 retention
- 4.2+ app store rating
- 3 charger network partnerships
- Range estimate accuracy within 15% of real-world (user-reported)

---

## Iterative development milestones

### Milestone 1 — Map shell + location
**Goal:** working map centered on user location, both web and mobile.
Nothing else is buildable without this.

Web tasks:
- |COMPLETED| Next.js scaffolded, Vercel connected, deploys on push
- |COMPLETED|Mapbox GL JS full-screen map renders (dynamic import, no SSR)
- |COMPLETED|User location dot on map, map re-centers on load

Mobile tasks:
- Expo app scaffolded
- @rnmapbox/maps renders on Android physical device
- User location working via expo-location

Deliverable: open app, see map centered on your location. Web and mobile.

---

### Milestone 2 — Search + basic routing
**Goal:** user searches a destination, sees a cycling route drawn on the map.
This is the core interaction loop — validate it works before adding PEV logic.

Tasks:
- Search bar with Mapbox Geocoding autocomplete
- Destination pin dropped on map on result selection
- Mapbox Directions API called server-side (Next.js API route, cycling profile)
- Route line rendered on map
- Distance + estimated travel time shown in route card
- Same flow on mobile

Deliverable: search for a destination, see a cycling route drawn from current location.

---

### Milestone 3 — Vehicle profiles + battery model
**Goal:** the core differentiator. Route shows estimated battery at destination.
This is what makes goPEV different from every other map app.

Tasks:
- Vehicle profile setup screen (type, battery capacity Wh, current charge %)
- Profile stored in Neon (no auth yet — keyed to localStorage user ID)
- Elevation data fetched per route from Mapbox Terrain API
- Battery drain formula: drain = (distance_km × base_rate) + (elevation_gain_m × hill_factor)
  base_rate and hill_factor are per vehicle type constants — tune after user feedback
- "Arrive with ~X% battery" shown on route card
- Warning state when estimated drain > current charge
- Vehicle type affects routing preference (e.g. e-wheelchair avoids stairs/steep grades)

Deliverable: set up an e-bike at 60% charge, route somewhere hilly, see battery estimate
and warning if charge is tight.

Battery model constants (starting values, tune with real data):
| Vehicle | base_rate (Wh/km) | hill_factor (Wh/m) |
|---|---|---|
| E-bike | 10 | 0.05 |
| E-scooter | 15 | 0.08 |
| E-skateboard | 20 | 0.12 |
| E-unicycle | 12 | 0.06 |
| E-wheelchair | 18 | 0.09 |

---

### Milestone 4 — Charger map
**Goal:** when the battery warning fires, user can immediately find and route to a charger.
Closes the core anxiety loop.

Tasks:
- OpenChargeMap API called server-side by bounding box of current map view
- Charger pins on map with distinct icon
- Charger popup: connector type, hours, cost, last verified date
- "Route to charger" button on popup
- Chargers cached in Neon as PostGIS point geometry (reduces API calls, enables
  spatial queries later)
- Cache invalidation: re-fetch from OpenChargeMap if cached entry is >7 days old

Deliverable: battery warning fires, user taps nearest charger, gets routed there.

---

### Milestone 5 — Auth + persistent profiles
**Goal:** profiles and saved routes persist across sessions.
Deliberately deferred until the core loop is validated — auth adds zero user value
until there is something worth saving.

Tasks:
- NextAuth.js with Google OAuth (one provider only)
- User table in Neon
- Vehicle profiles linked to user ID (migrate from localStorage)
- Saved routes: save and re-open a route
- Mobile: Google OAuth via Expo AuthSession

Deliverable: sign in with Google, vehicle profile remembered, saved routes persist.

---

### Milestone 6 — Legal zones + community layer
**Goal:** deepen the moat. Route avoids restricted zones, users contribute hazard data.
Start with one city you know well — do not attempt multi-city at launch.

Tasks:
- Legal zone polygons stored as PostGIS geometry in Neon
- Zones rendered as colored overlays on map
- Route warns if it passes through a zone restricted for user's vehicle type
- Community hazard reporting — tap map to flag pothole, closed path, enforcement
- Hazard pins on map with age indicator (fades after 7 days without confirmation)

Deliverable: route avoids a scooter-restricted road, user reports a pothole, it
appears for other users.

---

## Post-MVP backlog (do not build yet)
- Range bubble visualization (reachable area ring)
- Multi-leg trip planner with auto-inserted charge stops
- Weather-adjusted range (Open-Meteo wind + temperature)
- Theft / safe lock-up scoring
- Fleet / rental API integrations (Lime, Bird)
- Self-hosted Valhalla routing engine
- Separate Node.js API server (extract from Next.js API routes)
- Turborepo monorepo with shared packages
- Web PWA (next-pwa — nearly free once Next.js is solid)
- SEO city route pages (/routes/vancouver-ebike etc.)
- B2B fleet dashboard
- City admin portal for legal zone management

---

## Deployment targets
- Web: Vercel (auto-deploy on push to main)
- Mobile Android: Google Play via EAS Submit
- Mobile iOS: App Store via EAS Submit + TestFlight

## Store accounts needed
- Google Play Console: one-time $25 USD
- Apple Developer Program: $99 USD/year
