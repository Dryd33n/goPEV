import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import MapLoader from '@/components/map/MapLoader'

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 min-h-0">
        <MapLoader />
      </main>
      <Footer />
    </div>
  )
}
