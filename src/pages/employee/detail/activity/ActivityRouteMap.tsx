import { useEffect, useMemo, useRef, useState } from 'react'
import * as ReactDOM from 'react-dom'
import GoogleMapReact, {
  type GoogleMapInstance,
  type GoogleMapsApi,
  type MapOverlay,
} from 'google-map-react'
import { MapPin } from 'lucide-react'
import { Loader } from '@/components/atoms/Loader'
import type { TrackingPoint } from '@/utils/employeeDetail'

const reactDom = ReactDOM as typeof ReactDOM & {
  default?: { findDOMNode?: (node: unknown) => Element | Text | null }
}

if (reactDom.default && typeof reactDom.default.findDOMNode !== 'function') {
  reactDom.default.findDOMNode = (node) =>
    node instanceof Element || node instanceof Text ? node : null
}

const GOOGLE_MAPS_KEY = 'AIzaSyCbNiXy38CoKDUFPAsa6haWBcyJgXS3UQM'

const MARKER_COLOR: Record<number, string> = {
  1: 'var(--success)',
  2: 'var(--warning)',
  3: 'var(--primary)',
  4: 'var(--error)',
}

type ActivityRouteMapProps = {
  points: TrackingPoint[]
  loading: boolean
}

type MapPoint = { lat: number; lng: number }

function themeColor(token: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim()
}

function LocationPin({ color }: { lat: number; lng: number; color: string }) {
  return (
    <span className="absolute -translate-x-1/2 -translate-y-full">
      <MapPin className="size-7" style={{ color }} aria-hidden />
    </span>
  )
}

function routeLine(points: TrackingPoint[]) {
  return points.reduce<MapPoint[]>((line, point) => {
    const previous = line[line.length - 1]
    if (previous && previous.lat === point.lat && previous.lng === point.lng) {
      return line
    }
    line.push({ lat: point.lat, lng: point.lng })
    return line
  }, [])
}

type WalkingRoute = {
  createPolylines: () => MapOverlay[]
  path?: unknown[]
}

type RoutesLibrary = {
  Route: {
    computeRoutes: (request: {
      origin: MapPoint
      destination: MapPoint
      travelMode: 'WALK'
      fields: Array<'path'>
    }) => Promise<{ routes?: WalkingRoute[] }>
  }
}

function loadRoutesLibrary() {
  const maps = (
    window as Window & {
      google?: {
        maps?: { importLibrary?: (name: string) => Promise<RoutesLibrary> }
      }
    }
  ).google?.maps

  if (!maps?.importLibrary) {
    return Promise.reject(new Error('Routes library is unavailable'))
  }

  return maps.importLibrary('routes')
}

function mapPoint(value: unknown): MapPoint | null {
  if (!value || typeof value !== 'object') return null
  const record = value as {
    lat?: number | (() => number)
    lng?: number | (() => number)
  }
  const lat = typeof record.lat === 'function' ? record.lat() : record.lat
  const lng = typeof record.lng === 'function' ? record.lng() : record.lng
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  return { lat, lng }
}

