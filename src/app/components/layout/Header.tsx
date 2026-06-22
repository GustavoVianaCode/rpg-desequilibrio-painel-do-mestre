import { YinYang } from "../shared/YinYang";

/**
 * Sticky top navigation bar.
 * Contains the Yin Yang logo and "Academia Equilibrium" title — no props needed.
 */
export function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-border"
      style={{ background: "#0d0d0d" }}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center gap-4">
        <YinYang size={34} />

        <div className="flex items-baseline gap-2">
          <span
            className="text-foreground"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.15rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Academia
          </span>
          <span
            className="text-primary"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.15rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Equilibrium
          </span>
        </div>

        {/* Decorative divider rule */}
        <div className="flex-1 hidden md:flex items-center ml-4">
          <div className="h-px bg-border flex-1" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary mx-3 flex-shrink-0" />
          <div className="h-px bg-border flex-1" />
        </div>
      </div>
    </header>
  );
}
