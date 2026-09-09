import { useState } from "react";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { mockSubjects } from "../../../data/initialData";
import type { SubjectProps, User, Familiar } from "../../../data/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ModalMode = "player" | "npc";

interface AddCharacterModalProps {
  mode: ModalMode;
  onAdd: (data: Record<string, unknown>) => void;
  onClose: () => void;
  /** Player accounts available for selection (GM-managed, passed from App state). */
  users?: User[];
  /** Familiars available for selection (GM-managed, passed from App state). */
  familiars?: Familiar[];
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
 * Player fields (top → bottom): Nome · Matéria · Conta do Jogador · Familiar · Dormitório
 * NPC fields   (top → bottom): Nome · Matéria · Familiar · Dormitório
 */
export function AddCharacterModal({ mode, onAdd, onClose, users = [], familiars = [] }: AddCharacterModalProps) {
  const [name, setName]               = useState("");
  const [playerId, setPlayerId]       = useState("");   // player only — ID of chosen player User
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectProps[]>([]); // 1–2 subjects
  const [familiarId, setFamiliarId]   = useState("");   // shared — ID of chosen Familiar
  const [dormitory, setDormitory]     = useState("");   // shared

  const isNpc  = mode === "npc";
  const title  = isNpc ? "Adicionar NPC / Familiar" : "Adicionar Jogador";

  // Resolve selected Familiar name for avatar preview
  const selectedFamiliarName = familiars.find((f) => f.id === familiarId)?.name ?? "";

  // ── Toggle subject selection (max 2, Caos ↔ Destino exclusion) ──────────────
  const toggleSubject = (subject: SubjectProps) => {
    setSelectedSubjects((prev) => {
      const isSelected = prev.some((s) => s.id === subject.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== subject.id);
      }
      // Already at max — ignore
      if (prev.length >= 2) return prev;
      return [...prev, subject];
    });
  };

