import type { TFunction } from "i18next";
import CHARACTER_NAMES_JA from "../data/characterNamesJa";
import WEAPON_NAMES_JA from "../data/weaponNamesJa";
import TALENT_NAMES_EN from "../data/talentNamesEn";
import TALENT_NAMES_JA from "../data/talentNamesJa";

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
