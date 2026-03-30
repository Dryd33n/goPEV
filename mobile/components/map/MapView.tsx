import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import MapboxGL from '@rnmapbox/maps'
import * as Location from 'expo-location'

export default function MapView() {
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted')
    })
  }, [])

  return (
    <View style={styles.container}>
      <MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Street}>
        {hasPermission && (
          <>
            <MapboxGL.Camera followUserLocation followZoomLevel={14} />
            <MapboxGL.UserLocation visible />
          </>
        )}
      </MapboxGL.MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
})
