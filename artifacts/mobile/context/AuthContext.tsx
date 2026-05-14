import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { api, type ApiUser } from "@/lib/api";

interface AuthContextType {
  user: ApiUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "@ecotrack_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore stored session
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY);
        if (stored) {
          const me = await api.auth.me();
          setToken(stored);
          setUser(me);
        }
      } catch {
        // Token expired or invalid — clear it silently
        await AsyncStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: t, user: u } = await api.auth.login({ email, password });
    await AsyncStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(u);
  }, []);

  const register = useCallback(
    async (email: string, name: string, password: string) => {
      const { token: t, user: u } = await api.auth.register({
        email,
        name,
        password,
      });
      await AsyncStorage.setItem(TOKEN_KEY, t);
      setToken(t);
      setUser(u);
    },
    []
  );

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem("@ecotrack_onboarding");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
