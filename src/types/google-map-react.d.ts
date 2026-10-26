declare module 'google-map-react' {
  import type { ReactNode } from 'react'

  export interface GoogleMapInstance {
    fitBounds: (bounds: object) => void
    setCenter: (point: { lat: number; lng: number }) => void
    setZoom: (zoom: number) => void
  }

  export interface GoogleMapsApi {
    Polyline: new (options: {
      path: Array<{ lat: number; lng: number }>
      geodesic?: boolean
      strokeColor?: string
      strokeOpacity?: number
      strokeWeight?: number
    }) => { setMap: (map: GoogleMapInstance | null) => void }
    LatLngBounds: new () => {
      extend: (point: { lat: number; lng: number }) => void
    }
  }

  export interface GoogleMapReactProps {
    bootstrapURLKeys: { key: string }
    defaultCenter: { lat: number; lng: number }
    defaultZoom: number
    yesIWantToUseGoogleMapApiInternals?: boolean
    onGoogleApiLoaded?: (maps: {
      map: GoogleMapInstance
      maps: GoogleMapsApi
    }) => void
    children?: ReactNode
  }

  export default function GoogleMapReact(props: GoogleMapReactProps): ReactNode
}
