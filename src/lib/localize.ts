import type { TFunction } from "i18next";
import CHARACTER_NAMES_JA from "../data/characterNamesJa";
import WEAPON_NAMES_JA from "../data/weaponNamesJa";
import TALENT_NAMES_EN from "../data/talentNamesEn";
import TALENT_NAMES_JA from "../data/talentNamesJa";
import NORMAL_ATTACK_NAMES_JA from "../data/normalAttackNamesJa";
import SKILL_NAMES_JA from "../data/skillNamesJa";
import BURST_NAMES_JA from "../data/burstNamesJa";
import PASSIVE_NAMES_JA from "../data/passiveNamesJa";
import CONSTELLATION_NAMES_JA from "../data/constellationNamesJa";
import ARTIFACT_SET_NAMES_JA from "../data/artifactSetNamesJa";

/** Map WASM weapon sub_stat keys to i18n artifact.stat keys */
const WEAPON_STAT_I18N: Record<string, string> = {
  AtkPercent: "artifact.stat.atkPercent",
  DefPercent: "artifact.stat.defPercent",
  HpPercent: "artifact.stat.hpPercent",
  CritRate: "artifact.stat.critRate",
  CritDmg: "artifact.stat.critDmg",
  ElementalMastery: "artifact.stat.em",
  EnergyRecharge: "artifact.stat.er",
  PhysicalDmgBonus: "artifact.stat.physicalDmg",
};

/** Map WASM reaction enum values to i18n reaction keys */
const REACTION_I18N: Record<string, string> = {
  Vaporize: "reaction.vaporize",
  Melt: "reaction.melt",
  Overloaded: "reaction.overloaded",
  Superconduct: "reaction.superconduct",
  ElectroCharged: "reaction.electroCharged",
  Bloom: "reaction.bloom",
  Hyperbloom: "reaction.hyperbloom",
  Burgeon: "reaction.burgeon",
  Burning: "reaction.burning",
  Aggravate: "reaction.aggravate",
  Spread: "reaction.spread",
  LunarElectroCharged: "reaction.lunarElectroCharged",
  LunarBloom: "reaction.lunarBloom",
  LunarCrystallize: "reaction.lunarCrystallize",
  LunarCrystallizeSecondary: "reaction.lunarCrystallizeSecondary",
};

export function localizeCharacterName(id: string, wasmName: string, locale: string): string {
  if (locale === "ja") return CHARACTER_NAMES_JA[id] ?? wasmName;
  return wasmName;
}

export function localizeWeaponName(id: string, wasmName: string, locale: string): string {
  if (locale === "ja") return WEAPON_NAMES_JA[id] ?? wasmName;
  return wasmName;
}

export function localizeWeaponStat(statKey: string, t: TFunction): string {
  const i18nKey = WEAPON_STAT_I18N[statKey];
  return i18nKey ? t(i18nKey) : statKey;
}

export function localizeTalentName(name: string, locale: string): string {
  if (locale === "en") return TALENT_NAMES_EN[name] ?? name;
  if (locale === "ja") return TALENT_NAMES_JA[name] ?? name;
  return name;
}

export function localizeNormalAttackName(name: string, locale: string): string {
  if (locale === "ja") return NORMAL_ATTACK_NAMES_JA[name] ?? name;
  return name;
}

export function localizeSkillName(name: string, locale: string): string {
  if (locale === "ja") return SKILL_NAMES_JA[name] ?? name;
  return name;
}

export function localizeBurstName(name: string, locale: string): string {
  if (locale === "ja") return BURST_NAMES_JA[name] ?? name;
  return name;
}

export function localizePassiveName(name: string, locale: string): string {
  if (locale === "ja") return PASSIVE_NAMES_JA[name] ?? name;
  return name;
}

export function localizeConstellationName(name: string, locale: string): string {
  if (locale === "ja") return CONSTELLATION_NAMES_JA[name] ?? name;
  return name;
}

export function localizeArtifactSetName(id: string, wasmName: string, locale: string): string {
  if (locale === "ja") return ARTIFACT_SET_NAMES_JA[id] ?? wasmName;
  return wasmName;
}

