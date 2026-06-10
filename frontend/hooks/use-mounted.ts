// Hook: useMounted
// Prevents hydration mismatches for client-only components
"use client";

import { useState, useEffect } from "react";

/**
 * Returns true only after the component has mounted on the client.
 * Use this to guard client-only rendering and prevent SSR hydration errors.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