  const isSubjectDisabled = (subject: SubjectProps): boolean => {
    const isSelected = selectedSubjects.some((s) => s.id === subject.id);
    if (isSelected) return false; // always allow de-selection
    if (selectedSubjects.length >= 2) return true; // max reached
    // Caos ↔ Destino mutual exclusion
    const hasCaos    = selectedSubjects.some((s) => s.name === "Caos");
    const hasDestino = selectedSubjects.some((s) => s.name === "Destino");
    if (hasCaos    && subject.name === "Destino") return true;
    if (hasDestino && subject.name === "Caos")    return true;
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    // Rule 3 — must have at least 1 subject
    if (selectedSubjects.length === 0) return;

    if (isNpc) {
      onAdd({
        name: trimmedName,
        initials: deriveInitials(trimmedName),
        familiarId: familiarId || "none",
        dormitory: dormitory.trim() || "—",
        role: selectedSubjects,
      });
    } else {
      onAdd({
        name: trimmedName,
        initials: deriveInitials(trimmedName),
        familiarId: familiarId || "none",
        dormitory: dormitory.trim() || "—",
        role: selectedSubjects,
        playerId: playerId,
      });
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
        className="bg-card border border-border w-full max-w-sm relative mx-4 flex flex-col max-h-[90vh] md:max-h-[80vh]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
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
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 overflow-y-auto flex-1">

          {/* Field 1 — Nome (shared) */}
          <Field
            label={isNpc ? "Nome do NPC *" : "Nome do Personagem *"}
            value={name}
            onChange={setName}
            placeholder={isNpc ? "ex: Lady Seraphine" : "ex: Sylvara Nightwhisper"}
            autoFocus
          />

          {/* Field 2 — Matérias (Grid de seleção múltipla — 1 a 2) */}
          <div className="flex flex-col gap-1.5">
            <span
              className="text-muted-foreground"
              style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase" }}
            >
              Matérias que estuda *
              <span
                className="ml-2"
                style={{ color: selectedSubjects.length === 2 ? "var(--color-primary)" : "inherit", opacity: 0.7 }}
              >
                ({selectedSubjects.length}/2)
              </span>
            </span>
            <SubjectGrid
              subjects={mockSubjects}
              selected={selectedSubjects}
              isDisabled={isSubjectDisabled}
              onToggle={toggleSubject}
            />
            {selectedSubjects.length === 2 && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "var(--color-primary)", opacity: 0.8, marginTop: "2px" }}>
                Máximo de 2 matérias atingido.
              </p>
            )}
          </div>

          {/* Field 3 — Conta do Jogador (Dono) (player only) */}
          {!isNpc && (
            <SelectField label="Conta do Jogador (Dono) *">
              <Select value={playerId} onValueChange={setPlayerId}>
                <SelectTrigger
                  className="bg-secondary border-border text-foreground data-[placeholder]:text-muted-foreground focus-visible:border-primary focus-visible:ring-0 rounded-none h-9"
                  style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem" }}
                >
                  <SelectValue placeholder="Selecione um jogador…" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground rounded-none">
                  {users
                    .filter((u) => u.role === "PLAYER")
                    .map((u) => (
                      <SelectItem
                        key={u.id}
                        value={u.id}
                        className="focus:bg-secondary focus:text-foreground"
                        style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem" }}
                      >
                        {u.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </SelectField>
          )}

          {/* Field 4 — Familiar (shared — dynamic, from App state) */}
          <SelectField label="Familiar">
            <Select value={familiarId} onValueChange={setFamiliarId}>
              <SelectTrigger
                className="bg-secondary border-border text-foreground data-[placeholder]:text-muted-foreground focus-visible:border-primary focus-visible:ring-0 rounded-none h-9"
                style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem" }}
              >
                <SelectValue placeholder="Selecione um familiar…" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground rounded-none">
                {familiars.map((f) => (
                  <SelectItem
                    key={f.id}
                    value={f.id}
                    className="focus:bg-secondary focus:text-foreground"
                    style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem" }}
                  >
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SelectField>

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
              {selectedFamiliarName && (
                <AvatarPreview initials={deriveInitials(selectedFamiliarName)} />
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
              disabled={!name.trim() || (!isNpc && !playerId) || selectedSubjects.length === 0}
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

/** Wrapper that mimics the same label style used by Field, for Select fields. */
function SelectField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="text-muted-foreground"
        style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase" }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

// ── SubjectGrid ───────────────────────────────────────────────────────────────

interface SubjectGridProps {
  subjects: SubjectProps[];
  selected: SubjectProps[];
  isDisabled: (subject: SubjectProps) => boolean;
  onToggle: (subject: SubjectProps) => void;
}

function SubjectGrid({ subjects, selected, isDisabled, onToggle }: SubjectGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      {subjects.map((subject) => {
        const isSelected = selected.some((s) => s.id === subject.id);
        const disabled   = isDisabled(subject);
        return (
          <button
            key={subject.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(subject)}
            title={subject.name}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.75rem",
              letterSpacing: "0.04em",
              padding: "8px 10px",
              minHeight: "2.5rem",
              border: isSelected
                ? "1px solid var(--color-primary)"
                : "1px solid var(--color-border)",
              background: isSelected
                ? "color-mix(in srgb, var(--color-primary) 18%, transparent)"
                : "var(--color-secondary)",
              color: isSelected
                ? "var(--color-primary)"
                : disabled
                ? "var(--color-muted-foreground)"
                : "var(--color-foreground)",
              opacity: disabled ? 0.35 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              textAlign: "left",
              lineHeight: 1.3,
            }}
          >
            {subject.name}
          </button>
        );
      })}
    </div>
  );
}

function AvatarPreview({ initials, large = false }: { initials: string; large?: boolean }) {
  const size   = large ? "w-12 h-12" : "w-8 h-8 mb-0.5";
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