/**
 * Build a sorted list of EN talent/passive/constellation names for prefix matching.
 * Sorted by descending length to match the longest name first.
 */
function buildNameEntries(): readonly [string, string][] {
  const merged: Record<string, string> = {
    ...NORMAL_ATTACK_NAMES_JA,
    ...SKILL_NAMES_JA,
    ...BURST_NAMES_JA,
    ...PASSIVE_NAMES_JA,
    ...CONSTELLATION_NAMES_JA,
  };
  return Object.entries(merged).sort((a, b) => b[0].length - a[0].length);
}

let cachedEntries: readonly [string, string][] | null = null;

function getNameEntries(): readonly [string, string][] {
  if (!cachedEntries) cachedEntries = buildNameEntries();
  return cachedEntries;
}

/**
 * Build a sorted list of EN character display names → JA for prefix matching.
 * Derives display names from IDs: "columbina" → "Columbina", "hu_tao" → "Hu Tao".
 * Sorted by descending length to match the longest name first.
 */
function buildCharNameEntries(): readonly [string, string][] {
  const entries: [string, string][] = [];
  for (const [id, ja] of Object.entries(CHARACTER_NAMES_JA)) {
    const en = id.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    entries.push([en, ja]);
  }
  return entries.sort((a, b) => b[0].length - a[0].length);
}

let cachedCharEntries: readonly [string, string][] | null = null;

function getCharNameEntries(): readonly [string, string][] {
  if (!cachedCharEntries) cachedCharEntries = buildCharNameEntries();
  return cachedCharEntries;
}

// ---------- English → Japanese term replacement tables ----------

/** Element name replacement (applied as whole words) */
const ELEMENT_EN_JA: readonly [string, string][] = [
  ["Pyro", "炎元素"],
  ["Hydro", "水元素"],
  ["Cryo", "氷元素"],
  ["Electro", "雷元素"],
  ["Geo", "岩元素"],
  ["Dendro", "草元素"],
  ["Anemo", "風元素"],
  ["Physical", "物理"],
];

/** Stat/operation suffix replacement (longer patterns first to avoid partial matches) */
const STAT_TERMS_EN_JA: readonly [string, string][] = [
  ["Lunar Reaction DMG", "月反応ダメージ"],
  ["Elemental CritDMG", "元素会心ダメージ"],
  ["CRIT DMG Bonus", "会心ダメージ"],
  ["Max HP Bonus", "HP上限"],
  ["RES Reduction", "耐性減少"],
  ["RES Shred", "耐性減少"],
  ["DMG Bonus", "ダメージ"],
  ["ATK Bonus", "攻撃力"],
  ["DEF Bonus", "防御力"],
  ["EM Share", "元素熟知シェア"],
  ["CRIT DMG", "会心ダメージ"],
  ["CritDMG", "会心ダメージ"],
  ["AtkFlat", "攻撃力"],
  ["AtkPercent", "攻撃力%"],
  ["DefFlat", "防御力"],
  ["DefPercent", "防御力%"],
  ["HpFlat", "HP"],
  ["HpPercent", "HP%"],
  ["CritRate", "会心率"],
];

/** Replace known English element names and stat terms with Japanese */
function localizeEnglishTerms(s: string): string {
  let result = s;
  for (const [en, ja] of STAT_TERMS_EN_JA) {
    result = result.replaceAll(en, ja);
  }
  for (const [en, ja] of ELEMENT_EN_JA) {
    result = result.replaceAll(en, ja);
  }
  return result;
}

