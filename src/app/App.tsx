import { useState, useMemo } from "react";
import { Plus, LogOut, ShieldCheck, Search } from "lucide-react";

// ── Auth ────────────────────────────────────────────────────────────────────────────────
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginScreen } from "./components/auth/LoginScreen";

// ── Layout ────────────────────────────────────────────────────────────────────
import { Header } from "./components/layout/Header";
// ── Feature components ────────────────────────────────────────────────────────
import { PlayerCard } from "./components/player/PlayerCard";
import { NpcCard } from "./components/npc/NpcCard";
// ── Shared ────────────────────────────────────────────────────────────────────
import { YinYang } from "./components/shared/YinYang";
import { AddCharacterModal } from "./components/shared/AddCharacterModal";
import { AdminModal } from "./components/shared/AdminModal";
// ── Data + types ──────────────────────────────────────────────────────────────
import { INITIAL_PLAYERS, INITIAL_NPCS, INITIAL_FAMILIARS, MAX_PLAYERS, MAX_STRIKES, mockUsers } from "../data/initialData";
import type { User, Familiar } from "../data/types";
// Player e Npc sao aliases/extensoes exportados pelos proprios card-components,
// mantendo a compatibilidade com o sistema de friendships da UI.
import type { Player } from "./components/player/PlayerCard";
import type { Npc } from "./components/npc/NpcCard";
import type { ModalMode } from "./components/shared/AddCharacterModal";

// ── ID generation (UUID via Web Crypto API) ──────────────────────────────────
function newId(): string {
  return crypto.randomUUID();
}

// ── App root (com AuthProvider) ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

// ── AppInner ────────────────────────────────────────────────────────────────────────────────

