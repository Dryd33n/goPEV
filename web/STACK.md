# goPEV Web — Stack Details

## Core dependencies

### Framework
- next@14 (App Router)
- react@18
- react-dom@18
- typescript@5

### Map
- mapbox-gl — map rendering, route layers, charger pins
- @types/mapbox-gl

### Styling
- tailwindcss
- postcss
- autoprefixer

### State + data
- zustand — client state (vehicle profile, active route, map viewport)
- @tanstack/react-query — server state (API calls, caching)

### Database
- @neondatabase/serverless — Neon Postgres client (edge-compatible)
- Note: use the serverless driver, not node-postgres — Vercel edge functions
  do not support TCP connections

### Auth (Milestone 5)
- next-auth@5 (Auth.js)
- Google OAuth provider only to start

### Utilities
- zod — runtime validation on API route inputs
- date-fns — date formatting (charger cache age, report timestamps)

---

## Dev dependencies
- eslint
- eslint-config-next
- prettier
- @types/node
- @types/react
- @types/react-dom

---

## Mapbox GL JS setup notes

### Dynamic import pattern (required)
```tsx
// app/map/page.tsx
import dynamic from 'next/dynamic'

const MapView = dynamic(
  () => import('@/components/map/MapView'),
  { ssr: false, loading: () => <div className="h-screen bg-gray-100" /> }
)
```

### Map component baseline
```tsx
// components/map/MapView.tsx
'use client'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useRef } from 'react'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-123.3656, 48.4284], // Victoria BC default
      zoom: 13,
    })
    return () => mapRef.current?.remove()
  }, [])

  return <div ref={containerRef} className="h-screen w-full" />
}
```

---

## Neon / PostGIS setup

### Enable PostGIS (run once in Neon SQL editor)
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

### DB client pattern
```ts
// lib/db/index.ts
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)
export { sql }
```

### Example spatial query (nearby chargers)
```ts
// lib/db/chargers.ts
import { sql } from './index'

export async function getChargersNear(lat: number, lng: number, radiusM = 3000) {
  return sql`
    SELECT id, name, connector_types, address,
      ST_AsGeoJSON(location)::json AS geojson
    FROM charger_locations
    WHERE ST_DWithin(
      location::geography,
      ST_MakePoint(${lng}, ${lat})::geography,
      ${radiusM}
    )
    ORDER BY location <-> ST_MakePoint(${lng}, ${lat})::geometry
    LIMIT 50
  `
}
```

---

## API route pattern
```ts
// app/api/directions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDirections } from '@/lib/mapbox/directions'
import { z } from 'zod'

const schema = z.object({
  origin: z.tuple([z.number(), z.number()]),
  destination: z.tuple([z.number(), z.number()]),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  try {
    const data = await getDirections(parsed.data.origin, parsed.data.destination)
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Routing failed' }, { status: 500 })
  }
}
```

---

## Zustand store shape
```ts
// lib/store.ts
import { create } from 'zustand'
import { VehicleProfile } from './types/vehicle'
import { Route } from './types/route'

interface AppStore {
  vehicleProfile: VehicleProfile | null
  setVehicleProfile: (p: VehicleProfile) => void
  activeRoute: Route | null
  setActiveRoute: (r: Route | null) => void
  mapViewport: { center: [number, number]; zoom: number }
  setMapViewport: (v: { center: [number, number]; zoom: number }) => void
}

export const useAppStore = create<AppStore>((set) => ({
  vehicleProfile: null,
  setVehicleProfile: (p) => set({ vehicleProfile: p }),
  activeRoute: null,
  setActiveRoute: (r) => set({ activeRoute: r }),
  mapViewport: { center: [-123.3656, 48.4284], zoom: 13 },
  setMapViewport: (v) => set({ mapViewport: v }),
}))
```
