/**
 * LoginScreen.tsx — Tela de autenticação mockada.
 * Passo 1: Escolha de Portal (Mestre ou Jogador).
 * Passo 2: Formulário de Login e Senha.
 * Passo 3 (só PLAYER): Selecionar personagem de INITIAL_PLAYERS cujo playerId === user.id.
 */
import { useState } from "react";
import { LogIn, ChevronLeft, UserX, Lock, User, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { mockUsers, INITIAL_PLAYERS } from "../../../data/initialData";
import type { User as UserType } from "../../../data/types";
import type { Player } from "../player/PlayerCard";
import { YinYang } from "../shared/YinYang";

// ── Props ─────────────────────────────────────────────────────────────────────

interface LoginScreenProps {
  /** Lista de jogadores cadastrados no estado atual da UI. */
  players: Player[];
}

// ── Avatar inicial ────────────────────────────────────────────────────────────

function InitialsAvatar({
  name,
  size = 64,
}: {
  name: string;
  size?: number;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#1a1a1a",
        border: "1px solid #262626",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: size * 0.28,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: "#6b6b6b",
        }}
      >
        {initials}
      </span>
    </div>
  );
}

// ── Card de personagem (passo 3) ──────────────────────────────────────────────

function CharacterCard({
  player,
  onClick,
}: {
  player: Player;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem 1.5rem",
        background: hovered ? "#1a1a1a" : "#141414",
        border: `1px solid ${hovered ? "#c8102e" : "#262626"}`,
        cursor: "pointer",
        transition: "all 0.18s ease",
        position: "relative",
        outline: "none",
        width: "100%",
        textAlign: "left",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 2,
          background: hovered ? "#c8102e" : "transparent",
          transition: "background 0.18s ease",
        }}
      />

      {player.imageUrl ? (
        <img
          src={player.imageUrl}
          alt={player.name}
          style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: "1px solid #262626" }}
        />
      ) : (
        <InitialsAvatar name={player.initials || player.name} size={48} />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.95rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#f0f0f0",
            margin: 0,
          }}
        >
          {player.name}
        </p>
      </div>

      <LogIn
        size={15}
        strokeWidth={2}
        style={{ color: hovered ? "#c8102e" : "#3a3a3a", transition: "color 0.15s ease", flexShrink: 0 }}
      />
    </button>
  );
}

// ── Botão de Portal (passo 1) ──────────────────────────────────────────────────

function PortalButton({
  label,
  role,
  onClick,
}: {
  label: string;
  role: "GM" | "PLAYER";
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isGm = role === "GM";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        padding: "2.5rem 2rem",
        background: hovered ? "rgba(26, 26, 26, 0.6)" : "rgba(20, 20, 20, 0.4)",
        backdropFilter: "blur(8px)",
        border: `1px solid ${hovered ? "#c8102e" : "#262626"}`,
        cursor: "pointer",
        transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        outline: "none",
        flex: "1 1 240px",
        maxWidth: "280px",
        minHeight: "180px",
        boxShadow: hovered
          ? "0 8px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(200, 16, 46, 0.15)"
          : "0 4px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      {/* Accent rule */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: hovered ? "#c8102e" : "transparent",
          transition: "background 0.18s ease",
        }}
      />

      {isGm ? (
        <Shield
          size={36}
          color={hovered ? "#c8102e" : "#6b6b6b"}
          strokeWidth={1.5}
          style={{ transition: "color 0.18s ease" }}
        />
      ) : (
        <User
          size={36}
          color={hovered ? "#c8102e" : "#6b6b6b"}
          strokeWidth={1.5}
          style={{ transition: "color 0.18s ease" }}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.95rem",
            fontWeight: 800,
            letterSpacing: "0.14em",
            color: "#f0f0f0",
            textAlign: "center",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            letterSpacing: "0.08em",
            color: "#6b6b6b",
            textTransform: "uppercase",
          }}
        >
          {isGm ? "Painel de Controle" : "Fichas de Personagem"}
        </span>
      </div>
    </button>
  );
}

// ── Login Screen ──────────────────────────────────────────────────────────────

