import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "http://localhost:8080/api";

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem("@ecotrack_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
}

export interface ApiEntry {
  id: string;
  transport: number;
  energy: number;
  food: number;
  total: number;
  date: string;
}

export const api = {
  auth: {
    register: (data: { email: string; name: string; password: string }) =>
      request<{ token: string; user: ApiUser }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: ApiUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<ApiUser>("/me"),
  },
  entries: {
    list: () => request<ApiEntry[]>("/entries"),
    create: (data: ApiEntry) =>
      request<ApiEntry>("/entries", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/entries/${id}`, { method: "DELETE" }),
  },
};
