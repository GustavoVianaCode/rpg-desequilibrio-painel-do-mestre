import { useState } from "react";
import { X, Trash2, Castle, PawPrint, Gamepad2, Sparkles } from "lucide-react";
import { AvatarDropzone } from "../shared/AvatarDropzone";
import { MAX_STRIKES, mockFamiliars } from "../../../data/initialData";
import type { PlayerCharacter, SubjectProps, User } from "../../../data/types";
import { getBlendedColor, getBlendedLabel } from "../../../utils/subjectUtils";
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
 * Player é um alias público para a interface de domínio PlayerCharacter.
 * Re-exportado aqui para que FriendshipMatrix, App e outros componentes
 * não precisem alterar seus caminhos de import.
 */
export type Player = PlayerCharacter;

// ── Helper: resolve o nome do familiar pelo ID ────────────────────────────────

function useFamiliarName(familiarId: string): string {
  return mockFamiliars.find((f) => f.id === familiarId)?.name ?? "—";
}

/** Gera iniciais a partir do nome (máx. 2 letras). */
function toInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// Paleta de estilos compartilhada por cor final (pura ou mesclada)
const SUBJECT_STYLES: Record<SubjectProps["color"], { bg: string; text: string }> = {
  black:     { bg: "#111111", text: "#e5e5e5" },
  white:     { bg: "#e8e8e8", text: "#111111" },
  gray:      { bg: "#3a3a3a", text: "#c5c5c5" },
  darkGray:  { bg: "#252525", text: "#9a9a9a" },
  lightGray: { bg: "#545454", text: "#e0e0e0" },
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

// ── Props ─────────────────────────────────────────────────────────────────────

interface PlayerCardProps {
  player: Player;
  onPointChange: (id: string, delta: number) => void;
  onStrikeChange: (id: string, delta: number) => void;
  onImageChange: (id: string, dataUrl: string) => void;
  onDelete: (id: string) => void;
  currentUser: User | null;
  /** Lista completa de usuários para resolução do nome do controlador. */
  users: User[];
}

// ── Strike row ────────────────────────────────────────────────────────────────

interface StrikeRowProps {
  strikes: number;
  onAdd: () => void;
  onRemove: () => void;
  readOnly?: boolean;
}

function StrikeRow({ strikes, onAdd, onRemove, readOnly = false }: StrikeRowProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-full">
      <p
        className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
        style={{ fontFamily: "var(--font-body)" }}
      >
        Marcas de Falha
      </p>

      <div className="flex items-center gap-1.5">
        {/* Remover */}
        {!readOnly && (
          <button
            onClick={onRemove}
            disabled={strikes <= 0}
            className="w-8 h-8 flex items-center justify-center border border-border bg-secondary text-muted-foreground hover:border-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", lineHeight: 1 }}
            title="Remover marca"
          >
            −
          </button>
        )}

        {/* 4 slots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_STRIKES }, (_, i) => {
            const filled = i < strikes;
            return (
              <div
                key={i}
                className="w-5 h-5 flex items-center justify-center flex-shrink-0 transition-all duration-150"
                style={{ background: filled ? "#c8102e" : "#1a1a1a", border: filled ? "none" : "1px dashed #3a3a3a" }}
              >
                <X size={10} strokeWidth={3} style={{ color: filled ? "#ffffff" : "#3a3a3a" }} />
              </div>
            );
          })}
        </div>

        {/* Adicionar */}
        {!readOnly && (
          <button
            onClick={onAdd}
            disabled={strikes >= MAX_STRIKES}
            className="w-8 h-8 flex items-center justify-center border border-primary bg-primary text-white hover:opacity-80 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", lineHeight: 1 }}
            title="Adicionar marca"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

// ── Info Row ──────────────────────────────────────────────────────────────────

/** Linha de metadado: ícone + label à esquerda, valor truncado à direita. */
function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <span
        className="flex items-center gap-1.5 flex-shrink-0 text-muted-foreground uppercase"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.6rem",
          letterSpacing: "0.1em",
          fontWeight: 700,
        }}
      >
        {icon}
        {label}
      </span>
      <span
        className="text-white text-right truncate"
        style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", fontWeight: 500 }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Player Card ───────────────────────────────────────────────────────────────

