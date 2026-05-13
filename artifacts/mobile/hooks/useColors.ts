import { useTheme } from "@/context/ThemeContext";

/**
 * Returns the design tokens for the current color scheme.
 * Reads from ThemeContext so the user's in-app toggle is respected
 * in addition to the system preference.
 */
export function useColors() {
  const { palette } = useTheme();
  return palette;
}
