"use client";

import { useCallback, useState } from "react";
import Script from "next/script";
import { Facebook } from "lucide-react";

declare global {
  interface Window {
    FB?: {
      init: (config: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: { accessToken: string };
          status: string;
        }) => void,
        options: { scope: string },
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export function FacebookSignInButton({
  onAccessToken,
  onError,
}: {
  onAccessToken: (accessToken: string) => void;
  onError: (message: string) => void;
}) {
  const [isReady, setIsReady] = useState(false);
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  const handleSdkLoad = useCallback(() => {
    if (!appId) return;
    window.fbAsyncInit = () => {
      window.FB?.init({ appId, cookie: true, xfbml: false, version: "v21.0" });
      setIsReady(true);
    };
  }, [appId]);

  const handleClick = useCallback(() => {
    if (!window.FB) {
      onError("Facebook sign-in isn't ready yet — try again in a moment.");
      return;
    }
    window.FB.login(
      (response) => {
        if (response.status === "connected" && response.authResponse?.accessToken) {
          onAccessToken(response.authResponse.accessToken);
        } else if (response.status !== "connected") {
          // User closed the dialog or declined — not a real error.
        } else {
          onError("Facebook did not return an access token.");
        }
      },
      { scope: "email,public_profile" },
    );
  }, [onAccessToken, onError]);

  if (!appId) {
    return (
      <div className="rounded-full border border-line px-4 py-3 text-center text-sm text-ink-soft">
        Facebook sign-in isn&apos;t configured yet.
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
        onLoad={handleSdkLoad}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={!isReady}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper-warm disabled:opacity-50"
      >
        <Facebook size={18} className="text-[#1877F2]" />
        Continue with Facebook
      </button>
    </>
  );
}
