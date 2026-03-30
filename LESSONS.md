# goPEV — Lessons Learned

## Next.js 16: `ssr: false` must live in a Client Component

**Error:**
```
`ssr: false` is not allowed with `next/dynamic` in Server Components.
Please move it into a Client Component.
```

**What happened:** Placing `dynamic(() => import('...'), { ssr: false })` directly in `app/page.tsx` (a Server Component by default) throws a build error in Next.js 16.

**Fix:** Extract the dynamic import into a dedicated `'use client'` wrapper component, then import that from the page.

```tsx
// components/map/MapLoader.tsx
'use client'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-gray-100" />,
})

export default function MapLoader() {
  return <MapView />
}
```

```tsx
// app/page.tsx  (stays a Server Component — no 'use client' needed)
import MapLoader from '@/components/map/MapLoader'

export default function Home() {
  return <MapLoader />
}
```

**Rule:** Any `dynamic(..., { ssr: false })` call must be inside a `'use client'` file. This is a breaking change from Next.js 13/14 where it worked directly in pages.

---

## @rnmapbox/maps: `RNMapboxMapsDownloadToken` in app.json is deprecated

**Warning:**
```
⚠️ WARNING: RNMapboxMapsDownloadToken is deprecated. Use RNMAPBOX_MAPS_DOWNLOAD_TOKEN environment variable instead.
⚠️ WARNING: This token will be part of your gradle.properties. Be careful about committing it to source control.
```

**What happened:** Passing the Mapbox secret download token via the plugin config in `app.json` is deprecated and insecure — it gets written into `gradle.properties` which can be committed.

**Fix:** Remove the token from `app.json` and use the `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` environment variable instead. For EAS builds, set it as an EAS secret:

```bash
eas secret:create --scope project --name RNMAPBOX_MAPS_DOWNLOAD_TOKEN --value sk.eyJ1...
```

```json
// app.json — just the plugin name, no token object
"plugins": [
  "expo-router",
  "expo-location",
  "@rnmapbox/maps"
]
```

**Rule:** Never put the Mapbox secret token in `app.json`. Use `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` as an env var or EAS secret.
