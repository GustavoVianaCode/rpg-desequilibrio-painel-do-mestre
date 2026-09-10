import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { User } from "../../data/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

interface AuthContextValue {
  currentUser: User | null;
  activeCharacterId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setIsLoading(true);
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.id) {
          setCurrentUser({ id: data.id, name: data.name, email: data.email, role: data.role } as User);
        } else {
          localStorage.removeItem("token");
        }
      })
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login falhou");
      setCurrentUser({ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role } as User);
      localStorage.setItem("token", data.token);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setActiveCharacterId(null);
    localStorage.removeItem("token");
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, activeCharacterId, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
