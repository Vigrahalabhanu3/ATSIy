export type ThemeMode = "light" | "dark" | "system";

const THEME_KEY = "atsly_theme";

/**
 * Gets the active stored theme mode, defaults to "system"
 */
export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {}
  return "light";
}

/**
 * Resolves whether the current mode evaluates to dark
 */
export function isDarkModeActive(mode?: ThemeMode): boolean {
  if (typeof window === "undefined") return false;
  const current = mode || getStoredTheme();
  if (current === "dark") return true;
  if (current === "light") return false;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Applies the theme to the document HTML element
 */
export function applyTheme(mode: ThemeMode) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {}

  const isDark = isDarkModeActive(mode);
  const root = document.documentElement;

  if (isDark) {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  }

  // Dispatch custom event so all listeners can synchronize
  window.dispatchEvent(new CustomEvent("atsly-theme-change", { detail: { mode, isDark } }));
}

/**
 * Initializes theme listener for system preference changes
 */
export function initializeThemeListener(): () => void {
  if (typeof window === "undefined") return () => {};

  // Initial apply
  applyTheme(getStoredTheme());

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => {
    const current = getStoredTheme();
    if (current === "system") {
      applyTheme("system");
    }
  };

  try {
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  } catch {
    // Legacy Safari
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }
}
