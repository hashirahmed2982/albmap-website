"use client";

import { useEffect, useRef, useCallback } from "react";
import Script from "next/script";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

/**
 * Renders Google's own official sign-in button and wires its callback to
 * our backend's /auth/google endpoint (via onIdToken). Uses the Web
 * client ID — the same one the backend's GOOGLE_CLIENT_ID expects as the
 * token's audience, so no separate "server client ID" workaround is
 * needed here the way the mobile app's native SDK required.
 */
export function GoogleSignInButton({
  onIdToken,
  onError,
}: {
  onIdToken: (idToken: string) => void;
  onError: (message: string) => void;
}) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const initialize = useCallback(() => {
    if (!window.google || !buttonRef.current || !clientId) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) {
          onIdToken(response.credential);
        } else {
          onError("Google did not return a credential.");
        }
      },
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
      shape: "pill",
      text: "continue_with",
    });
  }, [clientId, onIdToken, onError]);

  useEffect(() => {
    if (window.google) initialize();
  }, [initialize]);

  if (!clientId) {
    return (
      <div className="rounded-full border border-line px-4 py-3 text-center text-sm text-ink-soft">
        Google sign-in isn&apos;t configured yet.
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initialize}
      />
      <div ref={buttonRef} className="flex justify-center" />
    </>
  );
}
