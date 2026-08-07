"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window`/`document` at import time, which breaks
// Next.js's server-side render pass entirely if imported normally —
// ssr: false defers loading this component until the browser.
export const MapViewClient = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-paper-warm">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" />
    </div>
  ),
});
