import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AvatarDropzone } from "../shared/AvatarDropzone";
import { FriendshipMatrix } from "./FriendshipMatrix";
import type { Player } from "../player/PlayerCard";
import type { Friendship } from "./FriendshipMatrix";
import { mockFamiliars } from "../../../data/initialData";
import type { NPC, User } from "../../../data/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Npc estende o dominio NPC com a lista de amizades gerenciada localmente.
 * `friendships` e uma preocupacao da UI; no back-end essa relacao vive
 * na tabela Relationship e sera normalizada na Fase 2.
 */
export type Npc = NPC & { friendships: Friendship[] };

// ── Helpers ─────────────────────────────────────────────────────────────────────

function getFamiliarName(familiarId: string): string {
  return mockFamiliars.find((f) => f.id === familiarId)?.name ?? "\u2014";
}

function toInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

interface NpcCardProps {
  npc: Npc;
  players: Player[];
  onFriendshipChange: (npcId: string, playerId: string, delta: number) => void;
  onDelete: (id: string) => void;
  /** Usuário autenticado. Controla visibilidade de ações destrutivas. */
  currentUser: User | null;
  /** ID do personagem ativo (usado pela FriendshipMatrix). */
  activeCharacterId: string | null;
}

// ── Subject Badge ────────────────────────────────────────────────────────────

import type { SubjectProps } from "../../../data/types";
import { getBlendedColor, getBlendedLabel } from "../../../utils/subjectUtils";

// Paleta de estilos compartilhada por cor final (pura ou mesclada)
const SUBJECT_STYLES: Record<SubjectProps["color"], { bg: string; text: string }> = {
  black:    { bg: "#111111", text: "#e5e5e5" },
  white:    { bg: "#e8e8e8", text: "#111111" },
  gray:     { bg: "#3a3a3a", text: "#c5c5c5" },
  darkGray: { bg: "#252525", text: "#9a9a9a" },
  lightGray:{ bg: "#545454", text: "#e0e0e0" },
};

/**
 * Badge mesclado: exibe o label composto ("Caos & Tempo") com a cor
 * resultado da fusão das duas matérias, conforme regras de negócio.
 * Aceita 1 ou 2 matérias; 0 matérias → não renderiza nada.
 */
function BlendedSubjectBadge({ roles }: { roles: SubjectProps[] }) {
  if (roles.length === 0) return null;
  const blendedColor = getBlendedColor(roles);
  const label        = getBlendedLabel(roles);
  const { bg, text } = SUBJECT_STYLES[blendedColor];
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm border border-border/40"
      style={{
        background: bg,
        color: text,
        fontFamily: "var(--font-body)",
        fontSize: "0.62rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontWeight: 600,
      }}
    >
      {roles[0].icon && <span>{roles[0].icon}</span>}
      {label}
    </span>
  );
}

// ── Data fields list ──────────────────────────────────────────────────────────

const SIMPLE_FIELD_KEYS: { label: string; getValue: (npc: Npc) => string }[] = [
  { label: "Nome do Familiar", getValue: (npc) => getFamiliarName(npc.familiarId) },
  { label: "Dormitório",       getValue: (npc) => npc.dormitory                   },
];

// ── NPC Card ──────────────────────────────────────────────────────────────────

/**
 * Card displaying an NPC or Familiar with their avatar pair,
 * static data fields, and the interactive FriendshipMatrix.
 */
export function NpcCard({ npc, players, onFriendshipChange, onDelete, currentUser, activeCharacterId }: NpcCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Resolve iniciais do familiar pelo ID para exibição no avatar
  const familiarInitials = toInitials(getFamiliarName(npc.familiarId));

  return (
    <>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle
              className="text-foreground"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "0.06em", textTransform: "uppercase" }}
            >
              Excluir personagem?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Tem certeza que deseja excluir{" "}
              <span className="text-foreground font-semibold">{npc.name}</span>? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border bg-secondary text-foreground hover:bg-secondary/70"
              style={{ fontFamily: "var(--font-display)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(npc.id)}
              className="bg-red-700 hover:bg-red-600 text-white border-0"
              style={{ fontFamily: "var(--font-display)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
        className="bg-card border border-border relative"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {/* Top accent rule */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />

        {/* Delete button — oculto para PLAYERs */}
        {currentUser?.role !== "PLAYER" && (
          <button
            onClick={() => setConfirmOpen(true)}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors duration-150 z-10"
            title="Excluir NPC"
          >
            <Trash2 size={13} strokeWidth={2} />
          </button>
        )}

      {/*
       * Avatar group — 136 × 150 px container.
       * Main avatar (120 px) anchored top-left.
       * Familiar (46 px) + label anchored bottom-right, overlapping main's corner.
       */}
      <div
        className="relative flex-shrink-0 mt-6 mx-auto"
        style={{ width: 136, height: 150 }}
      >
        <div className="absolute top-0 left-0">
          <AvatarDropzone initials={npc.initials} size={120} />
        </div>

        <div className="absolute bottom-0 right-0 flex flex-col items-center gap-0.5">
          <div className="rounded-full" style={{ padding: 2, background: "#141414" }}>
            <AvatarDropzone initials={familiarInitials} size={46} />
          </div>
          <span
            className="text-muted-foreground leading-none"
            style={{ fontFamily: "var(--font-body)", fontSize: "0.48rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
          >
            Familiar
          </span>
        </div>
      </div>

      {/* Nome */}
      <div className="text-center px-4 pt-3 pb-4">
        <p
          className="text-foreground leading-tight"
          style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}
        >
          {npc.name}
        </p>
      </div>

      {/* Data fields */}
      <div className="border-t border-border px-4 py-3 flex flex-col gap-2">
        {SIMPLE_FIELD_KEYS.map(({ label, getValue }) => (
          <div key={label} className="flex items-baseline justify-between gap-2">
            <span
              className="text-xs font-bold tracking-wider text-muted-foreground flex-shrink-0"
              style={{ fontFamily: "var(--font-body)", textTransform: "uppercase" }}
            >
              {label}
            </span>
            <span
              className="text-sm font-medium text-white text-right"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {getValue(npc)}
            </span>
          </div>
        ))}

        {/* Subject badge mesclado */}
        {npc.role.length > 0 && (
          <div className="flex items-start justify-between gap-2">
            <span
              className="text-xs font-bold tracking-wider text-muted-foreground flex-shrink-0 pt-0.5"
              style={{ fontFamily: "var(--font-body)", textTransform: "uppercase" }}
            >
              Matéria
            </span>
            <div className="flex flex-wrap gap-1 justify-end">
              <BlendedSubjectBadge roles={npc.role} />
            </div>
          </div>
        )}
      </div>

      {/* Relationship matrix — extracted sub-component */}
      <FriendshipMatrix
        npcId={npc.id}
        players={players}
        friendships={npc.friendships}
        onFriendshipChange={onFriendshipChange}
        currentUser={currentUser}
        activeCharacterId={activeCharacterId}
      />
      </div>
    </>
  );
}
