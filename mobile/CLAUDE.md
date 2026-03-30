# goPEV Mobile — Claude Code Instructions

## What this app is
The Expo React Native app for goPEV. Targets Android (primary — developer is on Windows
with an Android device) and iOS (via EAS cloud builds). See ../STACK.md and ../PLAN.md
for full context.

## Folder structure
```
mobile/
  app/
    (tabs)/
      map.tsx               # Main map tab
      profile.tsx           # Vehicle profile tab
    setup.tsx               # First-run vehicle setup screen
    _layout.tsx             # Root layout with Expo Router
  components/
    map/
      MapView.tsx           # @rnmapbox/maps full-screen map
      RouteLayer.tsx        # Route GeoJSON layer
      ChargerLayer.tsx      # Charger pins layer
      UserLocationPuck.tsx  # User location indicator
    route/
      RouteCard.tsx         # Distance, time, battery estimate
      SearchBar.tsx         # Geocoding autocomplete
    vehicle/
      VehicleProfileForm.tsx
      BatteryIndicator.tsx
    ui/                     # Generic reusable components
  lib/
    api/
      directions.ts         # Calls goPEV web API routes
      chargers.ts           # Calls goPEV web API routes
      geocoding.ts          # Calls goPEV web API routes
    battery/
      model.ts              # Same battery logic as web — duplicated intentionally
      constants.ts          # Per-vehicle constants
    store/
      index.ts              # Zustand store
    types/
      vehicle.ts            # VehicleType, VehicleProfile — duplicated from web
      route.ts              # Route types — duplicated from web
      charger.ts            # Charger types — duplicated from web
  assets/
    fonts/
    images/
  eas.json                  # EAS build profiles
  app.json                  # Expo config
  .env.local                # Never committed
  .env.example
```

## Key rules for this app

### API calls
- Mobile does NOT call Mapbox APIs directly — all requests go through the goPEV
  web API routes (Next.js)
- This keeps Mapbox tokens off the device and means both apps share one API surface
- API base URL in .env: EXPO_PUBLIC_API_URL
- In development: EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000 (not localhost —
  the Android device is on a different network interface than the dev machine)

### Duplicate types and logic
- lib/types/ and lib/battery/ are intentional duplicates of web/lib/types/ and
  web/lib/battery/
- Do not try to share them via a package yet — that complexity is not worth it now
- When types diverge from web, fix both files — note them with a comment:
  // SYNC: keep in sync with web/lib/types/vehicle.ts

### Map
- Use @rnmapbox/maps — not react-native-maps
- Requires a dev build (cannot use Expo Go) — see DEV_ENVIRONMENT.md
- Mapbox token set via RNMapbox.setAccessToken() in app/_layout.tsx
- EXPO_PUBLIC_MAPBOX_TOKEN is the public token (safe to include in the app bundle)

### Navigation
- Expo Router (file-based) — same mental model as Next.js App Router
- Tab navigation for main app: map tab and profile tab
- Stack navigation for setup flow

### State
- Zustand for local state (same library as web)
- React Query for API calls
- AsyncStorage for persisting vehicle profile before auth is added (Milestone 5)

### React Native Architecture
- Use the OLD architecture (not Fabric/New Architecture)
- @rnmapbox/maps and expo-location do not fully support the new architecture yet
- Do not enable newArchEnabled in app.json

### Background location
- expo-location handles background GPS
- Test on a real physical Android device — emulator GPS is unreliable
- iOS background location behaviour differs significantly from Android —
  test on a real iPhone before shipping (via TestFlight)

## Environment variables
```
# .env.local (never commit)
EXPO_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...   # public token, safe in app bundle
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000  # your machine's local IP for dev
                                              # or deployed Vercel URL for staging
```

Note: Expo public env vars use EXPO_PUBLIC_ prefix (not NEXT_PUBLIC_).
All env vars in Expo are bundled into the app — there is no server-side.
Never put secret tokens in mobile env vars.

## Running locally
```bash
cd mobile
pnpm install
cp .env.example .env.local
# fill in .env.local

# start Metro bundler
pnpm start

# on a connected Android device (USB debugging enabled)
pnpm android

# or scan QR code with Expo Go for JS-only changes
# (Expo Go will NOT work once @rnmapbox/maps is added — need dev build)
```

## EAS build profiles (eas.json)
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

- development: installs a dev client APK — enables fast refresh with native modules
- preview: unsigned APK for internal testing without Play Store
- production: signed AAB for Play Store / IPA for App Store

## Building and deploying

### First dev build (run once after adding @rnmapbox/maps)
```bash
eas build --profile development --platform android
# installs via QR code or direct link — takes ~10 min first time
```

### Production build + submit
```bash
# build both platforms
eas build --profile production --platform all

# submit to stores
eas submit --platform android   # to Google Play
eas submit --platform ios       # to App Store Connect
```
