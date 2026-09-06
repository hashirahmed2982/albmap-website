"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useEffect, useRef } from "react";
import { DARK_MAP_STYLE } from "@/lib/map-style";
import { GOOGLE_MAPS_API_KEY } from "@/lib/google-maps";

const PIN_SVG = `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M15 0C6.7 0 0 6.7 0 15c0 11.25 15 25 15 25s15-13.75 15-25C30 6.7 23.3 0 15 0z" fill="#E31320"/>
  <circle cx="15" cy="15" r="6" fill="white"/>
</svg>`;

function pinIcon(): google.maps.Icon {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(PIN_SVG)}`,
    scaledSize: new google.maps.Size(30, 40),
    anchor: new google.maps.Point(15, 40),
  };
}

const TIRANA_CENTER: google.maps.LatLngLiteral = { lat: 41.3275, lng: 19.8187 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%", borderRadius: "1rem" };
const MAP_OPTIONS: google.maps.MapOptions = {
  styles: DARK_MAP_STYLE,
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  gestureHandling: "greedy",
};

export function LocationPicker({
  value,
  onChange,
  defaultCenter,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
  /** The owner's own current location, if geolocation resolved — used only
   * to decide where the map first opens; never auto-places the business pin
   * itself, since that still requires a deliberate click. */
  defaultCenter?: [number, number] | null;
}) {
  const { isLoaded } = useJsApiLoader({
    id: "albmap-google-maps",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });
  const mapRef = useRef<google.maps.Map | null>(null);
  const hasRecentered = useRef(false);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);
  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Recenters exactly once, the first time a real geolocation position
  // becomes available — deliberately not on every change, since `value`
  // (the picked business location) updates on every click as the owner
  // places their pin, and re-snapping the view back each time would
  // fight their own map panning/zooming. This only reacts to
  // `defaultCenter` (the owner's own current position, resolved
  // asynchronously after the map has already mounted with the Tirana
  // fallback) — same role the previous Leaflet RecenterOnce played.
  useEffect(() => {
    if (defaultCenter && !hasRecentered.current) {
      mapRef.current?.panTo({ lat: defaultCenter[0], lng: defaultCenter[1] });
      mapRef.current?.setZoom(14);
      hasRecentered.current = true;
    }
  }, [defaultCenter]);

  function handleClick(e: google.maps.MapMouseEvent) {
    if (e.latLng) onChange(e.latLng.lat(), e.latLng.lng());
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-paper-warm">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" />
      </div>
    );
  }

  const initialCenter = value
    ? { lat: value.lat, lng: value.lng }
    : defaultCenter
      ? { lat: defaultCenter[0], lng: defaultCenter[1] }
      : TIRANA_CENTER;

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={initialCenter}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleClick}
      options={MAP_OPTIONS}
    >
      {value && <Marker position={{ lat: value.lat, lng: value.lng }} icon={pinIcon()} />}
    </GoogleMap>
  );
}
