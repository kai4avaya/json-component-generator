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

// Incognito CSS styles - injected directly to avoid Tailwind purging issues
const INCOGNITO_STYLES = `
  html.incognito,
  html.incognito body,
  html.incognito main {
    background: transparent !important;
    background-color: transparent !important;
  }
  html.incognito .incognito-shell {
    background: transparent !important;
    background-color: transparent !important;
  }
  html.incognito .header-normal {
    display: none !important;
  }
  html.incognito .header-incognito {
    display: block !important;
  }
  html.incognito .json-panel,
  html.incognito .render-panel {
    background: var(--background) !important;
    background-color: var(--background) !important;
    border-color: rgba(128, 128, 128, 0.3) !important;
  }
  html.incognito .render-panel .bg-background,
  html.incognito .render-panel [class*="bg-background"],
  html.incognito .render-panel .bg-card,
  html.incognito .render-panel [class*="bg-card"] {
    background: var(--background) !important;
    background-color: var(--background) !important;
  }
`;

// Apply incognito class and styles immediately on script load (before React)
if (typeof window !== "undefined") {
  const params = new URLSearchParams(window.location.search);
  if (parseIncognito(params.get("incognito"))) {
    document.documentElement.classList.add("incognito");
    // Inject styles immediately
    const style = document.createElement("style");
    style.id = "incognito-styles";
    style.textContent = INCOGNITO_STYLES;
    document.head.appendChild(style);
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
    
    if (isIncognito) {
      el.classList.add("incognito");
      // Ensure styles are injected
      if (!document.getElementById("incognito-styles")) {
        const style = document.createElement("style");
        style.id = "incognito-styles";
        style.textContent = INCOGNITO_STYLES;
        document.head.appendChild(style);
      }
    } else {
      el.classList.remove("incognito");
      // Remove injected styles
      const style = document.getElementById("incognito-styles");
      if (style) style.remove();
    }

    return () => {
      el.classList.remove("incognito");
      const style = document.getElementById("incognito-styles");
      if (style) style.remove();
    };
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