function AppInner() {
  const { currentUser, activeCharacterId, logout } = useAuth();
  const isGm     = currentUser?.role === "GM";
  const isPlayer = currentUser?.role === "PLAYER";

  // ── Core data state ──────────────────────────────────────────────────────────
  const [players, setPlayers]   = useState<Player[]>(INITIAL_PLAYERS as Player[]);
  const [npcs, setNpcs]         = useState<Npc[]>(INITIAL_NPCS as Npc[]);

  // ── Admin-managed state (live lists fed to modal selectors) ──────────────────
  const [users, setUsers]       = useState<User[]>(mockUsers);
  const [familiars, setFamiliars] = useState<Familiar[]>(INITIAL_FAMILIARS);

  // null = closed, "player" | "npc" = open for that mode
  const [addModal, setAddModal]   = useState<ModalMode | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  // ── NPC search filter ────────────────────────────────────────────────────────
  const [npcSearch, setNpcSearch] = useState("");
  const filteredNpcs = useMemo(() => {
    const q = npcSearch.trim().toLowerCase();
    if (!q) return npcs;
    return npcs.filter((npc) => npc.name.toLowerCase().includes(q));
  }, [npcs, npcSearch]);

  const canAddPlayer = players.length < MAX_PLAYERS;

  // ── Point change — auto-adds a strike when a player crosses zero ─────────────
  // Negative values are intentionally allowed (penalties can drop points below 0).
  const handlePointChange = (id: string, delta: number) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newPoints = p.points + delta;
        const hitZero = p.points > 0 && newPoints <= 0;
        return {
          ...p,
          points: newPoints,           // no lower bound — negatives are allowed
          strikes: hitZero ? Math.min(MAX_STRIKES, p.strikes + 1) : p.strikes,
        };
      })
    );
  };

  // ── Manual strike override ───────────────────────────────────────────────────
  const handleStrikeChange = (id: string, delta: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, strikes: Math.max(0, Math.min(MAX_STRIKES, p.strikes + delta)) }
          : p
      )
    );
  };

  // ── Avatar upload ────────────────────────────────────────────────────────────
  const handleImageChange = (id: string, dataUrl: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, imageUrl: dataUrl } : p))
    );
  };

  // ── Familiar avatar upload ────────────────────────────────────────────────────
  const handleFamiliarImageChange = (familiarId: string, dataUrl: string) => {
    setFamiliars((prev) =>
      prev.map((f) => (f.id === familiarId ? { ...f, imageUrl: dataUrl } : f))
    );
  };

  // ── Create + link a new familiar on-the-fly (via card dropzone) ──────────────
  const handleCreateAndLinkFamiliar = (
    characterId: string,
    isNpc: boolean,
    familiarName: string,
    imageUrl?: string,
  ) => {
    const newFamiliarId = `fam-${Date.now()}`;
    const newFamiliar: Familiar = { id: newFamiliarId, name: familiarName, imageUrl };
    setFamiliars((prev) => [...prev, newFamiliar]);
    if (isNpc) {
      setNpcs((prev) =>
        prev.map((n) => (n.id === characterId ? { ...n, familiarId: newFamiliarId } : n))
      );
    } else {
      setPlayers((prev) =>
        prev.map((p) => (p.id === characterId ? { ...p, familiarId: newFamiliarId } : p))
      );
    }
  };

  // ── Friendship matrix ────────────────────────────────────────────────────────
  const handleFriendshipChange = (npcId: string, playerId: string, delta: number) => {
    setNpcs((prev) =>
      prev.map((npc) => {
        if (npc.id !== npcId) return npc;
        return {
          ...npc,
          friendships: npc.friendships.map((f) =>
            f.playerId === playerId
              ? { ...f, level: Math.max(-4, Math.min(4, f.level + delta)) }
              : f
          ),
        };
      })
    );
  };

  // ── Delete player (also cleans up friendship entries in all NPCs) ─────────────
  const handleDeletePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setNpcs((prev) =>
      prev.map((npc) => ({
        ...npc,
        friendships: npc.friendships.filter((f) => f.playerId !== id),
      }))
    );
  };

  // ── Delete NPC ───────────────────────────────────────────────────────────────
  const handleDeleteNpc = (id: string) => {
    setNpcs((prev) => prev.filter((npc) => npc.id !== id));
  };

  // ── Admin: register a new player account (GM only) ───────────────────────────
  const handleAddUser = (user: User) => {
    setUsers((prev) => [...prev, user]);
  };

  // ── Admin: register a new familiar (GM only) ─────────────────────────────────
  const handleAddFamiliar = (familiar: Familiar) => {
    setFamiliars((prev) => [...prev, familiar]);
  };

  // ── Add character (unified handler for both modes) ───────────────────────────
  const handleAdd = (data: Record<string, unknown>) => {
    if (addModal === "player") {
      if (!canAddPlayer) return;
      const id = newId();
      const newPlayer: Player = {
        id,
        name: String(data.name ?? ""),
        initials: String(data.initials ?? ""),
        points: 0,
        familiarId: String(data.familiarId ?? familiars[0]?.id ?? "none"),
        dormitory: String(data.dormitory ?? "—"),
        strikes: 0,
        role: Array.isArray(data.role) ? (data.role as Player["role"]) : [],
        playerId: String(data.playerId ?? "user-guest"),
      };
      setPlayers((prev) => [...prev, newPlayer]);
      // Registra este novo jogador em todos os NPCs existentes
      setNpcs((prev) =>
        prev.map((npc) => ({
          ...npc,
          friendships: [...npc.friendships, { playerId: id, level: 0 }],
        }))
      );
    } else if (addModal === "npc") {
      const id = newId();
      const friendships = players.map((p) => ({ playerId: p.id, level: 0 }));
      const newNpc: Npc = {
        id,
        name: String(data.name ?? ""),
        type: "",
        initials: String(data.initials ?? ""),
        points: 0,
        strikes: 0,
        familiarId: String(data.familiarId ?? familiars[0]?.id ?? "none"),
        dormitory: String(data.dormitory ?? "—"),
        role: Array.isArray(data.role) ? (data.role as Npc["role"]) : [],
        friendships,
      };
      setNpcs((prev) => [...prev, newNpc]);
    }
    setAddModal(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  // Guarda de autenticação: se não há usuário, exibe a tela de login
  if (!currentUser) return <LoginScreen players={players} />;

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-body)" }}>

      <Header onShowAdmin={() => setShowAdmin(true)} />

      <main className="max-w-[1400px] mx-auto px-6 py-10 flex flex-col gap-16">

        {/* ══ Seção 01 — Jogadores ══════════════════════════════════════════════ */}
        <section>
          <SectionHeader
            number="01"
            title="Jogadores"
            subtitle={`${players.length} de ${MAX_PLAYERS} vagas preenchidas — ajuste os pontos em tempo real`}
          >
            {/* Botão de adicionar jogador — oculto para PLAYERs */}
            {canAddPlayer && !isPlayer && (
              <AddButton label="Adicionar Jogador" onClick={() => setAddModal("player")} />
            )}
          </SectionHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onPointChange={handlePointChange}
                onStrikeChange={handleStrikeChange}
                onImageChange={handleImageChange}
                onFamiliarImageChange={handleFamiliarImageChange}
                onCreateAndLinkFamiliar={handleCreateAndLinkFamiliar}
                onDelete={handleDeletePlayer}
                currentUser={currentUser}
                users={users}
                familiars={familiars}
              />
            ))}

            {/* Add-player slot — visível enquanto abaixo do limite E usuário for GM */}
            {canAddPlayer && !isPlayer && (
              <AddSlot
                onClick={() => setAddModal("player")}
                label="Adicionar Jogador"
                sublabel={`${MAX_PLAYERS - players.length} ${MAX_PLAYERS - players.length === 1 ? "vaga restante" : "vagas restantes"}`}
                minHeight={320}
              />
            )}

            {/* Limit-reached placeholder */}
            {!canAddPlayer && <LimitReachedSlot minHeight={320} />}
          </div>
        </section>

        {/* ── Yin Yang divider ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="h-px bg-border flex-1" />
          <YinYang size={20} />
          <div className="h-px bg-border flex-1" />
        </div>

        {/* ══ Seção 02 — NPCs e Familiares ══════════════════════════════════════ */}
        <section>
          <SectionHeader
            number="02"
            title="NPCs e Familiares"
            subtitle={`${npcs.length} entidades — rastreador com matriz de amizade por nível (−4 a +4)`}
          >
            <div className="flex items-center gap-4">
              <MatrixLegend />
              {/* Botão de adicionar NPC — oculto para PLAYERs */}
              {!isPlayer && (
                <AddButton label="Adicionar NPC" onClick={() => setAddModal("npc")} />
              )}
            </div>
          </SectionHeader>

          {/* ── Barra de pesquisa de NPCs ────────────────────────────────────── */}
          <NpcSearchBar value={npcSearch} onChange={setNpcSearch} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNpcs.length === 0 && npcSearch.trim() !== "" && (
              <div
                className="col-span-full flex flex-col items-center justify-center gap-2 py-12 opacity-50"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#555" }}
              >
                <Search size={24} strokeWidth={1.5} />
                <span>Nenhum NPC encontrado para "{npcSearch}"</span>
              </div>
            )}
            {filteredNpcs.map((npc) => (
              <NpcCard
                key={npc.id}
                npc={npc}
                players={players}
                onFriendshipChange={handleFriendshipChange}
                onDelete={handleDeleteNpc}
                currentUser={currentUser}
                activeCharacterId={activeCharacterId}
                familiars={familiars}
                onFamiliarImageChange={handleFamiliarImageChange}
                onCreateAndLinkFamiliar={handleCreateAndLinkFamiliar}
              />
            ))}
            {/* Slot de adicionar NPC — oculto para PLAYERs */}
            {!isPlayer && (
              <AddSlot onClick={() => setAddModal("npc")} label="Adicionar NPC / Familiar" minHeight={200} />
            )}
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="mt-4 pt-6 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <YinYang size={18} />
            <span
              className="text-muted-foreground"
              style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
            >
              Academia Aequilibrium — Gerenciador de Sessão
            </span>
          </div>
          <span
            className="text-muted-foreground"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em" }}
          >
            v1.0 — 2026
          </span>
        </footer>
      </main>

      {/* ── Unified add-character modal ──────────────────────────────────── */}
      {addModal && (
        <AddCharacterModal
          mode={addModal}
          onAdd={handleAdd}
          onClose={() => setAddModal(null)}
          users={users}
          familiars={familiars}
        />
      )}

      {/* ── Admin modal (GM only) ────────────────────────────────────────── */}
      {showAdmin && (
        <AdminModal
          onClose={() => setShowAdmin(false)}
          onAddUser={handleAddUser}
          onAddFamiliar={handleAddFamiliar}
        />
      )}
    </div>
  );
}

