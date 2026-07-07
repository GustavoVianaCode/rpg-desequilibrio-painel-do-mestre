/**
 * AuthContext.tsx — Contexto de autenticação da aplicação.
 * Provê currentUser, activeCharacterId e as ações de login/logout.
 * Fase 3: controle de acesso baseado em papéis (GM vs. PLAYER).
 */
import { createContext, useContext, useState } from "react";
import type { User } from "../../data/types";

// ── Tipos do contexto ─────────────────────────────────────────────────────────

interface AuthContextValue {
  currentUser: User | null;
  activeCharacterId: string | null;
  login: (user: User, characterId?: string) => void;
  logout: () => void;
}

// ── Criação do contexto ───────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Hook de consumo ───────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser,        setCurrentUser]        = useState<User | null>(null);
  const [activeCharacterId,  setActiveCharacterId]  = useState<string | null>(null);

  function login(user: User, characterId?: string) {
    setCurrentUser(user);
    setActiveCharacterId(characterId ?? null);
  }

  function logout() {
    setCurrentUser(null);
    setActiveCharacterId(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, activeCharacterId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
