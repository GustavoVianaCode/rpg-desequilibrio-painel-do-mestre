/**
 * initialData.ts — Constantes globais e dados mockados para desenvolvimento.
 * Todos os tipos de domínio vêm de `./types`.
 */
import type {
  User,
  SubjectProps,
  Familiar,
  PlayerCharacter,
  NPC,
} from "./types";

// Re-exporta os tipos de domínio para que importadores existentes
// não precisem alterar seus caminhos de import na Fase 1.
export type { User, SubjectProps, Familiar, PlayerCharacter, NPC };
export type { Relationship } from "./types";

// ── Global constants ──────────────────────────────────────────────────────────
export const MAX_PLAYERS = 8;
export const MAX_STRIKES = 4;

// ── Contas fixas da campanha ──────────────────────────────────────────────────
// Novos jogadores podem ser cadastrados em runtime pelo painel Admin (GM).
export const mockUsers: User[] = [
  {
    id: "user-gm",
    name: "MestreMaria",
    email: "gm@equilibrium.rpg",
    password: "Colapso",
    role: "GM",
  },
  {
    id: "user-duda",
    name: "Duda",
    email: "duda@equilibrium.rpg",
    password: "rpg123",
    role: "PLAYER",
  },
  {
    id: "user-pablo",
    name: "Pablo",
    email: "pablo@equilibrium.rpg",
    password: "rpg123",
    role: "PLAYER",
  },
  {
    id: "user-luis",
    name: "Luis",
    email: "luis@equilibrium.rpg",
    password: "rpg123",
    role: "PLAYER",
  },
  {
    id: "user-jp",
    name: "JP",
    email: "jp@equilibrium.rpg",
    password: "rpg123",
    role: "PLAYER",
  },
  {
    id: "user-gusta",
    name: "Gusta",
    email: "gusta@equilibrium.rpg",
    password: "rpg123",
    role: "PLAYER",
  },
  {
    id: "user-gabriel",
    name: "Gabriel",
    email: "gabriel@equilibrium.rpg",
    password: "rpg123",
    role: "PLAYER",
  },
];

// ── Matérias (regras estáticas — não alterar em runtime) ──────────────────────
export const mockSubjects: SubjectProps[] = [
  { id: "subj-01", name: "Caos", color: "gray" },
  { id: "subj-02", name: "Destino", color: "gray" },
  { id: "subj-03", name: "Tempo", color: "gray" },
  { id: "subj-04", name: "Chama", color: "gray" },
  { id: "subj-05", name: "Sonho", color: "white" },
  { id: "subj-06", name: "Pesadelo", color: "black" },
  { id: "subj-07", name: "Força (Ataque)", color: "black" },
  { id: "subj-08", name: "Força (Defesa)", color: "white" },
  { id: "subj-09", name: "Magia (Luz)", color: "white" },
  { id: "subj-10", name: "Magia (Oculta)", color: "black" },
  { id: "subj-11", name: "Agilidade (Velocidade)", color: "white" },
  { id: "subj-12", name: "Agilidade (Acrobacia)", color: "black" },
  { id: "subj-13", name: "Natureza (Conservação)", color: "white" },
  { id: "subj-14", name: "Natureza (Decrépita)", color: "black" },
  { id: "subj-15", name: "Sabedoria (Inteligência)", color: "white" },
  { id: "subj-16", name: "Sabedoria (Esperteza)", color: "black" },
];

/**
 * mockFamiliars — Lista dinâmica de familiares cadastrados pelo GM.
 * Começa apenas com a opção sentinela "Nenhum Familiar"; novos familiares são
 * adicionados em runtime pelo painel administrativo da Mestre.
 */
export const mockFamiliars: Familiar[] = [
  { id: "none", name: "Nenhum Familiar" },
];

// ── Estado inicial — painel inicia completamente vazio ────────────────────────
// A Mestre popula tudo do zero via interface administrativa.
export const INITIAL_PLAYERS: PlayerCharacter[] = [];
export const INITIAL_NPCS: NPC[] = [];
export const INITIAL_FAMILIARS: Familiar[] = [];
export const INITIAL_RELATIONSHIPS: import("./types").Relationship[] = [];
