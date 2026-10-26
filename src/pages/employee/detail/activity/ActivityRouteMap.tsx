import { useEffect, useMemo, useRef, useState } from 'react'
import * as ReactDOM from 'react-dom'
import GoogleMapReact, {
  type GoogleMapInstance,
  type GoogleMapsApi,
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

export function ActivityRouteMap({ points, loading }: ActivityRouteMapProps) {
  const mapRef = useRef<GoogleMapInstance | null>(null)
  const mapsRef = useRef<GoogleMapsApi | null>(null)
  const lineRef = useRef<{
    setMap: (map: GoogleMapInstance | null) => void
  } | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const line = useMemo(() => routeLine(points), [points])
  const markers = points.filter(
    (point) => point.markerFlag === 1 && MARKER_COLOR[point.type ?? 0],
  )
  const center = line[0] ?? { lat: 20.5937, lng: 78.9629 }

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
    <div className="glass-panel h-96 overflow-hidden">
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
    </div>
  )
}
