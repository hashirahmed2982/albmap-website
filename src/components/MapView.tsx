"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";
import type { Business } from "@/lib/types";
import { safeLatLng } from "@/lib/format";
import { DARK_MAP_STYLE } from "@/lib/map-style";
import { GOOGLE_MAPS_API_KEY } from "@/lib/google-maps";
import { getBusinessesInBounds } from "@/lib/business-api";

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
  // Google only has tiles for latitudes the Mercator projection can
  // represent (~±85°) — zoomed out far enough that the viewport extends
  // past that (e.g. fully zoomed out to see the whole world), the area
  // beyond has no tile to draw, so the map div's own background shows
  // through instead. That default is a plain white/light color, which
  // looked like a broken light-mode band cutting across this otherwise
  // all-dark map. Matching it to the dark style's own base geometry
  // color makes that empty band read as "dark sky", not a bug.
  backgroundColor: "#212121",
};

function toLatLngLiteral([lat, lng]: [number, number]): google.maps.LatLngLiteral {
  return { lat, lng };
}

export function MapView({
  businesses,
  fetchByBounds = false,
  category,
  center,
  userPosition,
  recenterTarget,
  onMarkerClick,
  onResultsChanged,
  onLocationUnavailable,
}: {
  /** Used as-is when `fetchByBounds` is false (e.g. a text search's
   * handful of matches) — ignored entirely when `fetchByBounds` is true,
   * since the map then manages its own marker set. */
  businesses: Business[];
  /** When true, the map fetches its own markers from whatever's actually
   * within its current visible bounds (business.service.js's
   * getBusinessesInBounds), re-fetching on every pan/zoom — instead of
   * relying on the `businesses` prop, which (for normal browsing) is
   * just whatever fixed-size page the caller's own list fetch happened
   * to return. Off by default so existing callers (and the search-
   * result-override case) keep today's behavior unless they opt in. */
  fetchByBounds?: boolean;
  /** Passed through to the bounds query when fetchByBounds is true — a
   * change here re-fetches immediately, same viewport but a different
   * filter. */
  category?: string;
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
  /** Fires whenever the set of markers actually being shown changes —
   * lets the caller reflect the map's real current result count (e.g. an
   * empty-state banner) instead of guessing from its own unrelated list
   * fetch, which has nothing to do with what's in the map's viewport
   * once fetchByBounds is on. */
  onResultsChanged?: (count: number) => void;
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
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [boundsBusinesses, setBoundsBusinesses] = useState<Business[]>([]);
  const effectiveCenter = center || TIRANA_CENTER;
  const displayedBusinesses = fetchByBounds ? boundsBusinesses : businesses;

  // @react-google-maps/api's <GoogleMap> re-applies its `center` prop with
  // map.setCenter() in a useEffect keyed on the prop's *reference*, not its
  // value (see its source — updaterMap.center / the `[map, center]` effect).
  // Passing a freshly-built `{lat, lng}` literal here every render — which
  // is exactly what toLatLngLiteral(effectiveCenter) was doing inline below
  // — meant ANY unrelated re-render (e.g. the bounds re-fetch that runs on
  // every pan/zoom, via onIdle below) created a new object and snapped the
  // map straight back to effectiveCenter, fighting the user's own panning.
  // Memoizing on the actual coordinates keeps the reference stable across
  // re-renders that don't change where the map should be centered.
  const centerLiteral = useMemo(
    () => toLatLngLiteral(effectiveCenter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveCenter[0], effectiveCenter[1]],
  );

  // Re-reads whatever's currently in view and fetches exactly that —
  // this is what makes the map show real coverage instead of a single
  // fixed-size page regardless of how many thousands of rows exist
  // outside it. Swallows errors by just keeping whatever was already
  // showing, rather than blanking the map out on one dropped request.
  const fetchForCurrentBounds = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = map.getBounds();
    if (!bounds) return;
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    try {
      const results = await getBusinessesInBounds({
        swLat: sw.lat(),
        swLng: sw.lng(),
        neLat: ne.lat(),
        neLng: ne.lng(),
        category: category || undefined,
      });
      setBoundsBusinesses(results);
    } catch {
      // Keep the previous marker set rather than clearing the map on a
      // transient network error.
    }
  }, [category]);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      if (fetchByBounds) fetchForCurrentBounds();
    },
    [fetchByBounds, fetchForCurrentBounds],
  );
  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Fires on every pan/zoom once the camera settles — debounced since a
  // single drag or scroll gesture fires several idle-ish events in
  // quick succession, and only the last one (after motion actually
  // stops) should trigger a fetch.
  const onIdle = useCallback(() => {
    if (!fetchByBounds) return;
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    fetchTimeoutRef.current = setTimeout(fetchForCurrentBounds, 400);
  }, [fetchByBounds, fetchForCurrentBounds]);

  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, []);

  // Re-fetches immediately on a category change — same viewport, but the
  // filter changed, so last viewport's data is stale regardless of
  // whether the camera has moved at all.
  useEffect(() => {
    if (fetchByBounds && mapRef.current) fetchForCurrentBounds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, fetchByBounds]);

  // Smoothly animates to `centerLiteral` whenever it actually changes (a
  // search result picked, geolocation resolving, etc.) — GoogleMap's own
  // `center` prop (above) also re-centers on a change, but instantly via
  // setCenter(); panTo() here gives that same recenter a smooth animation
  // instead, same role the previous Leaflet RecenterOnChange component
  // played.
  useEffect(() => {
    mapRef.current?.panTo(centerLiteral);
  }, [centerLiteral]);

  // Keeps the clusterer's grouping in sync with whichever markers are
  // currently rendered — the clusterer never creates markers itself, it
  // only groups the google.maps.Marker instances each <Marker> below
  // already registered into markersRef via its own onLoad.
  useEffect(() => {
    if (!mapRef.current) return;
    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({ map: mapRef.current });
    }
    clustererRef.current.clearMarkers();
    clustererRef.current.addMarkers([...markersRef.current.values()]);
    onResultsChanged?.(displayedBusinesses.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedBusinesses]);

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
        center={centerLiteral}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onIdle={onIdle}
        options={MAP_OPTIONS}
      >
        {userPosition && <Marker position={toLatLngLiteral(userPosition)} icon={userLocationIcon()} />}
        {displayedBusinesses.map((b) => {
          const position = safeLatLng(b.latitude, b.longitude);
          if (!position) return null; // skip rather than render at a broken/NaN position
          return (
            <Marker
              key={b.id}
              position={toLatLngLiteral(position)}
              icon={pinIcon()}
              onClick={() => onMarkerClick?.(b)}
              onLoad={(marker) => markersRef.current.set(b.id, marker)}
              onUnmount={() => markersRef.current.delete(b.id)}
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
