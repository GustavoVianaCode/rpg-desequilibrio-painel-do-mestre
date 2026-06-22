import { useState } from "react";
import { X } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ModalMode = "player" | "npc";

interface PlayerData {
  name: string;
  role: string;
  initials: string;
  familiarName: string;
  familiarInitials: string;
  dormitory: string;
}

interface NpcData {
  name: string;
  initials: string;
  familiarName: string;
  familiarInitials: string;
  dormitory: string;
  subject: string;
}

interface AddCharacterModalProps {
  mode: ModalMode;
  onAdd: (data: PlayerData | NpcData) => void;
  onClose: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ── Modal ─────────────────────────────────────────────────────────────────────

/**
 * Unified modal for adding either a Player or an NPC/Familiar.
 * The `mode` prop switches the title, field set, and submit payload.
 *
 * Player fields (top → bottom): Nome · Classe · Nome do Familiar
 * NPC fields   (top → bottom): Nome · Matéria · Nome do Familiar · Dormitório
 */
export function AddCharacterModal({ mode, onAdd, onClose }: AddCharacterModalProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");   // player only
  const [subject, setSubject] = useState("");   // npc only
  const [familiarName, setFamiliarName] = useState("");
  const [dormitory, setDormitory] = useState("");   // shared

  const isNpc = mode === "npc";
  const title = isNpc ? "Adicionar NPC / Familiar" : "Adicionar Jogador";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedFamiliar = familiarName.trim() || "—";
    if (!trimmedName) return;

    if (isNpc) {
      onAdd({
        name: trimmedName,
        initials: deriveInitials(trimmedName),
        familiarName: trimmedFamiliar,
        familiarInitials: deriveInitials(trimmedFamiliar),
        dormitory: dormitory.trim() || "—",
        subject: subject.trim() || "—",
      } satisfies NpcData);
    } else {
      onAdd({
        name: trimmedName,
        role: role.trim() || "Aventureiro",
        initials: deriveInitials(trimmedName),
        familiarName: trimmedFamiliar,
        familiarInitials: deriveInitials(trimmedFamiliar),
        dormitory: dormitory.trim() || "—",
      } satisfies PlayerData);
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-card border border-border w-full max-w-sm relative mx-4"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <h3
            className="text-foreground"
            style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            {title}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">

          {/* Field 1 — Nome (shared) */}
          <Field
            label={isNpc ? "Nome do NPC *" : "Nome do Personagem *"}
            value={name}
            onChange={setName}
            placeholder={isNpc ? "ex: Lady Seraphine" : "ex: Sylvara Nightwhisper"}
            autoFocus
          />

          {/* Field 2 — Matéria (NPC) | Classe (Player) */}
          {isNpc ? (
            <Field
              label="Matéria que estuda"
              value={subject}
              onChange={setSubject}
              placeholder="ex: Conjuração Arcana…"
            />
          ) : (
            <Field
              label="Classe"
              value={role}
              onChange={setRole}
              placeholder="ex: Ranger, Bruxo…"
            />
          )}

          {/* Field 3 — Nome do Familiar (shared) */}
          <Field
            label="Nome do Familiar"
            value={familiarName}
            onChange={setFamiliarName}
            placeholder={isNpc ? "ex: Luminar, Sombra…" : "ex: Presa, Névoa…"}
          />

          {/* Field 4 — Dormitório (shared) */}
          <Field
            label="Dormitório"
            value={dormitory}
            onChange={setDormitory}
            placeholder="ex: Torre Norte, Ala Leste…"
          />


          {/* Avatar preview */}
          {name.trim() && (
            <div className="flex items-end gap-2 py-1">
              <AvatarPreview initials={deriveInitials(name)} large />
              {familiarName.trim() && (
                <AvatarPreview initials={deriveInitials(familiarName)} />
              )}
              <span
                className="text-muted-foreground ml-1"
                style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem" }}
              >
                Prévia dos avatares
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2 bg-primary border border-primary text-white hover:opacity-80 disabled:opacity-30 transition-opacity"
              style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Micro-components used only inside this modal ──────────────────────────────

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

function Field({ label, value, onChange, placeholder, autoFocus }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-muted-foreground"
        style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase" }}
      >
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="bg-secondary border border-border text-foreground placeholder-muted-foreground px-3 py-2 outline-none focus:border-primary transition-colors"
        style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem" }}
      />
    </div>
  );
}

function AvatarPreview({ initials, large = false }: { initials: string; large?: boolean }) {
  const size = large ? "w-12 h-12" : "w-8 h-8 mb-0.5";
  const border = large ? "border-2" : "border";
  return (
    <div
      className={`${size} rounded-full ${border} border-border flex items-center justify-center`}
      style={{ background: "#1c1c1c" }}
    >
      <span
        className={large ? "text-foreground" : "text-muted-foreground"}
        style={{ fontFamily: "var(--font-display)", fontSize: large ? "1rem" : "0.65rem", fontWeight: 700 }}
      >
        {initials}
      </span>
    </div>
  );
}
