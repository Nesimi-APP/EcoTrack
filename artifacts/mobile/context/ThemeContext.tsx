import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

import colors from "@/constants/colors";

type Palette = typeof colors.light & { radius: number };

interface ThemeContextType {
  isDark: boolean;
  palette: Palette;
  toggleDark: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [userPref, setUserPref] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("@ecotrack_dark_mode").then((val) => {
      if (val !== null) setUserPref(JSON.parse(val));
    });
  }, []);

  const isDark = userPref !== null ? userPref : systemScheme === "dark";

  const palette = useMemo(() => {
    const base = isDark
      ? (colors as Record<string, unknown>).dark
      : colors.light;
    return { ...(base as typeof colors.light), radius: colors.radius };
  }, [isDark]);

  const toggleDark = async () => {
    const next = !isDark;
    setUserPref(next);
    await AsyncStorage.setItem("@ecotrack_dark_mode", JSON.stringify(next));
  };

  return (
    <ThemeContext.Provider value={{ isDark, palette, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
