import { useState } from "react";
import { Plus } from "lucide-react";

// ── Layout ────────────────────────────────────────────────────────────────────
import { Header }             from "./components/layout/Header";
// ── Feature components ────────────────────────────────────────────────────────
import { PlayerCard }         from "./components/player/PlayerCard";
import { NpcCard }            from "./components/npc/NpcCard";
// ── Shared ────────────────────────────────────────────────────────────────────
import { YinYang }            from "./components/shared/YinYang";
import { AddCharacterModal }  from "./components/shared/AddCharacterModal";
// ── Data + types ──────────────────────────────────────────────────────────────
import { INITIAL_PLAYERS, INITIAL_NPCS, MAX_PLAYERS, MAX_STRIKES } from "../data/initialData";
import type { Player }        from "./components/player/PlayerCard";
import type { Npc }           from "./components/npc/NpcCard";
import type { ModalMode }     from "./components/shared/AddCharacterModal";

// ── ID counters (module-level; reset on hard-reload) ─────────────────────────
let nextPlayerId = 1;
let nextNpcId    = 1;

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [players,   setPlayers]   = useState<Player[]>(INITIAL_PLAYERS as Player[]);
  const [npcs,      setNpcs]      = useState<Npc[]>(INITIAL_NPCS as Npc[]);
  // null = closed, "player" | "npc" = open for that mode
  const [addModal,  setAddModal]  = useState<ModalMode | null>(null);

  const canAddPlayer = players.length < MAX_PLAYERS;

  // ── Point change — auto-adds a strike when a player crosses zero ─────────────
  // Negative values are intentionally allowed (penalties can drop points below 0).
  const handlePointChange = (id: number, delta: number) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newPoints = p.points + delta;
        const hitZero   = p.points > 0 && newPoints <= 0;
        return {
          ...p,
          points:  newPoints,           // no lower bound — negatives are allowed
          strikes: hitZero ? Math.min(MAX_STRIKES, p.strikes + 1) : p.strikes,
        };
      })
    );
  };

  // ── Manual strike override ───────────────────────────────────────────────────
  const handleStrikeChange = (id: number, delta: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, strikes: Math.max(0, Math.min(MAX_STRIKES, p.strikes + delta)) }
          : p
      )
    );
  };

  // ── Avatar upload ────────────────────────────────────────────────────────────
  const handleImageChange = (id: number, dataUrl: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, imageUrl: dataUrl } : p))
    );
  };

  // ── Friendship matrix ────────────────────────────────────────────────────────
  const handleFriendshipChange = (npcId: number, playerId: number, delta: number) => {
    setNpcs((prev) =>
      prev.map((npc) => {
        if (npc.id !== npcId) return npc;
        return {
          ...npc,
          friendships: npc.friendships.map((f) =>
            f.playerId === playerId
              ? { ...f, level: Math.max(0, Math.min(4, f.level + delta)) }
              : f
          ),
        };
      })
    );
  };

  // ── Add character (unified handler for both modes) ───────────────────────────
  const handleAdd = (data: Record<string, string>) => {
    if (addModal === "player") {
      if (!canAddPlayer) return;
      const id = nextPlayerId++;
      const newPlayer: Player = { id, points: 0, strikes: 0, ...data } as Player;
      setPlayers((prev) => [...prev, newPlayer]);
      // Register this new player in every existing NPC's friendship list
      setNpcs((prev) =>
        prev.map((npc) => ({
          ...npc,
          friendships: [...npc.friendships, { playerId: id, level: 0 }],
        }))
      );
    } else if (addModal === "npc") {
      const id = nextNpcId++;
      const friendships = players.map((p) => ({ playerId: p.id, level: 0 }));
      const newNpc: Npc = { id, type: "", friendships, ...data } as Npc;
      setNpcs((prev) => [...prev, newNpc]);
    }
    setAddModal(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-body)" }}>

      <Header />

      <main className="max-w-[1400px] mx-auto px-6 py-10 flex flex-col gap-16">

        {/* ══ Seção 01 — Jogadores ══════════════════════════════════════════════ */}
        <section>
          <SectionHeader
            number="01"
            title="Jogadores"
            subtitle={`${players.length} de ${MAX_PLAYERS} vagas preenchidas — ajuste os pontos em tempo real`}
          >
            {canAddPlayer && (
              <AddButton label="Adicionar Jogador" onClick={() => setAddModal("player")} />
            )}
          </SectionHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onPointChange={handlePointChange}
                onStrikeChange={handleStrikeChange}
                onImageChange={handleImageChange}
              />
            ))}

            {/* Add-player slot — visible while under the limit */}
            {canAddPlayer && (
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
            subtitle={`${npcs.length} entidades — rastreador com matriz de amizade por nível (0–4)`}
          >
            <div className="flex items-center gap-4">
              <MatrixLegend />
              <AddButton label="Adicionar NPC" onClick={() => setAddModal("npc")} />
            </div>
          </SectionHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {npcs.map((npc) => (
              <NpcCard
                key={npc.id}
                npc={npc}
                players={players}
                onFriendshipChange={handleFriendshipChange}
              />
            ))}
            <AddSlot onClick={() => setAddModal("npc")} label="Adicionar NPC / Familiar" minHeight={200} />
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
              Academia Equilibrium — Gerenciador de Sessão
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
          onAdd={handleAdd as any}
          onClose={() => setAddModal(null)}
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
    <div className="flex items-end justify-between mb-7 pb-4 border-b border-border">
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
        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
        <span className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em" }}>
          VINCULADO (4)
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full border border-border" style={{ background: "#1e1e1e" }} />
        <span className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em" }}>
          NEUTRO (0)
        </span>
      </div>
    </div>
  );
}
