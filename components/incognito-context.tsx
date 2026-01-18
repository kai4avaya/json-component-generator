"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type IncognitoContextValue = {
  isIncognito: boolean;
  setIncognito: (next: boolean) => void;
  toggleIncognito: () => void;
};

const IncognitoContext = createContext<IncognitoContextValue | null>(null);

function parseIncognito(value: string | null): boolean {
  if (!value) return false;
  return value === "1" || value.toLowerCase() === "true";
}

// Check URL on initial load (runs before React hydration completes)
function getInitialIncognito(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return parseIncognito(params.get("incognito"));
}

// Apply incognito class immediately on script load (before React)
if (typeof window !== "undefined") {
  const params = new URLSearchParams(window.location.search);
  if (parseIncognito(params.get("incognito"))) {
    document.documentElement.classList.add("incognito");
  }
}

// Inner component that uses useSearchParams (must be wrapped in Suspense)
function IncognitoProviderInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isIncognito, setIsIncognito] = useState(getInitialIncognito);

  // Sync from URL query param (for dynamic changes)
  useEffect(() => {
    const newValue = parseIncognito(searchParams.get("incognito"));
    setIsIncognito(newValue);
    
    // Also update the class immediately
    if (newValue) {
      document.documentElement.classList.add("incognito");
    } else {
      document.documentElement.classList.remove("incognito");
    }
  }, [searchParams]);

  // Toggle transparent background globally while in incognito
  useEffect(() => {
    if (typeof document === "undefined") return;

    const el = document.documentElement;
    if (isIncognito) el.classList.add("incognito");
    else el.classList.remove("incognito");

    return () => el.classList.remove("incognito");
  }, [isIncognito]);

  const setIncognito = useCallback(
    (next: boolean) => {
      setIsIncognito(next);

      // Keep other query params intact
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set("incognito", "1");
      else params.delete("incognito");

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const toggleIncognito = useCallback(() => {
    setIncognito(!isIncognito);
  }, [isIncognito, setIncognito]);

  const value = useMemo(
    () => ({ isIncognito, setIncognito, toggleIncognito }),
    [isIncognito, setIncognito, toggleIncognito],
  );

  return (
    <IncognitoContext.Provider value={value}>
      {children}
    </IncognitoContext.Provider>
  );
}

// Wrapper with Suspense boundary (required for useSearchParams in Next.js 14+)
export function IncognitoProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <IncognitoProviderInner>{children}</IncognitoProviderInner>
    </Suspense>
  );
}

export function useIncognito() {
  const ctx = useContext(IncognitoContext);
  if (!ctx) {
    throw new Error("useIncognito must be used within IncognitoProvider");
  }
  return ctx;
}
