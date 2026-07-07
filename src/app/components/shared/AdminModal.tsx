import { useState } from "react";
import { X, UserPlus, PawPrint, ShieldCheck } from "lucide-react";
import type { User, Familiar } from "../../../data/types";

// ── Props ─────────────────────────────────────────────────────────────────────

interface AdminModalProps {
  onClose: () => void;
  /** Called when the GM registers a new player account. */
  onAddUser: (user: User) => void;
  /** Called when the GM registers a new familiar. */
  onAddFamiliar: (familiar: Familiar) => void;
}

type Tab = "players" | "familiars";

// ── Helpers ───────────────────────────────────────────────────────────────────

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

// ── Modal ─────────────────────────────────────────────────────────────────────

/**
 * AdminModal — Painel exclusivo para o GM.
 * Permite cadastrar Contas de Jogador e Familiares em runtime.
 * Os dados retornam via callbacks para que o App.tsx os gerencie no estado reativo.
 */
export function AdminModal({ onClose, onAddUser, onAddFamiliar }: AdminModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("players");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-card border border-border w-full max-w-md relative mx-4 flex flex-col max-h-[90vh] md:max-h-[80vh]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {/* Red accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-primary" strokeWidth={2} />
            <h3
              className="text-foreground"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.9rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Painel Administrativo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* GM badge */}
        <div className="px-6 pt-3 pb-0 flex-shrink-0">
          <span
            className="inline-block text-primary border border-primary px-2 py-0.5"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.55rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Acesso restrito — Mestre
          </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mt-4 flex-shrink-0">
          <TabButton
            icon={<UserPlus size={12} strokeWidth={2} />}
            label="Cadastrar Jogador"
            active={activeTab === "players"}
            onClick={() => setActiveTab("players")}
          />
          <TabButton
            icon={<PawPrint size={12} strokeWidth={2} />}
            label="Cadastrar Familiar"
            active={activeTab === "familiars"}
            onClick={() => setActiveTab("familiars")}
          />
        </div>

        {/* Tab panels */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {activeTab === "players" && (
            <RegisterPlayerForm
              onSubmit={(user) => {
                onAddUser(user);
              }}
            />
          )}
          {activeTab === "familiars" && (
            <RegisterFamiliarForm
              onSubmit={(familiar) => {
                onAddFamiliar(familiar);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "0.65rem",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        flex: 1,
        padding: "0.6rem 0.75rem",
        borderBottom: active ? "2px solid var(--color-primary, #c8102e)" : "2px solid transparent",
        color: active ? "var(--color-foreground, #fff)" : "var(--color-muted-foreground, #6b7280)",
        background: "transparent",
        cursor: "pointer",
        transition: "color 0.15s ease, border-color 0.15s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.4rem",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Register Player form ──────────────────────────────────────────────────────

function RegisterPlayerForm({ onSubmit }: { onSubmit: (user: User) => void }) {
  const [name, setName]         = useState("");
  const [password, setPassword] = useState("rpg123");
  const [success, setSuccess]   = useState<string | null>(null);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const user: User = {
      id: newId("user"),
      name: trimmed,
      email: `${trimmed.toLowerCase().replace(/\s+/g, ".")}@equilibrium.rpg`,
      password: password.trim() || "rpg123",
      role: "PLAYER",
    };

    onSubmit(user);
    setSuccess(`Conta "${trimmed}" cadastrada com sucesso!`);
    setName("");
    setPassword("rpg123");
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <form onSubmit={handle} className="flex flex-col gap-4">
      <p
        className="text-muted-foreground"
        style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", lineHeight: 1.5 }}
      >
        Crie uma conta de jogador. Ela ficará disponível no seletor "Conta do Jogador"
        ao adicionar um novo personagem.
      </p>

      <FormField
        label="Nome do Jogador *"
        value={name}
        onChange={setName}
        placeholder="ex: Duda"
        autoFocus
      />

      <FormField
        label="Senha Temporária"
        value={password}
        onChange={setPassword}
        placeholder="rpg123"
        type="text"
      />

      {success && (
        <div
          className="border border-primary text-primary px-3 py-2"
          style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem" }}
        >
          ✓ {success}
        </div>
      )}

      <button
        type="submit"
        disabled={!name.trim()}
        className="w-full py-2 bg-primary border border-primary text-white hover:opacity-80 disabled:opacity-30 transition-opacity"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Cadastrar Conta
      </button>
    </form>
  );
}

// ── Register Familiar form ────────────────────────────────────────────────────

function RegisterFamiliarForm({ onSubmit }: { onSubmit: (familiar: Familiar) => void }) {
  const [name, setName]       = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const familiar: Familiar = {
      id: newId("fam"),
      name: trimmed,
    };

    onSubmit(familiar);
    setSuccess(`Familiar "${trimmed}" cadastrado com sucesso!`);
    setName("");
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <form onSubmit={handle} className="flex flex-col gap-4">
      <p
        className="text-muted-foreground"
        style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", lineHeight: 1.5 }}
      >
        Registre um familiar. Ele aparecerá no seletor "Familiar" ao criar
        personagens (Jogadores ou NPCs).
      </p>

      <FormField
        label="Nome do Familiar *"
        value={name}
        onChange={setName}
        placeholder="ex: Sombra, Aurora, Rex…"
        autoFocus
      />

      {success && (
        <div
          className="border border-primary text-primary px-3 py-2"
          style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem" }}
        >
          ✓ {success}
        </div>
      )}

      <button
        type="submit"
        disabled={!name.trim()}
        className="w-full py-2 bg-primary border border-primary text-white hover:opacity-80 disabled:opacity-30 transition-opacity"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Cadastrar Familiar
      </button>
    </form>
  );
}

// ── Shared field component ────────────────────────────────────────────────────

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  type?: string;
}

function FormField({ label, value, onChange, placeholder, autoFocus, type = "text" }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-muted-foreground"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.62rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      <input
        type={type}
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