/** Try to parse a pure snake_case internal ID into a readable JP name */
function parseInternalId(id: string): string | null {
  // Try character ID prefix: "iansan_a1_atk" → "イアンサ A1 攻撃力"
  for (const [charId, charJa] of Object.entries(CHARACTER_NAMES_JA)) {
    if (!id.startsWith(charId + "_")) continue;
    const rest = id.slice(charId.length + 1);
    // Match passive/constellation pattern: a1, a4, c1-c6
    const match = rest.match(/^([ac]\d)_(.+)$/);
    if (match) {
      const type = match[1].toUpperCase();
      const stat = localizeEnglishTerms(match[2].replaceAll("_", " "));
      return `${charJa} ${type} ${stat}`;
    }
    // Fallback: just humanize underscores
    const humanized = localizeEnglishTerms(rest.replaceAll("_", " "));
    return `${charJa} ${humanized}`;
  }

  // Try weapon ID prefix
  for (const [weaponId, weaponJa] of Object.entries(WEAPON_NAMES_JA)) {
    if (!id.startsWith(weaponId + "_")) continue;
    const rest = id.slice(weaponId.length + 1);
    const humanized = localizeEnglishTerms(rest.replaceAll("_", " "));
    return `${weaponJa} ${humanized}`;
  }

  // Try artifact set ID prefix
  for (const [setId, setJa] of Object.entries(ARTIFACT_SET_NAMES_JA)) {
    if (!id.startsWith(setId + "_")) continue;
    const rest = id.slice(setId.length + 1);
    const humanized = localizeEnglishTerms(rest.replaceAll("_", " "));
    return `${setJa} ${humanized}`;
  }

  return null;
}

/**
 * Localize a WASM buff source name.
 *
 * Handles multiple WASM naming patterns:
 * - "Fantastic Voyage ATK Bonus" → talent name prefix match + EN term translation
 * - "ヨウル・スクラッチ Pyro RES Reduction" → JP name with EN suffix translation
 * - "iansan_a1_atk" → internal ID parsing
 * - "homa_hp_atk (Staff of Homa)" → strip internal ID, use paren content
 * - "Columbina C3 Lunar Reaction DMG" → character name + EN term translation
 * - "旧貴族のしつけ 2pc" → already JP, returned as-is
 */
export function localizeBuffSource(source: string, locale: string): string {
  if (locale !== "ja") return source;

  // Pattern: "internal_snake_id (readable name)" → strip ID, use paren content
  const internalIdMatch = source.match(/^[a-z][a-z0-9_]+ \((.+)\)$/);
  if (internalIdMatch) {
    const inner = internalIdMatch[1];
    // If parens contain Japanese, return as-is; otherwise localize English terms
    if (/[\u3000-\u9FFF\uF900-\uFAFF]/.test(inner)) return inner;
    return localizeEnglishTerms(inner);
  }

  // Pure internal ID (all snake_case, no spaces): "iansan_a1_atk"
  if (/^[a-z][a-z0-9_]+$/.test(source)) {
    return parseInternalId(source) ?? source;
  }

  // Contains Japanese characters → translate English suffixes only
  if (/[\u3000-\u9FFF\uF900-\uFAFF]/.test(source)) {
    return localizeEnglishTerms(source);
  }

  // Strip optional "C1: " style prefix before talent name matching
  const cMatch = source.match(/^(C\d+:\s*)(.*)/);
  const prefix = cMatch ? cMatch[1] : "";
  const body = cMatch ? cMatch[2] : source;

  // Try matching against known EN talent/passive/constellation names (longest first)
  for (const [en, ja] of getNameEntries()) {
    if (body.startsWith(en)) {
      const rest = body.slice(en.length);
      return prefix + ja + localizeEnglishTerms(rest);
    }
  }

  // Try matching character display name prefix: "Columbina C3 ..." → "コロンビーナ C3 ..."
  for (const [en, ja] of getCharNameEntries()) {
    if (source.startsWith(en + " ")) {
      return ja + localizeEnglishTerms(source.slice(en.length));
    }
  }

  // Final fallback: translate any remaining English terms
  return localizeEnglishTerms(source);
}

export function localizeReactionName(name: string, t: TFunction): string {
  // Handle Swirl(Element) format
  const swirlMatch = name.match(/^Swirl \((\w+)\)$/);
  if (swirlMatch) {
    const element = swirlMatch[1];
    const swirlLabel = t("reaction.swirl");
    const elementLabel = t(`element.${element.toLowerCase()}`);
    return `${swirlLabel} (${elementLabel})`;
  }
  const i18nKey = REACTION_I18N[name];
  return i18nKey ? t(i18nKey) : name;
}
