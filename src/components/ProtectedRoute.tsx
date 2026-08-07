"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * Guards a page client-side. Next.js Middleware can't do this instead —
 * it runs server-side before the page loads, and our tokens live in
 * localStorage, which is only readable client-side. The trade-off: there's
 * a brief flash while isLoading resolves before redirecting, which a
 * cookie+Middleware approach wouldn't have. Acceptable for now; revisit
 * if that flash becomes a real UX complaint.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
