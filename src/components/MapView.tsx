"use client";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useEffect } from "react";
import { LocateFixed } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Business } from "@/lib/types";
import { categoryColor, safeLatLng } from "@/lib/format";

function pinIcon(color: string): L.DivIcon {
  return L.divIcon({
    html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 11.25 15 25 15 25s15-13.75 15-25C30 6.7 23.3 0 15 0z" fill="${color}"/>
      <circle cx="15" cy="15" r="6" fill="white"/>
    </svg>`,
    className: "",
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  });
}

function userLocationIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82c4;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export const TIRANA_CENTER: [number, number] = [41.3275, 19.8187];

function RecenterOnChange({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function RecenterButton({
  target,
  onUnavailable,
}: {
  target: [number, number] | null;
  onUnavailable?: (reason: "insecure" | "denied") => void;
}) {
  const map = useMap();

  function handleClick() {
    if (target) {
      map.setView(target, 15);
      return;
    }
    if (!("geolocation" in navigator)) {
      onUnavailable?.("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 15),
      () => onUnavailable?.(window.isSecureContext ? "denied" : "insecure"),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="absolute bottom-4 right-4 z-[1000] flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary shadow-lift transition-transform hover:scale-105"
      aria-label="Recenter on my location"
    >
      <LocateFixed size={20} />
    </button>
  );
}

export function MapView({
  businesses,
  center,
  userPosition,
  recenterTarget,
  onMarkerClick,
  onLocationUnavailable,
}: {
  businesses: Business[];
  /** Where the map's viewport should point — may be the user's location,
   * or a search result's coordinates, or anything else. Purely about
   * camera position. */
  center?: [number, number];
  /**
   * The user's own real, fixed geolocation — used ONLY to place the
   * blue "you are here" dot. Deliberately a separate prop from `center`:
   * previously the dot's position was bound to `center` directly, which
   * meant that whenever a search moved the map's viewport to point at a
   * business instead, the "you are here" dot moved right along with it
   * to that business's coordinates — a real bug, not a display quirk.
   * This value never changes just because the camera moves elsewhere.
   */
  userPosition?: [number, number] | null;
  /** The user's own real location, if already resolved — used as the
   * recenter button's first choice. If null/omitted, the button still
   * renders and makes a fresh geolocation request when clicked, rather
   * than disappearing. */
  recenterTarget?: [number, number] | null;
  /** Called with the tapped business instead of showing Leaflet's own
   * cramped native popup — the caller renders a richer overview card
   * (see BusinessOverviewCard) matching the mobile app's marker bottom
   * sheet, which a tiny Leaflet Popup bubble can't reasonably reproduce. */
  onMarkerClick?: (business: Business) => void;
  /** Called if the recenter button's fresh geolocation attempt also
   * fails, so the caller can explain why (e.g. via a toast) instead of
   * the button just doing nothing a second time. */
  onLocationUnavailable?: (reason: "insecure" | "denied") => void;
}) {
  const effectiveCenter = center || TIRANA_CENTER;

  return (
    <MapContainer
      center={effectiveCenter}
      zoom={13}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
    >
      <RecenterOnChange center={effectiveCenter} zoom={13} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userPosition && (
        <Marker position={userPosition} icon={userLocationIcon()} />
      )}
      {businesses.map((b) => {
        const position = safeLatLng(b.latitude, b.longitude);
        if (!position) return null; // skip rather than render at a broken/NaN position
        return (
          <Marker
            key={b.id}
            position={position}
            icon={pinIcon(categoryColor(b.category))}
            eventHandlers={{ click: () => onMarkerClick?.(b) }}
          />
        );
      })}
      <RecenterButton target={recenterTarget ?? null} onUnavailable={onLocationUnavailable} />
    </MapContainer>
  );
}