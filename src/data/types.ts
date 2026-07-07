/**
 * types.ts — Fonte central de verdade para todos os tipos de domínio.
 * Espelha o diagrama de classes relacional definido pelo back-end.
 * Nenhuma lógica de UI aqui; apenas contratos de dados.
 */

// ── Usuário autenticado ───────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hash em produção
  role: "GM" | "PLAYER";
}

// ── Matéria/disciplina ────────────────────────────────────────────────────────

export interface SubjectProps {
  id: string;
  name: string;
  icon?: string;
  color: "black" | "white" | "gray" | "darkGray" | "lightGray";
}

// ── Familiar ──────────────────────────────────────────────────────────────────

export interface Familiar {
  id: string;
  name: string;
}

// ── Vínculo de relacionamento (tabela associativa) ────────────────────────────

export interface Relationship {
  id: string;
  /** ID do PlayerCharacter */
  player: string;
  /** ID do NPC */
  npc: string;
  /** Nível de amizade: −4 a +4 */
  level: number;
}

// ── Personagem do jogador ─────────────────────────────────────────────────────

export interface PlayerCharacter {
  id: string;
  name: string;
  /** Matérias cursadas pelo personagem. */
  role: SubjectProps[];
  initials: string;
  points: number;
  strikes: number;
  dormitory: string;
  imageUrl?: string;
  /** ID do usuário (User) dono deste personagem. */
  playerId: string;
  /** ID referenciando a tabela Familiar. */
  familiarId: string;
}

// ── NPC / Familiar ────────────────────────────────────────────────────────────

export interface NPC {
  id: string;
  name: string;
  /** Matérias cursadas pelo NPC. */
  role: SubjectProps[];
  initials: string;
  points: number;
  strikes: number;
  dormitory: string;
  imageUrl?: string;
  /** ID referenciando a tabela Familiar. */
  familiarId: string;
  /**
   * Tipo do NPC (ex: "Professor", "Aluno", "Guardião").
   * Campo de UI; será normalizado na Fase 2.
   */
  type?: string;
}
