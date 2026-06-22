import { X } from "lucide-react";
import { AvatarDropzone } from "../shared/AvatarDropzone";
import { MAX_STRIKES } from "../../../data/initialData";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Player {
  id: number;
  name: string;
  role: string;
  initials: string;
  points: number;
  familiarName: string;
  familiarInitials: string;
  dormitory: string;
  strikes: number;
  imageUrl?: string;
}

interface PlayerCardProps {
  player: Player;
  onPointChange: (id: number, delta: number) => void;
  onStrikeChange: (id: number, delta: number) => void;
  onImageChange: (id: number, dataUrl: string) => void;
}

// ── Strike row ────────────────────────────────────────────────────────────────

interface StrikeRowProps {
  strikes: number;
  onAdd: () => void;
  onRemove: () => void;
}

function StrikeRow({ strikes, onAdd, onRemove }: StrikeRowProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-full">
      <p
        className="text-muted-foreground"
        style={{ fontFamily: "var(--font-body)", fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase" }}
      >
        Marcas de Falha
      </p>

      <div className="flex items-center gap-1.5">
        {/* Remover */}
        <button
          onClick={onRemove}
          disabled={strikes <= 0}
          className="w-6 h-6 flex items-center justify-center border border-border bg-secondary text-muted-foreground hover:border-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", lineHeight: 1 }}
          title="Remover marca"
        >
          −
        </button>

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
        <button
          onClick={onAdd}
          disabled={strikes >= MAX_STRIKES}
          className="w-6 h-6 flex items-center justify-center border border-primary bg-primary text-white hover:opacity-80 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", lineHeight: 1 }}
          title="Adicionar marca"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ── Player Card ───────────────────────────────────────────────────────────────

export function PlayerCard({ player, onPointChange, onStrikeChange, onImageChange }: PlayerCardProps) {
  return (
    <div
      className="bg-card border border-border flex flex-col items-center gap-3 p-5 relative"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* Top accent rule */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />

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
            <AvatarDropzone initials={player.familiarInitials} size={52} />
          </div>
          <span
            className="text-muted-foreground leading-none"
            style={{ fontFamily: "var(--font-body)", fontSize: "0.48rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
          >
            Familiar
          </span>
        </div>
      </div>

      {/* Nome + Classe */}
      <div className="text-center">
        <p
          className="text-foreground leading-tight"
          style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}
        >
          {player.name}
        </p>
        <p
          className="text-muted-foreground mt-0.5"
          style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", letterSpacing: "0.13em", textTransform: "uppercase" }}
        >
          {player.role}
        </p>
      </div>

      {/* Dormitório */}
      {player.dormitory && player.dormitory !== "—" && (
        <div className="flex items-baseline justify-between gap-2 w-full px-1">
          <span
            className="text-muted-foreground flex-shrink-0"
            style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
          >
            Dormitório
          </span>
          <span
            className="text-foreground text-right"
            style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem" }}
          >
            {player.dormitory}
          </span>
        </div>
      )}

      {/* Marcas de Falha */}
      <StrikeRow
        strikes={player.strikes}
        onAdd={() => onStrikeChange(player.id, 1)}
        onRemove={() => onStrikeChange(player.id, -1)}
      />

      {/* Divisor */}
      <div className="w-full h-px bg-border" />

      {/* Pontos */}
      <div className="flex flex-col items-center gap-0.5">
        <p
          className="text-muted-foreground"
          style={{ fontFamily: "var(--font-body)", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase" }}
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

      {/* Botões de ponto */}
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
              "py-1.5 text-center transition-all duration-150 select-none border",
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
    </div>
  );
}
