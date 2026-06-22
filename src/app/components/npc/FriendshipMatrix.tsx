import type { Player } from "../player/PlayerCard";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Friendship {
  playerId: number;
  level: number; // 0–4
}

interface FriendshipMatrixProps {
  npcId: number;
  players: Player[];
  friendships: Friendship[];
  onFriendshipChange: (npcId: number, playerId: number, delta: number) => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FriendshipDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full transition-colors duration-150"
          style={i < level ? { background: "#c8102e" } : { background: "#1e1e1e", border: "1px solid #262626" }}
        />
      ))}
    </div>
  );
}

/** Shows uploaded photo if available, otherwise falls back to the player's initials. */
function PlayerThumb({ player }: { player: Player }) {
  return (
    <div
      className="w-7 h-7 rounded-full border border-border flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ background: "#1e1e1e" }}
    >
      {player.imageUrl ? (
        <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" />
      ) : (
        <span
          className="text-muted-foreground select-none"
          style={{ fontFamily: "var(--font-display)", fontSize: "0.5rem", fontWeight: 700 }}
        >
          {player.initials}
        </span>
      )}
    </div>
  );
}

// ── Friendship Matrix ─────────────────────────────────────────────────────────

/**
 * Standalone relationship matrix listing all players with their friendship tier.
 * Designed to be embedded inside NpcCard.
 */
export function FriendshipMatrix({ npcId, players, friendships, onFriendshipChange }: FriendshipMatrixProps) {
  const getLevel = (playerId: number) =>
    friendships.find((f) => f.playerId === playerId)?.level ?? 0;

  return (
    <div className="border-t border-border px-4 pb-4 pt-3" style={{ fontFamily: "var(--font-body)" }}>
      <p
        className="text-muted-foreground mb-3"
        style={{ fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase" }}
      >
        Matriz de Amizade
      </p>

      <div className="flex flex-col gap-2.5">
        {players.map((player) => {
          const level = getLevel(player.id);
          return (
            <div key={player.id} className="flex items-center gap-2">
              {/* Player thumbnail */}
              <PlayerThumb player={player} />

              {/* Player name */}
              <span
                className="text-foreground truncate flex-1 min-w-0"
                style={{ fontSize: "0.68rem" }}
              >
                {player.name}
              </span>

              {/* Large-target +/- controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onFriendshipChange(npcId, player.id, -1)}
                  disabled={level <= 0}
                  className="w-8 h-8 flex items-center justify-center border border-border bg-secondary text-foreground hover:border-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 700, lineHeight: 1 }}
                >
                  −
                </button>
                <FriendshipDots level={level} />
                <button
                  onClick={() => onFriendshipChange(npcId, player.id, 1)}
                  disabled={level >= 4}
                  className="w-8 h-8 flex items-center justify-center border border-primary bg-primary text-white hover:opacity-80 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 700, lineHeight: 1 }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