export function ActivityRouteMap({ points, loading }: ActivityRouteMapProps) {
  const mapRef = useRef<GoogleMapInstance | null>(null)
  const mapsRef = useRef<GoogleMapsApi | null>(null)
  const lineRef = useRef<MapOverlay | null>(null)
  const walkingRef = useRef<MapOverlay[]>([])
  const walkerRef = useRef<
    (MapOverlay & { setPosition: (position: MapPoint) => void }) | null
  >(null)
  const animationRef = useRef(0)
  const requestId = useRef(0)
  const [mapReady, setMapReady] = useState(false)
  const [routing, setRouting] = useState(false)
  const line = useMemo(() => routeLine(points), [points])
  const markers = points.filter(
    (point) => point.markerFlag === 1 && MARKER_COLOR[point.type ?? 0],
  )
  const center = line[0] ?? { lat: 20.5937, lng: 78.9629 }
  const origin = line[0]
  const destination = line[line.length - 1]
  const canStart = Boolean(
    origin &&
    destination &&
    (origin.lat !== destination.lat || origin.lng !== destination.lng),
  )

  const clearWalkingRoute = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    animationRef.current = 0
    walkingRef.current.forEach((overlay) => overlay.setMap(null))
    walkingRef.current = []
    walkerRef.current?.setMap(null)
    walkerRef.current = null
  }

  const walkMarker = (maps: GoogleMapsApi, path: MapPoint[]) => {
    const map = mapRef.current
    if (!map || path.length === 0) return

    try {
      const walker = new maps.Marker({
        map,
        position: path[0],
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: themeColor('--primary') || '#4f46e5',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      })
      walkerRef.current = walker

      const duration = Math.min(15000, Math.max(4000, path.length * 30))
      const started = performance.now()
      const tick = (now: number) => {
        const progress = Math.min(1, (now - started) / duration)
        const index = Math.round(progress * (path.length - 1))
        walker.setPosition(path[index])
        if (progress < 1) animationRef.current = requestAnimationFrame(tick)
      }
      animationRef.current = requestAnimationFrame(tick)
    } catch {
      walkerRef.current = null
    }
  }

  const showTrackedWalk = (maps: GoogleMapsApi, path: MapPoint[]) => {
    const map = mapRef.current
    if (!map || path.length < 2) return

    clearWalkingRoute()
    const polyline = new maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#1a73e8',
      strokeOpacity: 1,
      strokeWeight: 5,
    })
    polyline.setMap(map)
    walkingRef.current = [polyline]
    walkMarker(maps, path)

    const bounds = new maps.LatLngBounds()
    path.forEach((point) => bounds.extend(point))
    map.fitBounds(bounds)
  }

  const startWalkingDirections = async () => {
    const map = mapRef.current
    const maps = mapsRef.current
    if (!map || !maps || !origin || !destination || !canStart) return

    const request = ++requestId.current
    setRouting(true)

    try {
      const { Route } = await loadRoutesLibrary()
      if (request !== requestId.current) return

      const { routes } = await Route.computeRoutes({
        origin,
        destination,
        travelMode: 'WALK',
        fields: ['path'],
      })
      if (request !== requestId.current) return

      const route = routes?.[0]
      const polylines = route?.createPolylines() ?? []
      const routePath = (route?.path ?? [])
        .map((point) => mapPoint(point))
        .filter((point): point is MapPoint => point !== null)

      if (!polylines.length) {
        showTrackedWalk(maps, line)
        return
      }

      clearWalkingRoute()
      polylines.forEach((polyline) => polyline.setMap(map))
      walkingRef.current = polylines
      walkMarker(maps, routePath.length > 1 ? routePath : line)

      const bounds = new maps.LatLngBounds()
      ;(routePath.length > 1 ? routePath : line).forEach((point) =>
        bounds.extend(point),
      )
      map.fitBounds(bounds)
    } catch {
      if (request !== requestId.current) return
      showTrackedWalk(maps, line)
    } finally {
      if (request === requestId.current) setRouting(false)
    }
  }

  useEffect(() => {
    const map = mapRef.current
    const maps = mapsRef.current
    if (!mapReady || !map || !maps || line.length === 0) return

    if (line.length === 1) {
      map.setCenter(line[0])
      map.setZoom(15)
      return
    }

    lineRef.current?.setMap(null)
    const stroke = themeColor('--primary')
    const polyline = new maps.Polyline({
      path: line,
      geodesic: true,
      strokeColor: stroke,
      strokeOpacity: 1,
      strokeWeight: 4,
    })
    polyline.setMap(map)
    lineRef.current = polyline

    const bounds = new maps.LatLngBounds()
    line.forEach((point) => bounds.extend(point))
    map.fitBounds(bounds)

    return () => {
      polyline.setMap(null)
    }
  }, [line, mapReady])

  useEffect(() => {
    return () => {
      requestId.current += 1
      setRouting(false)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      animationRef.current = 0
      walkingRef.current.forEach((overlay) => overlay.setMap(null))
      walkingRef.current = []
      walkerRef.current?.setMap(null)
      walkerRef.current = null
    }
  }, [line, mapReady])

  if (loading) {
    return (
      <div className="glass-panel grid h-96 place-items-center">
        <Loader label="Loading route" size={32} />
      </div>
    )
  }

  if (!points.length) {
    return (
      <div className="glass-panel grid h-96 place-items-center text-sm text-text-muted">
        No route recorded for this date.
      </div>
    )
  }

  return (
    <div className="glass-panel relative h-96 overflow-hidden">
      <GoogleMapReact
        bootstrapURLKeys={{ key: GOOGLE_MAPS_KEY }}
        defaultCenter={center}
        defaultZoom={15}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => {
          mapRef.current = map
          mapsRef.current = maps
          setMapReady(true)
        }}
      >
        {markers.map((point, index) => (
          <LocationPin
            key={`${point.lat}-${point.lng}-${index}`}
            lat={point.lat}
            lng={point.lng}
            color={MARKER_COLOR[point.type ?? 0]}
          />
        ))}
      </GoogleMapReact>
      <button
        type="button"
        onClick={startWalkingDirections}
        disabled={!mapReady || !canStart || routing}
        className="absolute top-3 right-3 z-10 h-10 cursor-pointer rounded-[14px] bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        Start
      </button>
    </div>
  )
}
