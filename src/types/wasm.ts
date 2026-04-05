// genshin-calc-wasm TypeScript type definitions (local)
// Migrated from @kotenbu135/genshin-calc-wasm types and extended for v0.2.4

export interface ExtendedStats {
  hp: number;
  atk: number;
  def: number;
  elemental_mastery: number;
  crit_rate: number;
  crit_dmg: number;
  energy_recharge: number;
  dmg_bonus: number;
  // per-element DMG bonus fields (new in v0.2.4)
  pyro_dmg_bonus: number;
  hydro_dmg_bonus: number;
  electro_dmg_bonus: number;
  cryo_dmg_bonus: number;
  dendro_dmg_bonus: number;
  anemo_dmg_bonus: number;
  geo_dmg_bonus: number;
  physical_dmg_bonus: number;
}

// Stats is an alias for ExtendedStats for backward compatibility
export type Stats = ExtendedStats;

export type Element = "Pyro" | "Hydro" | "Electro" | "Cryo" | "Anemo" | "Geo" | "Dendro";
export type ScalingStat = "Atk" | "Hp" | "Def" | "Em";
export type DamageType = "Normal" | "Charged" | "Plunging" | "Skill" | "Burst";
export type WeaponType = "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst";

export type Reaction =
  | "Vaporize" | "Melt"
  | "Aggravate" | "Spread"
  | "Overloaded" | "Superconduct" | "ElectroCharged" | "Shattered"
  | { Swirl: Element }
  | "Bloom" | "Hyperbloom" | "Burgeon" | "Burning"
  | "LunarElectroCharged" | "LunarBloom" | "LunarCrystallize" | "LunarCrystallizeSecondary";

export type BuffTarget = "OnlySelf" | "Team" | "TeamExcludeSelf";

type ElementalDmgBonusStat = { ElementalDmgBonus: Element };
type ElementalResStat = { ElementalRes: Element };
type ElementalResReductionStat = { ElementalResReduction: Element };

export type BuffableStat =
  | "HpPercent" | "AtkPercent" | "DefPercent"
  | "HpFlat" | "AtkFlat" | "DefFlat"
  | "CritRate" | "CritDmg"
  | "ElementalMastery" | "EnergyRecharge"
  | "DmgBonus"
  | ElementalDmgBonusStat
  | "PhysicalDmgBonus"
  | "NormalAtkDmgBonus" | "ChargedAtkDmgBonus" | "PlungingAtkDmgBonus"
  | "SkillDmgBonus" | "BurstDmgBonus"
  | "HealingBonus" | "ShieldStrength"
  | "AmplifyingBonus" | "TransformativeBonus" | "AdditiveBonus"
  | ElementalResStat
  | ElementalResReductionStat
  | "PhysicalResReduction"
  | "DefReduction"
  | "NormalAtkFlatDmg" | "ChargedAtkFlatDmg" | "PlungingAtkFlatDmg"
  | "SkillFlatDmg" | "BurstFlatDmg"
  | "DefPercentRaw";

export interface Enemy {
  level: number;
  resistance: number;
  def_reduction: number;
}

export interface DamageInput {
  character_level: number;
  stats: Stats;
  talent_multiplier: number;
  scaling_stat: ScalingStat;
  damage_type: DamageType;
  element: Element | null;
  reaction: Reaction | null;
  reaction_bonus: number;
  flat_dmg: number;
}

export interface DamageResult {
  name: string;
  non_crit: number;
  crit: number;
  average: number;
  reaction: Reaction | null;
}

export interface TransformativeInput {
  character_level: number;
  elemental_mastery: number;
  reaction: Reaction;
  reaction_bonus: number;
}

export interface TransformativeResult {
  damage: number;
  damage_element: Element | null;
}

export interface LunarInput {
  character_level: number;
  elemental_mastery: number;
  reaction: Reaction;
  reaction_bonus: number;
  crit_rate: number;
  crit_dmg: number;
  base_dmg_bonus: number;
}

export interface LunarResult {
  non_crit: number;
  crit: number;
  average: number;
  damage_element: Element | null;
}

export interface StatProfile {
  base_hp: number;
  base_atk: number;
  base_def: number;
  hp_percent: number;
  atk_percent: number;
  def_percent: number;
  hp_flat: number;
  atk_flat: number;
  def_flat: number;
  elemental_mastery: number;
  crit_rate: number;
  crit_dmg: number;
  energy_recharge: number;
  dmg_bonus: number;
  pyro_dmg_bonus: number;
  hydro_dmg_bonus: number;
  electro_dmg_bonus: number;
  cryo_dmg_bonus: number;
  dendro_dmg_bonus: number;
  anemo_dmg_bonus: number;
  geo_dmg_bonus: number;
  physical_dmg_bonus: number;
}

export interface ResolvedBuff {
  source: string;
  stat: BuffableStat;
  value: number;
  target: BuffTarget;
}

export interface TeamMember {
  element: Element;
  weapon_type: WeaponType;
  stats: StatProfile;
  buffs_provided: ResolvedBuff[];
  is_moonsign: boolean;
}

export interface GoodImport {
  source: string;
  version: number;
  builds: CharacterBuild[];
  warnings: ImportWarning[];
}

export interface CharacterBuild {
  character: CharacterData;
  level: number;
  ascension: number;
  constellation: number;
  talent_levels: [number, number, number];
  weapon: WeaponBuild | null;
  artifacts: ArtifactsBuild;
}

export interface WeaponBuild {
  weapon: WeaponData;
  level: number;
  refinement: number;
}

export interface ArtifactSetEntry {
  set: ArtifactSetData;
  piece_count: number;
}

export interface ArtifactsBuild {
  sets: ArtifactSetEntry[];
  stats: StatProfile;
}

export interface ImportWarning {
  kind: string;
  message: string;
}

export interface CharacterData {
  id: string;
  name: string;
  element: Element;
  weapon_type: WeaponType;
  rarity: string; // e.g. "Star4", "Star5"
  base_hp: number[];
  base_atk: number[];
  base_def: number[];
  ascension_stat: Record<string, number>; // e.g. { "Def": 0.3 }
}

export interface WeaponData {
  id: string;
  name: string;
  weapon_type: WeaponType;
  rarity: string; // e.g. "Star4", "Star5"
  base_atk: number[];
  sub_stat: Record<string, number[]> | null; // e.g. { "DefPercent": [0.113, 0.473, ...] }
}

export interface ArtifactSetData {
  id: string;
  name: string;
}

// Dynamic talent multiplier bonus (e.g. Mavuika Fighting Spirit, Raiden Resolve)
export interface DynamicTalentBonus {
  name: string;
  max_stacks: number;
  per_stack: number[];
}

// Conditional buff activation (weapon / artifact set)
export interface ConditionalBuff {
  readonly name: string;
  readonly description: string;
  readonly stat: BuffableStat;
  readonly value: number;
  readonly target: BuffTarget;
  readonly activation: { Manual: "Toggle" } | { Manual: { Stacks: number } };
}

export interface BuffActivation {
  readonly name: string;
  readonly active: boolean;
  readonly stacks?: number;
}
