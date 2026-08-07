"use client";

import { useState, useEffect } from "react";

interface GeolocationState {
  position: [number, number] | null;
  isLoading: boolean;
  /** True once we've gotten a real answer (granted or denied/unavailable) — lets
   * callers distinguish "still waiting" from "asked and got nothing back". */
  hasResolved: boolean;
}

/**
 * Browser geolocation, with graceful degradation built in — if the user
 * denies permission, the browser doesn't support it, or they're on an
 * insecure (non-HTTPS) origin where geolocation is blocked entirely, this
 * just resolves to `position: null` rather than throwing. Callers should
 * fall back to a sensible default center (e.g. Tirana) when position is
 * null, exactly like the mobile app's location handling already does.
 */
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    isLoading: true,
    hasResolved: false,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState({ position: null, isLoading: false, hasResolved: true });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          position: [pos.coords.latitude, pos.coords.longitude],
          isLoading: false,
          hasResolved: true,
        });
      },
      () => {
        // Permission denied, timeout, or position unavailable — all
        // treated the same way: fall back silently, this isn't an error
        // worth surfacing to the user, just a degraded (but working)
        // default.
        setState({ position: null, isLoading: false, hasResolved: true });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  return state;
}
