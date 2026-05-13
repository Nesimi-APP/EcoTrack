import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ALL_BADGES, ECO_TIPS, MONTHLY_TARGET_KG } from "@/data/ecoData";

export interface CarbonEntry {
  id: string;
  date: string;
  transport: number;
  energy: number;
  food: number;
  total: number;
  note?: string;
}

export interface UserProfile {
  name: string;
  level: number;
  streak: number;
  lastEntryDate: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
}

interface AppContextType {
  entries: CarbonEntry[];
  userProfile: UserProfile;
  badges: Badge[];
  darkMode: boolean;
  todayTip: string;
  monthlyTotal: number;
  totalSaved: number;
  treesEquivalent: number;
  addEntry: (entry: Omit<CarbonEntry, "id" | "date">) => Promise<void>;
  toggleDarkMode: () => void;
  getWeeklyData: () => { day: string; value: number }[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  entries: "@ecotrack_entries",
  profile: "@ecotrack_profile",
  badges: "@ecotrack_badges",
  darkMode: "@ecotrack_dark_mode",
};

const DEFAULT_PROFILE: UserProfile = {
  name: "EcoTracker",
  level: 1,
  streak: 0,
  lastEntryDate: "",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<CarbonEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [badges, setBadges] = useState<Badge[]>(ALL_BADGES);
  const [darkMode, setDarkMode] = useState(false);
  const [tipIndex] = useState(() => new Date().getDate() % ECO_TIPS.length);

  useEffect(() => {
    (async () => {
      try {
        const [storedEntries, storedProfile, storedBadges, storedDark] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.entries),
            AsyncStorage.getItem(STORAGE_KEYS.profile),
            AsyncStorage.getItem(STORAGE_KEYS.badges),
            AsyncStorage.getItem(STORAGE_KEYS.darkMode),
          ]);
        if (storedEntries) setEntries(JSON.parse(storedEntries));
        if (storedProfile)
          setUserProfile({ ...DEFAULT_PROFILE, ...JSON.parse(storedProfile) });
        if (storedBadges) setBadges(JSON.parse(storedBadges));
        if (storedDark) setDarkMode(JSON.parse(storedDark));
      } catch {}
    })();
  }, []);

  const addEntry = useCallback(
    async (entry: Omit<CarbonEntry, "id" | "date">) => {
      const newEntry: CarbonEntry = {
        ...entry,
        id: `${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
        date: new Date().toISOString(),
      };
      const updated = [newEntry, ...entries];
      setEntries(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(updated));

      const today = new Date().toDateString();
      const isNewDay = userProfile.lastEntryDate !== today;
      const prevDayCheck = new Date();
      prevDayCheck.setDate(prevDayCheck.getDate() - 1);
      const wasYesterday =
        userProfile.lastEntryDate === prevDayCheck.toDateString();
      const newStreak = isNewDay
        ? wasYesterday
          ? userProfile.streak + 1
          : 1
        : userProfile.streak;

      const newProfile: UserProfile = {
        ...userProfile,
        streak: newStreak,
        lastEntryDate: today,
        level: Math.floor(updated.length / 5) + 1,
      };
      setUserProfile(newProfile);
      await AsyncStorage.setItem(
        STORAGE_KEYS.profile,
        JSON.stringify(newProfile)
      );

      const totalCO2 = updated.reduce((s, e) => s + e.total, 0);
      const updatedBadges = badges.map((b) => {
        if (b.earned) return b;
        if (b.id === "first_entry" && updated.length >= 1)
          return { ...b, earned: true };
        if (b.id === "green_week" && newStreak >= 7)
          return { ...b, earned: true };
        if (b.id === "co2_saver" && totalCO2 >= 50)
          return { ...b, earned: true };
        if (b.id === "tree_planter" && totalCO2 / 21.77 >= 5)
          return { ...b, earned: true };
        if (b.id === "carbon_champion" && totalCO2 >= 100)
          return { ...b, earned: true };
        if (b.id === "eco_master" && totalCO2 >= 200)
          return { ...b, earned: true };
        return b;
      });
      setBadges(updatedBadges);
      await AsyncStorage.setItem(
        STORAGE_KEYS.badges,
        JSON.stringify(updatedBadges)
      );
    },
    [entries, userProfile, badges]
  );

  const toggleDarkMode = useCallback(async () => {
    const next = !darkMode;
    setDarkMode(next);
    await AsyncStorage.setItem(STORAGE_KEYS.darkMode, JSON.stringify(next));
  }, [darkMode]);

  const monthlyTotal = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return entries
      .filter((e) => new Date(e.date) >= monthStart)
      .reduce((s, e) => s + e.total, 0);
  }, [entries]);

  const totalSaved = useMemo(
    () => Math.max(0, MONTHLY_TARGET_KG - monthlyTotal),
    [monthlyTotal]
  );

  const treesEquivalent = useMemo(
    () => parseFloat((totalSaved / 21.77).toFixed(1)),
    [totalSaved]
  );

  const getWeeklyData = useCallback(() => {
    const days = ["B.e.", "Ç.ax.", "Çər.", "C.ax.", "Cüm.", "Şən.", "Baz."];
    const result = days.map((day, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayStr = d.toDateString();
      const value = entries
        .filter((e) => new Date(e.date).toDateString() === dayStr)
        .reduce((s, e) => s + e.total, 0);
      return { day, value };
    });
    return result;
  }, [entries]);

  const value = useMemo(
    () => ({
      entries,
      userProfile,
      badges,
      darkMode,
      todayTip: ECO_TIPS[tipIndex],
      monthlyTotal,
      totalSaved,
      treesEquivalent,
      addEntry,
      toggleDarkMode,
      getWeeklyData,
    }),
    [
      entries,
      userProfile,
      badges,
      darkMode,
      tipIndex,
      monthlyTotal,
      totalSaved,
      treesEquivalent,
      addEntry,
      toggleDarkMode,
      getWeeklyData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
