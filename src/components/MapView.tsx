"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useEffect, useRef } from "react";
import { LocateFixed } from "lucide-react";
import type { Business } from "@/lib/types";
import { safeLatLng } from "@/lib/format";
import { DARK_MAP_STYLE } from "@/lib/map-style";
import { GOOGLE_MAPS_API_KEY } from "@/lib/google-maps";

/** Every business gets the same marker — the exact asset (public/
 * marker-business.png) the Flutter app uses for its Discover Map, not a
 * per-category-colored pin the app doesn't have an equivalent of. Google
 * Maps markers take an image, not arbitrary HTML/SVG, so this is a plain
 * `icon`, but it's the same asset either way. */
function pinIcon(): google.maps.Icon {
  return {
    url: "/marker-business.png",
    scaledSize: new google.maps.Size(40, 40),
    // The asset's teardrop tip sits at the very bottom-center of its
    // square crop, same as the mobile app's default (0.5, 1.0) anchor.
    anchor: new google.maps.Point(20, 40),
  };
}

function userLocationIcon(): google.maps.Icon {
  const svg = `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6.5" fill="#3b82c4" stroke="white" stroke-width="3"/>
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(16, 16),
    anchor: new google.maps.Point(8, 8),
  };
}

export const TIRANA_CENTER: [number, number] = [41.3275, 19.8187];

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%", borderRadius: "1rem" };

const MAP_OPTIONS: google.maps.MapOptions = {
  styles: DARK_MAP_STYLE,
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  gestureHandling: "greedy",
};

function toLatLngLiteral([lat, lng]: [number, number]): google.maps.LatLngLiteral {
  return { lat, lng };
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
  /** Called with the tapped business instead of showing a cramped native
   * InfoWindow bubble — the caller renders a richer overview card (see
   * BusinessOverviewCard) matching the mobile app's marker bottom sheet,
   * which a tiny popup can't reasonably reproduce. */
  onMarkerClick?: (business: Business) => void;
  /** Called if the recenter button's fresh geolocation attempt also
   * fails, so the caller can explain why (e.g. via a toast) instead of
   * the button just doing nothing a second time. */
  onLocationUnavailable?: (reason: "insecure" | "denied") => void;
}) {
  const { isLoaded } = useJsApiLoader({
    id: "albmap-google-maps",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });
  const mapRef = useRef<google.maps.Map | null>(null);
  const effectiveCenter = center || TIRANA_CENTER;

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);
  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Re-centers whenever `center` actually changes (a search result
  // picked, etc.) — GoogleMap's center/zoom props only set the *initial*
  // view (see onLoad above); this is the one place recentering after the
  // first render happens, same role the previous Leaflet
  // RecenterOnChange component played.
  useEffect(() => {
    mapRef.current?.panTo(toLatLngLiteral(effectiveCenter));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCenter[0], effectiveCenter[1]]);

  function handleRecenterClick() {
    if (recenterTarget) {
      mapRef.current?.panTo(toLatLngLiteral(recenterTarget));
      mapRef.current?.setZoom(15);
      return;
    }
    if (!("geolocation" in navigator)) {
      onLocationUnavailable?.("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        mapRef.current?.setZoom(15);
      },
      () => onLocationUnavailable?.(window.isSecureContext ? "denied" : "insecure"),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-paper-warm">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={toLatLngLiteral(effectiveCenter)}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={MAP_OPTIONS}
      >
        {userPosition && <Marker position={toLatLngLiteral(userPosition)} icon={userLocationIcon()} />}
        {businesses.map((b) => {
          const position = safeLatLng(b.latitude, b.longitude);
          if (!position) return null; // skip rather than render at a broken/NaN position
          return (
            <Marker
              key={b.id}
              position={toLatLngLiteral(position)}
              icon={pinIcon()}
              onClick={() => onMarkerClick?.(b)}
            />
          );
        })}
      </GoogleMap>

      <button
        type="button"
        onClick={handleRecenterClick}
        className="absolute bottom-4 right-4 z-[1000] flex h-11 w-11 items-center justify-center bg-surface text-primary shadow-lift transition-transform hover:scale-105"
        aria-label="Recenter on my location"
      >
        <LocateFixed size={20} />
      </button>
    </div>
  );
}