export function PlayerCard({
  player,
  onPointChange,
  onStrikeChange,
  onImageChange,
  onDelete,
  currentUser,
  users,
}: PlayerCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isPlayer = currentUser?.role === "PLAYER";

  // Resolve o nome do familiar pelo ID para exibição na UI
  const familiarName     = useFamiliarName(player.familiarId);
  const familiarInitials = toInitials(familiarName);

  // Resolve o nome do jogador controlador pelo playerId
  const controllerName = users.find((u) => u.id === player.playerId)?.name ?? "—";

  // Determina se este card pertence ao próprio usuário logado
  const isOwnCard = !!currentUser && player.playerId === currentUser.id;

  return (
    <>
      {/* ── Modal de confirmação de exclusão ─────────────────────────────────── */}
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
              <span className="text-foreground font-semibold">{player.name}</span>? Esta ação
              não pode ser desfeita.{" "}
              <span className="text-amber-400">
                Ele também será removido das amizades de todos os NPCs.
              </span>
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
              onClick={() => onDelete(player.id)}
              className="bg-red-700 hover:bg-red-600 text-white border-0"
              style={{ fontFamily: "var(--font-display)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/*
       * Card wrapper.
       * isOwnCard → borda + glow vermelhos, ring externo para destacar visualmente.
       */}
      <div
        className={[
          "bg-card border flex flex-col items-center gap-3 p-5 relative transition-all duration-300",
          isOwnCard
            ? "border-primary shadow-[0_0_24px_4px_rgba(200,16,46,0.3)] ring-1 ring-primary/60 ring-offset-2 ring-offset-background"
            : "border-border",
        ].join(" ")}
        style={{ fontFamily: "var(--font-body)" }}
      >
        {/* Top accent rule — gradiente no card próprio, cor sólida nos outros */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: isOwnCard
              ? "linear-gradient(90deg, transparent 0%, #c8102e 30%, #ff3d5e 50%, #c8102e 70%, transparent 100%)"
              : "var(--color-primary)",
          }}
        />

        {/* Badge "SEU PERSONAGEM" — visível apenas para o próprio jogador */}
        {isOwnCard && (
          <div
            className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-0.5"
            style={{
              background: "rgba(200,16,46,0.15)",
              border: "1px solid rgba(200,16,46,0.5)",
              backdropFilter: "blur(6px)",
              borderRadius: 2,
            }}
          >
            <Sparkles size={9} style={{ color: "#ff6680", flexShrink: 0 }} strokeWidth={2} />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.46rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#ff6680",
                fontWeight: 700,
              }}
            >
              Seu Personagem
            </span>
          </div>
        )}

        {/* Delete button — oculto para PLAYERs */}
        {!isPlayer && (
          <button
            onClick={() => setConfirmOpen(true)}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors duration-150 z-10"
            title="Excluir jogador"
          >
            <Trash2 size={13} strokeWidth={2} />
          </button>
        )}

        {/*
         * Avatar group — 160 × 176 px container.
         * Main avatar (144 px) anchored top-left.
         * Familiar (52 px) + label anchored bottom-right, overlapping main's corner.
         */}
        <div className="relative flex-shrink-0 mt-2" style={{ width: 160, height: 176 }}>
          <div className="absolute top-0 left-0">
            <AvatarDropzone
              initials={player.initials}
              size={144}
              onImageChange={(dataUrl) => onImageChange(player.id, dataUrl)}
            />
          </div>

          <div className="absolute bottom-0 right-0 flex flex-col items-center gap-0.5">
            <div className="rounded-full" style={{ padding: 2, background: "#141414" }}>
              <AvatarDropzone initials={familiarInitials} size={52} />
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
        <div className="text-center">
          <p
            className="text-foreground leading-tight"
            style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}
          >
            {player.name}
          </p>
        </div>

        {/* Subject badge mesclado (role[]) */}
        {player.role.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            <BlendedSubjectBadge roles={player.role} />
          </div>
        )}

        {/* ── Bloco de informações contextuais ────────────────────────────────── */}
        <div
          className="w-full flex flex-col gap-1.5 py-2.5 px-2"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 2,
          }}
        >
          {/* Dormitório */}
          {player.dormitory && player.dormitory !== "—" && (
            <InfoRow
              icon={<Castle size={10} strokeWidth={2} />}
              label="Dormitório"
              value={player.dormitory}
            />
          )}

          {/* Familiar */}
          {familiarName && familiarName !== "Nenhum Familiar" && (
            <InfoRow
              icon={<PawPrint size={10} strokeWidth={2} />}
              label="Familiar"
              value={familiarName}
            />
          )}

          {/* Controlado por */}
          <InfoRow
            icon={<Gamepad2 size={10} strokeWidth={2} />}
            label="Jogador"
            value={controllerName}
          />
        </div>

        {/* Marcas de Falha */}
        <StrikeRow
          strikes={player.strikes}
          onAdd={() => onStrikeChange(player.id, 1)}
          onRemove={() => onStrikeChange(player.id, -1)}
          readOnly={isPlayer}
        />

        {/* Divisor */}
        <div className="w-full h-px bg-border" />

        {/* Pontos */}
        <div className="flex flex-col items-center gap-0.5">
          <p
            className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Pontos
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "1.9rem",
              fontWeight: 700,
              lineHeight: 1,
              // Negative values get a distinct color to signal a penalty state
              color: player.points < 0 ? "#c8102e" : "var(--color-primary)",
            }}
          >
            {player.points < 0
              ? `-${Math.abs(player.points).toString().padStart(2, "0")}`
              : player.points.toString().padStart(3, "0")}
          </p>
        </div>

        {/* Botões de ponto — ocultos para PLAYERs */}
        {!isPlayer && (
          <div className="grid grid-cols-4 gap-1.5 w-full mt-auto">
            {[
              { label: "+5", delta: 5,  variant: "primary"   },
              { label: "+1", delta: 1,  variant: "primary"   },
              { label: "−1", delta: -1, variant: "secondary" },
              { label: "−5", delta: -5, variant: "secondary" },
            ].map(({ label, delta, variant }) => (
              <button
                key={label}
                onClick={() => onPointChange(player.id, delta)}
                className={[
                  "h-9 flex items-center justify-center transition-all duration-150 select-none border",
                  variant === "primary"
                    ? "bg-primary border-primary text-white hover:opacity-80 active:opacity-60"
                    : "bg-secondary border-border text-muted-foreground hover:border-primary hover:text-foreground active:opacity-60",
                ].join(" ")}
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 700 }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
