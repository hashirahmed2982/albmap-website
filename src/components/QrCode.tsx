"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * Renders `value` as a QR code image — used for the two "download the
 * app" codes (Android/iOS store links) on the Footer and the app-install
 * fallback page. Generated client-side into a data: URL rather than
 * fetching a hosted QR image API, so this never depends on a third-party
 * service being reachable/allowlisted.
 */
export function QrCode({ value, size = 120 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { width: size, margin: 1 })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className="animate-pulse rounded-lg bg-paper-warm"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element -- a generated
  // data: URL, not a remote image next/image would optimize anyway.
  return <img src={dataUrl} alt="" width={size} height={size} className="rounded-lg bg-white p-1" />;
}
