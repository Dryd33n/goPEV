'use client'
import Link from 'next/link'
import { useState } from 'react'

type RideMode = 'Relaxed' | 'Normal' | 'Aggressive'
type RoutePreference = 'Fastest' | 'Safest' | 'Most Scenic'

// Placeholder — replace with real user vehicles fetched from DB
const USER_VEHICLES: { id: string; label: string }[] = [
  { id: 'ebike-1', label: 'Trek Allant+ 7' },
  { id: 'scooter-1', label: 'Segway Ninebot Max' },
]

const RIDE_MODES: RideMode[] = ['Relaxed', 'Normal', 'Aggressive']
const ROUTE_PREFS: RoutePreference[] = ['Fastest', 'Safest', 'Most Scenic']

export default function NavigationModal() {
  const [isOpen, setIsOpen] = useState(true)
  const [useCustomOrigin, setUseCustomOrigin] = useState(false)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [rideMode, setRideMode] = useState<RideMode>('Normal')
  const [chargePercent, setChargePercent] = useState(100)
  const [routePref, setRoutePref] = useState<RoutePreference>('Fastest')
  const [vehicle, setVehicle] = useState(USER_VEHICLES[0]?.id ?? '')

  return (
    <div className="absolute top-0 left-0 h-full z-10 flex py-2 pl-2">
      {isOpen && (
        <div
          className="w-96 h-full bg-white shadow-lg rounded-lg flex flex-col overflow-y-auto"
          style={{ border: '1px solid var(--clr-neutral-a10)' }}
        >

          {/* Title */}
          <div
            className="px-5 pt-5 pb-3"
            style={{ borderBottom: '1px solid var(--clr-neutral-a10)' }}
          >
            <h2
              className="text-sm font-semibold tracking-tight"
              style={{ color: 'var(--clr-neutral-a40)' }}
            >
              Route Planner
            </h2>
          </div>

          {/* Origin / Destination */}
          <div className="px-5 py-4 flex flex-col gap-0">
            {/* Origin */}
            <div className="flex items-center gap-3 py-2.5">
              <div className="shrink-0">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: 'var(--clr-primary-a10)' }}
                />
              </div>
              {useCustomOrigin ? (
                <div
                  className="flex items-center gap-2 flex-1 pb-0.5"
                  style={{ borderBottom: '1px solid var(--clr-neutral-a10)' }}
                >
                  <input
                    type="text"
                    placeholder="Starting point"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    autoFocus
                    className="text-sm w-full outline-none"
                    style={{ color: 'var(--clr-neutral-a40)' }}
                  />
                  <button
                    onClick={() => { setUseCustomOrigin(false); setOrigin('') }}
                    className="shrink-0 transition-opacity opacity-40 hover:opacity-70"
                    aria-label="Use current location"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setUseCustomOrigin(true)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <span className="text-sm" style={{ color: 'var(--clr-neutral-a20)' }}>Current location</span>
                  <span className="text-xs ml-auto transition-colors" style={{ color: 'var(--clr-neutral-a20)' }}>change</span>
                </button>
              )}
            </div>

            {/* Connector line */}
            <div className="flex items-center gap-3 h-4">
              <div className="flex justify-center" style={{ width: '10px' }}>
                <div className="w-px h-full" style={{ backgroundColor: 'var(--clr-neutral-a10)' }} />
              </div>
            </div>

            {/* Destination */}
            <div className="flex items-center gap-3 py-2.5">
              <div className="shrink-0">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: 'var(--clr-accent-a20)' }}
                />
              </div>
              <div
                className="flex-1 pb-0.5"
                style={{ borderBottom: '1px solid var(--clr-neutral-a10)' }}
              >
                <input
                  type="text"
                  placeholder="Destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="text-sm w-full outline-none"
                  style={{ color: 'var(--clr-neutral-a40)' }}
                />
              </div>
            </div>
          </div>

          <div className="mx-5" style={{ borderTop: '1px solid var(--clr-neutral-a10)' }} />

          {/* Vehicle */}
          <div className="px-5 py-4">
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--clr-neutral-a30)' }}
            >
              Vehicle
            </label>
            <div className="relative">
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full rounded-md px-3 py-2 text-sm outline-none appearance-none bg-white cursor-pointer transition-colors"
                style={{
                  border: '1px solid var(--clr-neutral-a10)',
                  color: 'var(--clr-neutral-a40)',
                }}
              >
                {USER_VEHICLES.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: 'var(--clr-neutral-a20)' }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="mx-5" style={{ borderTop: '1px solid var(--clr-neutral-a10)' }} />

          {/* Route Settings */}
          <div className="px-5 py-4 flex flex-col gap-5">
            <span className="text-xs font-medium" style={{ color: 'var(--clr-neutral-a30)' }}>
              Route Settings
            </span>

            {/* Ride Mode */}
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--clr-neutral-a20)' }}>Ride Mode</p>
              <div
                className="flex rounded-md overflow-hidden"
                style={{ border: '1px solid var(--clr-neutral-a10)' }}
              >
                {RIDE_MODES.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setRideMode(mode)}
                    className="flex-1 text-xs py-2 transition-colors"
                    style={
                      rideMode === mode
                        ? { backgroundColor: 'var(--clr-primary-a30)', color: 'var(--clr-neutral-a0)', fontWeight: 500 }
                        : { backgroundColor: 'white', color: 'var(--clr-neutral-a30)', borderRight: '1px solid var(--clr-neutral-a10)' }
                    }
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Battery */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs" style={{ color: 'var(--clr-neutral-a20)' }}>Battery at departure</p>
                <span className="text-xs font-medium" style={{ color: 'var(--clr-primary-a20)' }}>{chargePercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={chargePercent}
                onChange={(e) => setChargePercent(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: 'var(--clr-primary-a20)' }}
              />
            </div>

            {/* Route Preference */}
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--clr-neutral-a20)' }}>Route Preference</p>
              <div className="flex flex-col gap-2.5">
                {ROUTE_PREFS.map((pref) => (
                  <label key={pref} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="routePref"
                      value={pref}
                      checked={routePref === pref}
                      onChange={() => setRoutePref(pref)}
                      style={{ accentColor: 'var(--clr-primary-a20)' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--clr-neutral-a40)' }}>{pref}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced route options */}
          <div className="px-5 pb-5 mt-auto">
            <Link
              href="/route-options"
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-md text-xs transition-colors"
              style={{
                border: '1px solid var(--clr-neutral-a10)',
                color: 'var(--clr-neutral-a30)',
              }}
            >
              <span>Advanced route options</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="self-center bg-white shadow-sm rounded-r-md w-5 h-10 flex items-center justify-center transition-colors"
        style={{
          border: '1px solid var(--clr-neutral-a10)',
          borderLeft: 'none',
          color: 'var(--clr-neutral-a20)',
        }}
        aria-label={isOpen ? 'Close navigation panel' : 'Open navigation panel'}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          )}
        </svg>
      </button>
    </div>
  )
}
