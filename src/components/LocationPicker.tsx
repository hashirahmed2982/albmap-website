"use client";

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const pinIcon = L.divIcon({
  html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 11.25 15 25 15 25s15-13.75 15-25C30 6.7 23.3 0 15 0z" fill="#E31320"/>
    <circle cx="15" cy="15" r="6" fill="white"/>
  </svg>`,
  className: "",
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

const TIRANA_CENTER: [number, number] = [41.3275, 19.8187];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Recenters exactly once, the first time a real geolocation position
 * becomes available — deliberately not on every change, since `value`
 * (the picked business location) updates on every click as the owner
 * places their pin, and re-snapping the view back each time would fight
 * their own map panning/zooming. This only reacts to `defaultCenter`
 * (the user's own current position, resolved asynchronously after the
 * map has already mounted with the Tirana fallback).
 */
function RecenterOnce({ center }: { center: [number, number] | null }) {
  const map = useMap();
  const hasRecentered = useRef(false);

  useEffect(() => {
    if (center && !hasRecentered.current) {
      map.setView(center, 14);
      hasRecentered.current = true;
    }
  }, [center, map]);

  return null;
}

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
  return (
    <MapContainer
      center={value ? [value.lat, value.lng] : defaultCenter || TIRANA_CENTER}
      zoom={13}
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
    >
      <RecenterOnce center={defaultCenter || null} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onChange} />
      {value && <Marker position={[value.lat, value.lng]} icon={pinIcon} />}
    </MapContainer>
  );
}
