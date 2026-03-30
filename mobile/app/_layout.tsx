import { Stack } from 'expo-router'
import RNMapboxMaps from '@rnmapbox/maps'

RNMapboxMaps.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '')

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}
