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
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

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
  todayTip: string;
  monthlyTotal: number;
  totalSaved: number;
  treesEquivalent: number;
  addEntry: (entry: Omit<CarbonEntry, "id" | "date">) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getWeeklyData: (days?: string[]) => { day: string; value: number }[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  profile: "@ecotrack_profile",
  badges: "@ecotrack_badges",
  pending: "@ecotrack_pending_entries",
};

export function totalEntriesForLevel(level: number): number {
  return Math.floor((5 * level * (level - 1)) / 2);
}

export function getLevel(count: number): number {
  if (count <= 0) return 1;
  return Math.max(1, Math.floor((1 + Math.sqrt(1 + (8 * count) / 5)) / 2));
}

export function entriesNeededForLevel(level: number): number {
  return level * 5;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "EcoTracker",
  level: 1,
  streak: 0,
  lastEntryDate: "",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [entries, setEntries] = useState<CarbonEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [badges, setBadges] = useState<Badge[]>(ALL_BADGES);
  const [tipIndex] = useState(() => new Date().getDate() % ECO_TIPS.length);

  // Sync profile/badges from local storage on mount
  useEffect(() => {
    (async () => {
      try {
        const [storedProfile, storedBadges] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.profile),
          AsyncStorage.getItem(STORAGE_KEYS.badges),
        ]);
        if (storedProfile)
          setUserProfile({ ...DEFAULT_PROFILE, ...JSON.parse(storedProfile) });
        if (storedBadges) setBadges(JSON.parse(storedBadges));
      } catch {}
    })();
  }, []);

  // Sync user name from auth
  useEffect(() => {
    if (user) {
      setUserProfile((prev) => ({ ...prev, name: user.name }));
    }
  }, [user]);

  // Load entries from API when token changes (login / logout)
  useEffect(() => {
    if (!token) {
      setEntries([]);
      return;
    }
    api.entries.list().then(async (rows) => {
      const mapped = rows.map((r) => ({
        id: r.id,
        date: r.date,
        transport: r.transport,
        energy: r.energy,
        food: r.food,
        total: r.total,
      }));
      // Sync any entries that failed to save previously
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.pending);
        if (raw) {
          const queue: CarbonEntry[] = JSON.parse(raw);
          const serverIds = new Set(mapped.map((e) => e.id));
          const toSync = queue.filter((e) => !serverIds.has(e.id));
          const synced: string[] = [];
          for (const entry of toSync) {
            try {
              await api.entries.create({
                id: entry.id,
                transport: entry.transport,
                energy: entry.energy,
                food: entry.food,
                total: entry.total,
                date: entry.date,
              });
              synced.push(entry.id);
              mapped.push(entry);
            } catch {}
          }
          const remaining = queue.filter((e) => !synced.includes(e.id));
          await AsyncStorage.setItem(STORAGE_KEYS.pending, JSON.stringify(remaining));
        }
      } catch {}

      setEntries(mapped);

      // Recalculate level from the authoritative server entry count
      const correctLevel = getLevel(mapped.length);
      setUserProfile((prev) => {
        const updated = { ...prev, level: correctLevel };
        AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(updated)).catch(() => {});
        return updated;
      });

      // Recalculate badges from server entries
      const totalCO2 = mapped.reduce((s, e) => s + e.total, 0);
      setBadges((prev) =>
        prev.map((b) => {
          if (b.earned) return b;
          if (b.id === "first_entry" && mapped.length >= 1) return { ...b, earned: true };
          if (b.id === "co2_saver" && totalCO2 >= 50) return { ...b, earned: true };
          if (b.id === "tree_planter" && totalCO2 / 21.77 >= 5) return { ...b, earned: true };
          if (b.id === "carbon_champion" && totalCO2 >= 100) return { ...b, earned: true };
          if (b.id === "eco_master" && totalCO2 >= 200) return { ...b, earned: true };
          return b;
        })
      );
    }).catch(() => {
      // Network error — keep local state as-is
    });
  }, [token]);

  const addEntry = useCallback(
    async (entry: Omit<CarbonEntry, "id" | "date">) => {
      const newEntry: CarbonEntry = {
        ...entry,
        id: `${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
        date: new Date().toISOString(),
      };
      const updated = [newEntry, ...entries];
      setEntries(updated);

      // Persist to API; queue locally if it fails so we can retry on next login
      if (token) {
        try {
          await api.entries.create({
            id: newEntry.id,
            transport: newEntry.transport,
            energy: newEntry.energy,
            food: newEntry.food,
            total: newEntry.total,
            date: newEntry.date,
          });
        } catch {
          try {
            const raw = await AsyncStorage.getItem(STORAGE_KEYS.pending);
            const queue: CarbonEntry[] = raw ? JSON.parse(raw) : [];
            queue.push(newEntry);
            await AsyncStorage.setItem(STORAGE_KEYS.pending, JSON.stringify(queue));
          } catch {}
        }
      }

      // Streak logic
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
        name: user?.name ?? userProfile.name,
        streak: newStreak,
        lastEntryDate: today,
        level: getLevel(updated.length),
      };
      setUserProfile(newProfile);
      await AsyncStorage.setItem(
        STORAGE_KEYS.profile,
        JSON.stringify(newProfile)
      );

      // Badge logic
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
    [entries, userProfile, badges, token, user]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);

      // Remove from API
      if (token) {
        try {
          await api.entries.delete(id);
        } catch {
          // silent
        }
      }

      const newProfile: UserProfile = {
        ...userProfile,
        level: getLevel(updated.length),
      };
      setUserProfile(newProfile);
      await AsyncStorage.setItem(
        STORAGE_KEYS.profile,
        JSON.stringify(newProfile)
      );
    },
    [entries, userProfile, token]
  );

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

  const getWeeklyData = useCallback((days?: string[]) => {
    const DAY_LABELS = days ?? ["Baz.", "B.E.", "Ç.ax.", "Çər.", "C.ax.", "Cüm.", "Şən."];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayStr = d.toDateString();
      const value = entries
        .filter((e) => new Date(e.date).toDateString() === dayStr)
        .reduce((s, e) => s + e.total, 0);
      return { day: DAY_LABELS[d.getDay()], value };
    });
  }, [entries]);

  const value = useMemo(
    () => ({
      entries,
      userProfile,
      badges,
      todayTip: ECO_TIPS[tipIndex],
      monthlyTotal,
      totalSaved,
      treesEquivalent,
      addEntry,
      deleteEntry,
      getWeeklyData,
    }),
    [
      entries,
      userProfile,
      badges,
      tipIndex,
      monthlyTotal,
      totalSaved,
      treesEquivalent,
      addEntry,
      deleteEntry,
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
