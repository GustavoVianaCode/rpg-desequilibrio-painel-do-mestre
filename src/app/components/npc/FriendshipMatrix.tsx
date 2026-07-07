import type { Player } from "../player/PlayerCard";
import type { User } from "../../../data/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Friendship {
  playerId: string;
  level: number; // -4 to +4
}

interface FriendshipMatrixProps {
  npcId: string;
  players: Player[];
  friendships: Friendship[];
  onFriendshipChange: (npcId: string, playerId: string, delta: number) => void;
  /** Usuário atualmente autenticado. Controla o filtro de visão. */
  currentUser: User | null;
  /** ID do personagem ativo (relevante apenas para role === "PLAYER"). */
  activeCharacterId: string | null;
}

// ── Friendship level names ─────────────────────────────────────────────────────

const FRIENDSHIP_LEVELS: Record<number, string> = {
  "-4": "Profundo ódio",
  "-3": "Inimigo",
  "-2": "Não gosta",
  "-1": "Não vai com a cara",
   "0": "Neutro",
   "1": "Colega",
   "2": "Parceiro",
   "3": "Amigo",
   "4": "Grande amigo",
};

function getLevelName(level: number): string {
  return FRIENDSHIP_LEVELS[level] ?? "Neutro";
}

// ── Bidirectional bar ─────────────────────────────────────────────────────────

/**
 * Segmented bidirectional thermometer bar.
 * Negative values fill left (red), positive fill right (slate/light).
 * Centre segment always visible as a neutral anchor.
 */
function FriendshipBar({ level }: { level: number }) {
  // 4 segments on each side
  const SEGMENTS = 4;

  return (
    <div className="flex flex-col items-stretch gap-0.5 w-full">
      {/* Bar */}
      <div className="flex items-center gap-px h-2.5">
        {/* Left side (negative) — segments rendered right-to-left */}
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const segmentValue = -(SEGMENTS - i); // -4, -3, -2, -1
          const filled = level <= segmentValue;
          return (
            <div
              key={segmentValue}
              className="flex-1 h-full transition-colors duration-150"
              style={{
                background: filled ? "#c8102e" : "#1e1e1e",
                border: "1px solid #262626",
              }}
            />
          );
        })}

        {/* Centre marker */}
        <div
          className="w-1 h-full flex-shrink-0"
          style={{ background: "#3f3f3f" }}
        />

        {/* Right side (positive) */}
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const segmentValue = i + 1; // 1, 2, 3, 4
          const filled = level >= segmentValue;
          return (
            <div
              key={segmentValue}
              className="flex-1 h-full transition-colors duration-150"
              style={{
                background: filled ? "#e2e8f0" : "#1e1e1e",
                border: "1px solid #262626",
              }}
            />
          );
        })}
      </div>

      {/* Level label */}
      <span
        className="text-sm font-medium text-slate-300 text-center leading-none"
        style={{ letterSpacing: "0.04em" }}
      >
        {getLevelName(level)}
      </span>
    </div>
  );
}

// ── Player thumbnail ──────────────────────────────────────────────────────────

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
 * Supports levels from -4 (Profundo ódio) to +4 (Grande amigo).
 * Designed to be embedded inside NpcCard.
 */
export function FriendshipMatrix({
  npcId,
  players,
  friendships,
  onFriendshipChange,
  currentUser,
  activeCharacterId,
}: FriendshipMatrixProps) {
  const getLevel = (playerId: string) =>
    friendships.find((f) => f.playerId === playerId)?.level ?? 0;

  // PLAYERs só vêem a própria linha; GMs vêem todos.
  const visiblePlayers =
    currentUser?.role === "PLAYER"
      ? players.filter((p) => p.id === activeCharacterId)
      : players;

  return (
    <div className="border-t border-border px-4 pb-4 pt-3" style={{ fontFamily: "var(--font-body)" }}>
      <p
        className="text-muted-foreground mb-3"
        style={{ fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase" }}
      >
        Matriz de Amizade
      </p>

      <div className="overflow-x-auto w-full max-w-full">
        <div className="flex flex-col gap-3 min-w-[300px]">
          {visiblePlayers.length === 0 && (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                color: "#3a3a3a",
                textAlign: "center",
                padding: "0.5rem 0",
              }}
            >
              Sem dados de amizade visíveis.
            </p>
          )}
          {visiblePlayers.map((player) => {
            const level = getLevel(player.id);
            // PLAYER só edita o próprio relacionamento; GM edita todos.
            const isOwnRelationship =
              currentUser?.role !== "PLAYER" || player.id === activeCharacterId;

            return (
              <div key={player.id} className="flex items-center gap-2">
                {/* Player thumbnail */}
                <PlayerThumb player={player} />

                {/* Player name */}
                <span
                  className="text-sm font-medium text-foreground truncate flex-shrink-0"
                  style={{ width: "4rem" }}
                >
                  {player.name}
                </span>

                {/* Minus button */}
                <button
                  onClick={() => onFriendshipChange(npcId, player.id, -1)}
                  disabled={!isOwnRelationship || level <= -4}
                  className="w-8 h-8 flex items-center justify-center border border-border bg-secondary text-foreground hover:border-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150 active:scale-95 flex-shrink-0"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 700, lineHeight: 1 }}
                >
                  −
                </button>

                {/* Bidirectional bar */}
                <div className="flex-1 min-w-0">
                  <FriendshipBar level={level} />
                </div>

                {/* Plus button */}
                <button
                  onClick={() => onFriendshipChange(npcId, player.id, 1)}
                  disabled={!isOwnRelationship || level >= 4}
                  className="w-8 h-8 flex items-center justify-center border border-primary bg-primary text-white hover:opacity-80 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150 active:scale-95 flex-shrink-0"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 700, lineHeight: 1 }}
                >
                  +
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
