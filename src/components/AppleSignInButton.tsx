"use client";

import { useCallback, useState } from "react";
import Script from "next/script";
import { Apple } from "lucide-react";

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<{
          authorization: { id_token: string; code: string; state?: string };
          user?: { name?: { firstName?: string; lastName?: string }; email?: string };
        }>;
      };
    };
  }
}

// Must exactly match one of the Return URLs registered on the Apple
// Services ID (see albmap-backend's docs/APPLE_SIGN_IN_SETUP.md) — Apple
// JS requires this even in popup mode, though it never actually
// navigates the page there since usePopup keeps everything in-page.
const REDIRECT_URI = typeof window !== "undefined" ? `${window.location.origin}/login` : "";

/**
 * Renders a custom Apple-branded button (Apple's own JS SDK doesn't ship
 * a pre-styled button component the way Google's does) and wires its
 * popup sign-in result to our backend's /auth/apple endpoint, mirroring
 * GoogleSignInButton/FacebookSignInButton exactly.
 */
export function AppleSignInButton({
  onIdentityToken,
  onError,
}: {
  onIdentityToken: (identityToken: string, name?: { firstName?: string; lastName?: string }) => void;
  onError: (message: string) => void;
}) {
  const [isReady, setIsReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;

  const handleSdkLoad = useCallback(() => {
    if (!clientId || !window.AppleID) return;
    window.AppleID.auth.init({
      clientId,
      scope: "name email",
      redirectURI: REDIRECT_URI,
      usePopup: true,
    });
    setIsReady(true);
  }, [clientId]);

  const handleClick = useCallback(async () => {
    if (!window.AppleID) {
      onError("Apple sign-in isn't ready yet — try again in a moment.");
      return;
    }
    try {
      const response = await window.AppleID.auth.signIn();
      if (!response.authorization?.id_token) {
        onError("Apple did not return an identity token.");
        return;
      }
      onIdentityToken(response.authorization.id_token, {
        firstName: response.user?.name?.firstName,
        lastName: response.user?.name?.lastName,
      });
    } catch (err) {
      // AppleID.auth.signIn() rejects with {error: 'popup_closed_by_user'}
      // (among others) when the user just backs out — not a real error.
      const code = (err as { error?: string })?.error;
      if (code === "popup_closed_by_user") return;
      onError("Apple sign-in failed.");
    }
  }, [onIdentityToken, onError]);

  if (!clientId) {
    return (
      <div className="border border-line px-4 py-3 text-center text-sm text-ink-soft">
        Apple sign-in isn&apos;t configured yet.
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        strategy="afterInteractive"
        onLoad={handleSdkLoad}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={!isReady}
        className="flex w-full items-center justify-center gap-2 border border-line bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper-warm disabled:opacity-50"
      >
        <Apple size={18} fill="currentColor" />
        Continue with Apple
      </button>
    </>
  );
}