export function LoginScreen({ players }: LoginScreenProps) {
  const { login } = useAuth();

  /** Portal selecionado no Passo 1 (GM ou PLAYER) */
  const [selectedRole, setSelectedRole] = useState<"GM" | "PLAYER" | null>(null);

  /** Usuário autenticado com sucesso e aguardando seleção de personagem (só PLAYER) */
  const [pendingPlayer, setPendingPlayer] = useState<UserType | null>(null);

  /** Estados do formulário de login */
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const matchedUser = mockUsers.find(
      (u) => u.name.trim() === username.trim() && u.password === password
    );

    if (!matchedUser) {
      setError("Nome de usuário ou senha incorretos.");
      return;
    }

    if (matchedUser.role !== selectedRole) {
      setError(`Este usuário não possui acesso como ${selectedRole === "GM" ? "Mestre" : "Jogador"}.`);
      return;
    }

    if (matchedUser.role === "GM") {
      login(matchedUser);
    } else {
      setPendingPlayer(matchedUser);
    }
  }

  function handleCharacterSelect(characterId: string) {
    if (!pendingPlayer) return;
    login(pendingPlayer, characterId);
  }

  // ── Personagens deste jogador vindos de INITIAL_PLAYERS (e players do estado) ──
  const allPlayers = Array.from(new Set([...INITIAL_PLAYERS, ...players]));
  const myCharacters = pendingPlayer
    ? allPlayers.filter((p) => p.playerId === pendingPlayer.id)
    : [];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* ── Logo / Marca ──────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        {/* Yin Yang decorativo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <YinYang size={56} />
        </div>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#c8102e",
            margin: "0 0 0.5rem",
          }}
        >
          Academia Aequilibrium
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.2rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#f0f0f0",
            margin: "0 0 0.5rem",
          }}
        >
          Painel do Mestre
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.72rem",
            letterSpacing: "0.06em",
            color: "#6b6b6b",
            margin: 0,
          }}
        >
          {pendingPlayer
            ? `Bem-vindo(a), ${pendingPlayer.name}. Selecione seu personagem.`
            : selectedRole
              ? `Autenticando como ${selectedRole === "GM" ? "Mestre" : "Jogador"}.`
              : "Selecione seu portal para continuar"}
        </p>
      </div>

      {/* ── Passo 1: Escolha de Portal ────────────────────────────────────── */}
      {!pendingPlayer && !selectedRole && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "1.5rem",
            justifyContent: "center",
            width: "100%",
            maxWidth: 600,
          }}
        >
          <PortalButton
            label="ACESSO MESTRE"
            role="GM"
            onClick={() => {
              setSelectedRole("GM");
              setUsername("");
              setPassword("");
              setError("");
            }}
          />
          <PortalButton
            label="ACESSO JOGADOR"
            role="PLAYER"
            onClick={() => {
              setSelectedRole("PLAYER");
              setUsername("");
              setPassword("");
              setError("");
            }}
          />
        </div>
      )}

      {/* ── Passo 2: Formulário de credenciais ────────────────────────────── */}
      {selectedRole && !pendingPlayer && (
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: 360,
            background: "#141414",
            border: "1px solid #262626",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            position: "relative",
          }}
        >
          {/* Top Crimson accent border */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: "#c8102e",
            }}
          />

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#f0f0f0",
              margin: 0,
              textAlign: "center",
            }}
          >
            {selectedRole === "GM" ? "Acesso do Mestre" : "Acesso do Jogador"}
          </h2>

          {/* Campo de Usuário */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label
              htmlFor="login-username"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#6b6b6b",
              }}
            >
              Usuário / Login
            </label>
            <div style={{ position: "relative" }}>
              <User
                size={14}
                color="#6b6b6b"
                style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                required
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem 0.6rem 2.25rem",
                  background: "#1e1e1e",
                  border: "1px solid #262626",
                  color: "#f0f0f0",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  outline: "none",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#c8102e")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#262626")}
              />
            </div>
          </div>

          {/* Campo de Senha */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label
              htmlFor="login-password"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#6b6b6b",
              }}
            >
              Senha
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={14}
                color="#6b6b6b"
                style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem 0.6rem 2.25rem",
                  background: "#1e1e1e",
                  border: "1px solid #262626",
                  color: "#f0f0f0",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  outline: "none",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#c8102e")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#262626")}
              />
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div
              id="login-error"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.7rem",
                color: "#c8102e",
                background: "rgba(200, 16, 46, 0.08)",
                border: "1px solid rgba(200, 16, 46, 0.25)",
                padding: "0.5rem 0.75rem",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {/* Botões de Ação */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button
              id="login-submit"
              type="submit"
              style={{
                background: "#c8102e",
                color: "#ffffff",
                border: "1px solid #c8102e",
                padding: "0.6rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#9a0d22")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#c8102e")}
            >
              Entrar
            </button>

            <button
              id="login-back"
              type="button"
              onClick={() => {
                setSelectedRole(null);
                setUsername("");
                setPassword("");
                setError("");
              }}
              style={{
                background: "transparent",
                color: "#6b6b6b",
                border: "1px solid #262626",
                padding: "0.6rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#6b6b6b";
                e.currentTarget.style.color = "#f0f0f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#262626";
                e.currentTarget.style.color = "#6b6b6b";
              }}
            >
              Voltar
            </button>
          </div>
        </form>
      )}

      {/* ── Passo 3: Seleção de personagem (só PLAYER) ────────────────────── */}
      {pendingPlayer && (
        <div style={{ width: "100%", maxWidth: 420 }}>
          {myCharacters.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {myCharacters.map((char) => (
                <CharacterCard
                  key={char.id}
                  player={char}
                  onClick={() => handleCharacterSelect(char.id)}
                />
              ))}
            </div>
          ) : (
            /* Estado vazio — nenhum personagem vinculado */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                padding: "3rem 2rem",
                border: "1px dashed #262626",
                textAlign: "center",
              }}
            >
              <UserX size={32} color="#3a3a3a" strokeWidth={1.5} />
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#4a4a4a",
                    margin: "0 0 0.4rem",
                  }}
                >
                  Nenhum personagem encontrado
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.68rem",
                    letterSpacing: "0.04em",
                    color: "#3a3a3a",
                    margin: 0,
                  }}
                >
                  O Mestre ainda não criou um personagem vinculado à sua conta.
                </p>
              </div>
            </div>
          )}

          {/* Voltar */}
          <button
            onClick={() => setPendingPlayer(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginTop: "1.5rem",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <ChevronLeft size={14} color="#6b6b6b" strokeWidth={2} />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#6b6b6b",
              }}
            >
              Voltar
            </span>
          </button>
        </div>
      )}

      {/* ── Rodapé ────────────────────────────────────────────────────────── */}
      <p
        style={{
          position: "fixed",
          bottom: "1.5rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.55rem",
          letterSpacing: "0.1em",
          color: "#2a2a2a",
        }}
      >
        v1.0 — 2026 — Academia Aequilibrium
      </p>
    </div>
  );
}

