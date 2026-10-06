"use client";

import { useEffect } from "react";
import { initializeThemeListener } from "@/lib/theme";

export default function ThemeInitializer() {
  useEffect(() => {
    const cleanup = initializeThemeListener();
    return () => cleanup();
  }, []);

  return null;
}
