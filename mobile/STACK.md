# goPEV Mobile — Stack Details

## Core dependencies

### Framework
- expo (SDK 51+)
- expo-router — file-based navigation
- react-native
- react@18
- typescript@5

### Map
- @rnmapbox/maps — Mapbox GL for React Native
  Requires a dev build — does not work with Expo Go

### Location
- expo-location — GPS, background location, geofencing
  Background tracking needs foreground service permission on Android

### State + data
- zustand — local state
- @tanstack/react-query — API calls + caching
- @react-native-async-storage/async-storage — persistent storage (vehicle profile
  before auth is added)

### Navigation
- expo-router (built on React Navigation)

### UI
- react-native core components (View, Text, Pressable, TextInput)
- No UI library — keep it lean at MVP stage

### Auth (Milestone 5)
- expo-auth-session — OAuth flow
- Google provider only to start

---

## Dev dependencies
- @types/react
- @types/react-native
- eslint
- eslint-config-expo
- prettier
- typescript

---

## app.json baseline
```json
{
  "expo": {
    "name": "goPEV",
    "slug": "gopev",
    "version": "1.0.0",
    "orientation": "portrait",
    "newArchEnabled": false,
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.gopev.app",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "FOREGROUND_SERVICE"
      ]
    },
    "ios": {
      "bundleIdentifier": "com.gopev.app",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "goPEV needs your location to show your position on the map and calculate routes.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "goPEV uses background location to track your route while navigating."
      }
    },
    "plugins": [
      "expo-router",
      "expo-location",
      [
        "@rnmapbox/maps",
        { "RNMapboxMapsDownloadToken": "YOUR_REMOVED" }
      ]
    ]
  }
}
```

---

## Mapbox setup in React Native

### Initialize token in root layout
```tsx
// app/_layout.tsx
import RNMapboxMaps from '@rnmapbox/maps'

RNMapboxMaps.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN!)
```

### Basic map component
```tsx
// components/map/MapView.tsx
import MapboxGL from '@rnmapbox/maps'
import { StyleSheet, View } from 'react-native'

export default function MapView() {
  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
          zoomLevel={13}
          centerCoordinate={[-123.3656, 48.4284]}
          animationMode="none"
        />
        <MapboxGL.UserLocation visible={true} />
      </MapboxGL.MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
})
```

---

## Connecting to the web API from the device

The mobile app calls goPEV's Next.js API routes — not Mapbox directly.

In development, your phone and dev machine must be on the same Wi-Fi network.
Use your machine's local IP, not localhost:

```bash
# find your local IP on Windows
ipconfig
# look for IPv4 Address under your Wi-Fi adapter, e.g. 192.168.1.42
```

Set in .env.local:
```
EXPO_PUBLIC_API_URL=http://192.168.1.42:3000
```

In production, set:
```
EXPO_PUBLIC_API_URL=https://your-app.vercel.app
```

---

## API call pattern
```ts
// lib/api/directions.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL

export async function getDirections(
  origin: [number, number],
  destination: [number, number]
) {
  const res = await fetch(`${API_URL}/api/directions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin, destination }),
  })

  if (!res.ok) throw new Error('Directions request failed')
  const { data } = await res.json()
  return data
}
```

---

## Location permission pattern
```ts
// lib/location.ts
import * as Location from 'expo-location'

export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== 'granted') throw new Error('Location permission denied')
}

export async function getCurrentPosition() {
  return Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  })
}
```

---

## AsyncStorage — vehicle profile persistence (pre-auth)
```ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { VehicleProfile } from '../types/vehicle'

const KEY = 'gopev_vehicle_profile'

export async function saveProfile(profile: VehicleProfile) {
  await AsyncStorage.setItem(KEY, JSON.stringify(profile))
}

export async function loadProfile(): Promise<VehicleProfile | null> {
  const raw = await AsyncStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : null
}
```
