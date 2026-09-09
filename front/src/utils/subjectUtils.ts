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

// ── URL da Marca ───────────────────────────────────────────────────────────────

/**
 * Normaliza um nome de matéria para uso em nome de arquivo:
 *   1. Minúsculo
 *   2. Remove acentos (NFD + strip combining chars)
 *   3. Remove parênteses e seu conteúdo... na verdade só remove os próprios
 *      caracteres ( e ) para preservar o conteúdo interno
 *   4. Substitui espaços (e sequências) por hífen
 *   5. Remove caracteres não-alfanuméricos restantes (exceto hífen)
 *
 * Ex: "Força (Ataque)" → "forca-ataque"
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove combining accents
    .replace(/[()]/g, "")            // remove parênteses
    .trim()
    .replace(/\s+/g, "-")            // espaços → hífen
    .replace(/[^a-z0-9-]/g, "");     // remove demais caracteres especiais
}

/**
 * Retorna o caminho dinâmico da imagem de Marca para um array de matérias.
 *
 * Regras:
 *  - Normaliza cada nome (minúsculo, sem acento, sem parênteses, espaços→hífen)
 *  - Ordena os slugs alfabeticamente
 *  - Junta com hífen
 *  - Retorna `/marcas/<slug>.webp`
 *
 * Ex: roles = [{name: "Sonho"}, {name: "Caos"}] → "/marcas/caos-sonho.webp"
 * Ex: roles = [{name: "Força (Ataque)"}]         → "/marcas/forca-ataque.webp"
 */
export function getMarkUrl(roles: SubjectProps[]): string {
  if (roles.length === 0) return "/marcas/default.webp";
  const slug = roles
    .map((r) => normalizeName(r.name))
    .sort()
    .join("-");
  return `/marcas/${slug}.webp`;
}
