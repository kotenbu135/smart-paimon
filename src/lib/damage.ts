import { calculate_damage, calculate_transformative, calculate_lunar, find_character } from "@kotenbu135/genshin-calc-wasm";
import type { Stats, Enemy, DamageInput, Reaction, DamageType } from "../types/wasm";

export interface TalentRow { name: string; multiplier: number; nonCrit: number; crit: number; average: number; }
export interface TransformativeRow { name: string; damage: number; }

const AMPLIFYING_REACTIONS = new Set(["Vaporize", "Melt"]);
const ADDITIVE_REACTIONS = new Set(["Aggravate", "Spread"]);
const TRANSFORMATIVE_REACTIONS = new Set(["Overloaded", "Superconduct", "ElectroCharged", "Shattered", "Bloom", "Hyperbloom", "Burgeon", "Burning"]);
const LUNAR_REACTIONS = new Set(["LunarElectroCharged", "LunarBloom", "LunarCrystallize", "LunarCrystallizeSecondary"]);

function isSwirl(r: Reaction): boolean { return typeof r === "object" && "Swirl" in r; }
export function isTransformative(r: Reaction): boolean { return (typeof r === "string" && TRANSFORMATIVE_REACTIONS.has(r)) || isSwirl(r); }
export function isLunar(r: Reaction): boolean { return typeof r === "string" && LUNAR_REACTIONS.has(r); }
export function isAmplifyingOrAdditive(r: Reaction): boolean { return typeof r === "string" && (AMPLIFYING_REACTIONS.has(r) || ADDITIVE_REACTIONS.has(r)); }

export function getTalentData(characterId: string) {
  const full = find_character(characterId);
  if (!full?.talents) return null;
  return full.talents;
}

export function computeTalentDamage(
  scalings: any[] | undefined, talentLevel: number, stats: Stats, characterLevel: number,
  element: string, enemy: Enemy, reaction: Reaction | null, damageType: DamageType, reactionBonus: number,
  flatDmg: number = 0,
): TalentRow[] {
  if (!scalings || !Array.isArray(scalings)) return [];
  return scalings.map((s) => {
    const baseMultiplier = s.values?.[talentLevel - 1] ?? 0;
    const db = s.dynamic_bonus;
    const multiplier = db
      ? baseMultiplier + db.max_stacks * (db.per_stack[talentLevel - 1] ?? 0)
      : baseMultiplier;
    const dmgReaction = reaction && isAmplifyingOrAdditive(reaction) ? reaction : null;
    const input: DamageInput = {
      character_level: characterLevel, stats, talent_multiplier: multiplier,
      scaling_stat: s.scaling_stat ?? "Atk", damage_type: damageType,
      element: (s.damage_element ?? element) as any,
      reaction: dmgReaction, reaction_bonus: reactionBonus, flat_dmg: flatDmg,
    };
    try {
      const result = calculate_damage(input, enemy);
      return { name: s.name ?? "?", multiplier, nonCrit: result.non_crit, crit: result.crit, average: result.average };
    } catch { return { name: s.name ?? "?", multiplier, nonCrit: 0, crit: 0, average: 0 }; }
  });
}

export function computeTransformativeDamage(reaction: Reaction, characterLevel: number, elementalMastery: number, enemy: Enemy, reactionBonus: number): TransformativeRow {
  try {
    const result = calculate_transformative({ character_level: characterLevel, elemental_mastery: elementalMastery, reaction, reaction_bonus: reactionBonus }, enemy);
    const name = typeof reaction === "string" ? reaction : `Swirl (${(reaction as any).Swirl})`;
    return { name, damage: result.damage };
  } catch { return { name: String(reaction), damage: 0 }; }
}

export function computeLunarDamage(reaction: Reaction, characterLevel: number, stats: Stats, enemy: Enemy, reactionBonus: number): TransformativeRow {
  try {
    const result = calculate_lunar({ character_level: characterLevel, elemental_mastery: stats.elemental_mastery, reaction, reaction_bonus: reactionBonus, crit_rate: stats.crit_rate, crit_dmg: stats.crit_dmg, base_dmg_bonus: stats.dmg_bonus }, enemy);
    return { name: String(reaction), damage: result.average };
  } catch { return { name: String(reaction), damage: 0 }; }
}