// ── Pure layout sub-components (local to App; no shared state) ────────────────

function SectionHeader({
  number, title, subtitle, children,
}: {
  number: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7 pb-4 border-b border-border">
      <div>
        <p
          className="text-primary mb-1"
          style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
        >
          Seção {number}
        </p>
        <h2
          className="text-foreground"
          style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}
        >
          {title}
        </h2>
        <p
          className="text-muted-foreground mt-1"
          style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", letterSpacing: "0.06em" }}
        >
          {subtitle}
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-150 px-4 py-2"
      style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}
    >
      <Plus size={14} strokeWidth={2.5} />
      {label}
    </button>
  );
}

function AddSlot({
  onClick, label, sublabel, minHeight,
}: {
  onClick: () => void;
  label: string;
  sublabel?: string;
  minHeight: number;
}) {
  return (
    <button
      onClick={onClick}
      className="border border-dashed border-border hover:border-primary group transition-all duration-200 flex flex-col items-center justify-center gap-2"
      style={{ background: "transparent", minHeight }}
    >
      <div
        className="w-16 h-16 rounded-full border border-dashed border-border group-hover:border-primary flex items-center justify-center transition-colors duration-200"
        style={{ background: "#111" }}
      >
        <Plus size={22} className="text-muted-foreground group-hover:text-primary transition-colors duration-200" strokeWidth={1.5} />
      </div>
      <span
        className="text-muted-foreground group-hover:text-primary transition-colors duration-200"
        style={{ fontFamily: "var(--font-display)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}
      >
        {label}
      </span>
      {sublabel && (
        <span
          className="text-muted-foreground"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.08em" }}
        >
          {sublabel}
        </span>
      )}
    </button>
  );
}

function LimitReachedSlot({ minHeight }: { minHeight: number }) {
  return (
    <div
      className="border border-dashed border-border flex flex-col items-center justify-center gap-2 opacity-30"
      style={{ background: "transparent", minHeight }}
    >
      <div
        className="w-16 h-16 rounded-full border border-dashed border-border flex items-center justify-center"
        style={{ background: "#111" }}
      >
        <span className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "1rem" }}>8</span>
      </div>
      <span
        className="text-muted-foreground"
        style={{ fontFamily: "var(--font-display)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}
      >
        Limite atingido
      </span>
    </div>
  );
}

function MatrixLegend() {
  return (
    <div className="hidden lg:flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5" style={{ background: "#c8102e" }} />
        <span className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em" }}>
          INIMIGO (−4)
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5" style={{ background: "#3f3f3f" }} />
        <span className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em" }}>
          NEUTRO (0)
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5" style={{ background: "#e2e8f0" }} />
        <span className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em" }}>
          AMIGO (+4)
        </span>
      </div>
    </div>
  );
}

// ── NpcSearchBar ──────────────────────────────────────────────────────────────

/**
 * Campo de pesquisa de NPCs com design glassmorphism.
 * Filtra a lista em tempo real conforme o usuário digita (case-insensitive).
 */
function NpcSearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="relative mb-5 flex items-center"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 2,
      }}
    >
      <Search
        size={13}
        strokeWidth={2}
        style={{
          position: "absolute",
          left: "0.85rem",
          color: "#555",
          pointerEvents: "none",
          flexShrink: 0,
        }}
      />
      <input
        id="npc-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Pesquisar NPC pelo nome…"
        autoComplete="off"
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          padding: "0.55rem 0.85rem 0.55rem 2.2rem",
          fontFamily: "var(--font-body)",
          fontSize: "0.75rem",
          letterSpacing: "0.04em",
          color: "#e0e0e0",
        }}
        onFocus={(e) =>
          (e.currentTarget.parentElement!.style.borderColor = "rgba(200,16,46,0.5)")
        }
        onBlur={(e) =>
          (e.currentTarget.parentElement!.style.borderColor = "rgba(255,255,255,0.08)")
        }
      />
      {value && (
        <button
          onClick={() => onChange("")}
          title="Limpar pesquisa"
          style={{
            position: "absolute",
            right: "0.75rem",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#555",
            fontSize: "0.85rem",
            lineHeight: 1,
            padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c8102e")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
        >
          ×
        </button>
      )}
    </div>
  );
}

