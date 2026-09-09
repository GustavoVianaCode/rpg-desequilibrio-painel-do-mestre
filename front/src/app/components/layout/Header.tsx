import { YinYang } from "../shared/YinYang";
import { useAuth } from "../../context/AuthContext";
import { LogOut, ShieldCheck } from "lucide-react";

interface HeaderProps {
  onShowAdmin?: () => void;
}

/**
 * Sticky top navigation bar.
 * Contains the Yin Yang logo, "Academia Aequilibrium" title, and session actions.
 */
export function Header({ onShowAdmin }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const isGm = currentUser?.role === "GM";

  return (
    <header
      className="sticky top-0 z-50 border-b border-border"
      style={{ background: "#0d0d0d" }}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <YinYang size={30} className="flex-shrink-0" />

          <div className="flex items-baseline gap-1.5 min-w-0">
            <span
              className="text-foreground truncate"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Academia
            </span>
            <span
              className="text-primary truncate"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Aequilibrium
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isGm && onShowAdmin && (
            <button
              onClick={onShowAdmin}
              title="Painel Administrativo"
              className="flex items-center gap-1.5 bg-transparent border border-neutral-800 px-2.5 py-1.5 hover:border-primary transition-all duration-150 cursor-pointer h-9"
            >
              <ShieldCheck size={13} className="text-neutral-400" strokeWidth={2} />
              <span
                className="hidden sm:inline text-neutral-400"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Admin
              </span>
            </button>
          )}

          {currentUser && (
            <button
              onClick={logout}
              title="Sair"
              className="flex items-center gap-1.5 bg-transparent border border-neutral-800 px-2.5 py-1.5 hover:border-primary transition-all duration-150 cursor-pointer h-9"
            >
              <LogOut size={13} className="text-neutral-400" strokeWidth={2} />
              <span
                className="hidden sm:inline text-neutral-400"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {currentUser.name}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
