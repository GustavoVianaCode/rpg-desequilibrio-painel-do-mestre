/**
 * subjectUtils.ts — Utilitários de lógica de matérias/disciplinas.
 * Funções puras; sem efeitos colaterais nem dependências de UI.
 */
import type { SubjectProps } from "../data/types";

/** Alias conveniente para o union de cores aceito pelo contrato. */
export type SubjectColor = SubjectProps["color"];

// ── Tabela de mesclagem de cores ───────────────────────────────────────────────

/**
 * Regra de negócio para fusão de duas cores de matérias:
 *
 * | Cor A     | Cor B     | Resultado  |
 * |-----------|-----------|------------|
 * | black     | white     | gray       |
 * | black     | gray      | darkGray   |
 * | white     | gray      | lightGray  |
 * | qualquer  | igual     | mantém     |
 * | 1 matéria | —         | mantém     |
 */
const BLEND_MAP: ReadonlyMap<string, SubjectColor> = new Map([
  ["black+white", "gray"],
  ["white+black", "gray"],
  ["black+gray",  "darkGray"],
  ["gray+black",  "darkGray"],
  ["white+gray",  "lightGray"],
  ["gray+white",  "lightGray"],
]);

/**
 * Retorna a cor final (mesclada ou pura) dado um array de `SubjectProps`.
 * Considera apenas as duas primeiras matérias — regra de negócio da Parte 1.
 */
export function getBlendedColor(roles: SubjectProps[]): SubjectColor {
  if (roles.length === 0) return "gray"; // fallback seguro
  if (roles.length === 1) return roles[0].color;

  const a = roles[0].color;
  const b = roles[1].color;

  // Cores iguais → mantém
  if (a === b) return a;

  // Busca na tabela de mesclagem
  return BLEND_MAP.get(`${a}+${b}`) ?? a;
}

/**
 * Retorna o label composto das matérias.
 * Ex: ["Caos", "Tempo"] → "Caos & Tempo"
 * Ex: ["Caos"]          → "Caos"
 */
export function getBlendedLabel(roles: SubjectProps[]): string {
  if (roles.length === 0) return "";
  if (roles.length === 1) return roles[0].name;
  return `${roles[0].name} & ${roles[1].name}`;
}
