import { useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import MapboxGL from '@rnmapbox/maps'
import * as Location from 'expo-location'

export default function MapView() {
  const [hasPermission, setHasPermission] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const cameraRef = useRef<MapboxGL.Camera>(null)

  // Delay mounting MapView to give native view managers time to initialize
  useEffect(() => {
    const timer = setTimeout(() => setMapReady(true), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') return
      setHasPermission(true)
      Location.getCurrentPositionAsync({}).then((loc) => {
        setUserCoords([loc.coords.longitude, loc.coords.latitude])
      })
    })
  }, [])

  useEffect(() => {
    if (mapLoaded && userCoords && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: userCoords,
        zoomLevel: 14,
        animationDuration: 0,
      })
    }
  }, [mapLoaded, userCoords])

  return (
    <View style={styles.container}>
      {mapReady && (
        <MapboxGL.MapView
          style={styles.map}
          styleURL={MapboxGL.StyleURL.Street}
          onDidFinishLoadingMap={() => setMapLoaded(true)}
        >
          <MapboxGL.Camera ref={cameraRef} />
          {hasPermission && mapLoaded && <MapboxGL.UserLocation visible />}
        </MapboxGL.MapView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
})
