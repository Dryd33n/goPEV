'use client'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100" />,
})

export default function MapLoader() {
  return <MapView />
}
