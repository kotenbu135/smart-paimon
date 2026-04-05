import { resolve_team_stats, apply_team_debuffs, find_character } from "@kotenbu135/genshin-calc-wasm";
import { buildStats } from "./stats";
import {
  computeTalentDamage,
  getReactionBonus,
  type TalentRow,
} from "./damage";
import { assembleBuffsProvided, assembleResonanceBuffs, buildBuffBreakdown } from "./buffs";
import { isMoonsignCharacter } from "../utils/moonsign";
import type {
  CharacterBuild,
  Enemy,
  Reaction,
  Stats,
  StatProfile,
  TeamMember,
  DamageResult,
  DamageType,
  Element as GenshinElement,
  ResolvedBuff,
} from "../types/wasm";
import type { BuffBreakdown, TalentCategoryResults } from "../stores/team";

// ---------- StatProfile assembly ----------

const STAT_KEY_MAP: Record<string, keyof StatProfile> = {
  Hp: "hp_percent",
  HpPercent: "hp_percent",
  Atk: "atk_percent",
  AtkPercent: "atk_percent",
  Def: "def_percent",
  DefPercent: "def_percent",
  CritRate: "crit_rate",
  CritDmg: "crit_dmg",
  EnergyRecharge: "energy_recharge",
  ElementalMastery: "elemental_mastery",
  PhysicalDmgBonus: "dmg_bonus",
  PyroDmgBonus: "dmg_bonus",
  HydroDmgBonus: "dmg_bonus",
  ElectroDmgBonus: "dmg_bonus",
  CryoDmgBonus: "dmg_bonus",
  DendroDmgBonus: "dmg_bonus",
  AnemoDmgBonus: "dmg_bonus",
  GeoDmgBonus: "dmg_bonus",
};

export function levelToAscension(level: number): number {
  if (level <= 20) return 0;
  if (level <= 40) return 1;
  if (level <= 50) return 2;
  if (level <= 60) return 3;
  if (level <= 70) return 4;
  if (level <= 80) return 5;
  return 6;
}

// Character base stat arrays have 18 entries (2 per ascension phase: pre/post ascension).
// Ascension N at max level maps to index N * 2 + 1.
function ascensionToBaseStatIndex(ascension: number): number {
  return ascension * 2 + 1;
}

function clampIndex(arr: number[], index: number): number {
  return arr[Math.min(index, arr.length - 1)] ?? 0;
}

function addStatBonus(
  profile: StatProfile,
  statKey: string,
  value: number,
): StatProfile {
  const field = STAT_KEY_MAP[statKey];
  if (!field) return profile;
  return { ...profile, [field]: (profile[field] as number) + value };
}

export function buildStatProfile(build: CharacterBuild): StatProfile {
  const { character, weapon, artifacts } = build;

  // import_good does not return ascension — derive from level
  const ascension = build.ascension ?? levelToAscension(build.level);
  const baseIdx = ascensionToBaseStatIndex(ascension);

  const baseHp = clampIndex(character.base_hp, baseIdx);
  const baseAtk = clampIndex(character.base_atk, baseIdx);
  const baseDef = clampIndex(character.base_def, baseIdx);

  let weaponBaseAtk = 0;
  if (weapon) {
    const wAsc = levelToAscension(weapon.level);
    weaponBaseAtk = clampIndex(weapon.weapon.base_atk, wAsc);
  }

  // Start with artifact stats, then overlay base stats and character innate values
  let profile: StatProfile = {
    ...artifacts.stats,
    base_hp: baseHp,
    base_atk: baseAtk + weaponBaseAtk,
    base_def: baseDef,
    // All characters have innate crit_rate 5%, crit_dmg 50%, ER 100%
    crit_rate: artifacts.stats.crit_rate + 0.05,
    crit_dmg: artifacts.stats.crit_dmg + 0.5,
    energy_recharge: artifacts.stats.energy_recharge + 1.0,
  };

  // Add weapon substat
  if (weapon?.weapon.sub_stat) {
    const wAsc = levelToAscension(weapon.level);
    for (const [statKey, values] of Object.entries(weapon.weapon.sub_stat)) {
      if (Array.isArray(values)) {
        profile = addStatBonus(profile, statKey, clampIndex(values, wAsc));
      }
    }
  }

  // Add character ascension stat
  for (const [statKey, value] of Object.entries(character.ascension_stat)) {
    profile = addStatBonus(profile, statKey, value);
  }

  return profile;
}

// ---------- TeamMember assembly ----------

export function buildTeamMember(build: CharacterBuild): TeamMember {
  return {
    element: build.character.element,
    weapon_type: build.character.weapon_type,
    stats: buildStatProfile(build),
    buffs_provided: [...assembleBuffsProvided(build)],
    is_moonsign: isMoonsignCharacter(build.character.id),
  };
}

// ---------- WASM v0.3.0 TeamResolveResult types ----------

interface DamageContext {
  readonly normal_atk_dmg_bonus: number;
  readonly charged_atk_dmg_bonus: number;
  readonly plunging_atk_dmg_bonus: number;
  readonly skill_dmg_bonus: number;
  readonly burst_dmg_bonus: number;
  readonly normal_atk_flat_dmg: number;
  readonly charged_atk_flat_dmg: number;
  readonly plunging_atk_flat_dmg: number;
  readonly skill_flat_dmg: number;
  readonly burst_flat_dmg: number;
  readonly amplifying_bonus: number;
  readonly transformative_bonus: number;
  readonly additive_bonus: number;
}

interface EnemyDebuffs {
  readonly pyro_res_reduction: number;
  readonly hydro_res_reduction: number;
  readonly electro_res_reduction: number;
  readonly cryo_res_reduction: number;
  readonly dendro_res_reduction: number;
  readonly anemo_res_reduction: number;
  readonly geo_res_reduction: number;
  readonly physical_res_reduction: number;
  readonly def_reduction: number;
}

interface TeamResolveResult {
  readonly base_stats: Stats;
  readonly applied_buffs: readonly ResolvedBuff[];
  readonly resonances: readonly string[];
  readonly final_stats: Stats;
  readonly damage_context: DamageContext;
  readonly enemy_debuffs: EnemyDebuffs;
}

// Map DamageType to DamageContext fields
function getFlatDmg(ctx: DamageContext, dmgType: DamageType): number {
  switch (dmgType) {
    case "Normal": return ctx.normal_atk_flat_dmg;
    case "Charged": return ctx.charged_atk_flat_dmg;
    case "Plunging": return ctx.plunging_atk_flat_dmg;
    case "Skill": return ctx.skill_flat_dmg;
    case "Burst": return ctx.burst_flat_dmg;
  }
}

function getDmgBonus(ctx: DamageContext, dmgType: DamageType): number {
  switch (dmgType) {
    case "Normal": return ctx.normal_atk_dmg_bonus;
    case "Charged": return ctx.charged_atk_dmg_bonus;
    case "Plunging": return ctx.plunging_atk_dmg_bonus;
    case "Skill": return ctx.skill_dmg_bonus;
    case "Burst": return ctx.burst_dmg_bonus;
  }
}

// ---------- Damage computation per category ----------

function talentRowsToDamageResults(rows: TalentRow[]): DamageResult[] {
  return rows.map((r) => ({
    non_crit: r.nonCrit,
    crit: r.crit,
    average: r.average,
    reaction: null,
  }));
}

function computeAllCategories(
  characterId: string,
  build: CharacterBuild,
  stats: Stats,
  enemy: Enemy,
  reaction: Reaction | null,
  damageContext?: DamageContext,
  enemyDebuffs?: EnemyDebuffs,
): TalentCategoryResults {
  const charData = find_character(characterId);
  if (!charData?.talents) {
    return { normal: [], charged: [], plunging: [], skill: [], burst: [] };
  }

  const talents = charData.talents;
  const [normalLv, skillLv, burstLv] = build.talent_levels;
  const el = build.character.element;
  const reactionBonus = getReactionBonus(build.artifacts.four_piece_set, reaction)
    + (damageContext?.amplifying_bonus ?? 0);

  // Apply enemy debuffs via WASM (element-specific resistance + def reduction)
  const effectiveEnemy = enemyDebuffs
    ? apply_team_debuffs(enemy, enemyDebuffs, el) as Enemy
    : enemy;

  const compute = (scalings: any, lv: number, dmgType: DamageType) => {
    const flatDmg = damageContext ? getFlatDmg(damageContext, dmgType) : 0;
    const dmgBonus = damageContext ? getDmgBonus(damageContext, dmgType) : 0;
    // Add damage-type bonus to stats
    const effectiveStats = dmgBonus > 0
      ? { ...stats, dmg_bonus: stats.dmg_bonus + dmgBonus }
      : stats;
    return talentRowsToDamageResults(
      computeTalentDamage(scalings, lv, effectiveStats, build.level, el, effectiveEnemy, reaction, dmgType, reactionBonus, flatDmg),
    );
  };

  return {
    normal: compute(talents.normal_attack?.hits, normalLv, "Normal"),
    charged: compute(talents.normal_attack?.charged, normalLv, "Charged"),
    plunging: compute(talents.normal_attack?.plunging, normalLv, "Plunging"),
    skill: compute(talents.elemental_skill?.scalings, skillLv, "Skill"),
    burst: compute(talents.elemental_burst?.scalings, burstLv, "Burst"),
  };
}

// ---------- Main orchestrator ----------

export interface ResolveTeamInput {
  readonly members: readonly (string | null)[];
  readonly mainDpsIndex: number;
  readonly enemyConfig: Enemy;
  readonly selectedReaction: Reaction | null;
  readonly getBuild: (id: string) => CharacterBuild | undefined;
  readonly rawJson: string | null;
}

export interface ResolveTeamOutput {
  readonly soloResults: Record<string, TalentCategoryResults>;
  readonly teamResults: Record<string, TalentCategoryResults>;
  readonly resolvedStats: Stats | null;
  readonly buffBreakdown: readonly BuffBreakdown[];
}

export function resolveTeamDamage(input: ResolveTeamInput): ResolveTeamOutput {
  const { members, mainDpsIndex, enemyConfig, selectedReaction, getBuild, rawJson } = input;

  const mainDpsId = members[mainDpsIndex];
  if (!mainDpsId || !rawJson) {
    return { soloResults: {}, teamResults: {}, resolvedStats: null, buffBreakdown: [] };
  }

  const mainBuild = getBuild(mainDpsId);
  if (!mainBuild) {
    return { soloResults: {}, teamResults: {}, resolvedStats: null, buffBreakdown: [] };
  }

  // 1. Solo stats via build_stats_from_good
  const soloStats = buildStats(rawJson, mainDpsId);
  if (!soloStats) {
    return { soloResults: {}, teamResults: {}, resolvedStats: null, buffBreakdown: [] };
  }

  // 2. Solo damage
  const soloResults: Record<string, TalentCategoryResults> = {
    [mainDpsId]: computeAllCategories(mainDpsId, mainBuild, soloStats, enemyConfig, selectedReaction),
  };

  // 3. Assemble TeamMember[] and collect buff data for all filled slots
  const teamMembers: TeamMember[] = [];
  const indexMap: number[] = [];
  const memberBuilds: ({ characterId: string; characterName: string; element: GenshinElement } | null)[] = [];
  const memberBuffs: (readonly ResolvedBuff[])[] = [];

  for (let i = 0; i < members.length; i++) {
    const id = members[i];
    if (!id) continue;
    const build = getBuild(id);
    if (!build) continue;
    const member = buildTeamMember(build);
    teamMembers.push(member);
    indexMap.push(i);
    memberBuilds.push({
      characterId: build.character.id,
      characterName: build.character.name,
      element: build.character.element,
    });
    memberBuffs.push(member.buffs_provided);
  }

  // Element resonance
  const teamElements: (GenshinElement | null)[] = members.map((id) => {
    if (!id) return null;
    const b = getBuild(id);
    return b?.character.element ?? null;
  });
  const resonanceBuffs = assembleResonanceBuffs(teamElements);

  // Add resonance buffs to all team members
  if (resonanceBuffs.length > 0) {
    for (const member of teamMembers) {
      member.buffs_provided = [...member.buffs_provided, ...resonanceBuffs];
    }
  }

  // Find the target index within the filtered teamMembers array
  const targetIdx = indexMap.indexOf(mainDpsIndex);
  if (targetIdx === -1 || teamMembers.length === 0) {
    return { soloResults, teamResults: {}, resolvedStats: null, buffBreakdown: [] };
  }

  // 4. Call WASM resolve_team_stats (v0.3.0: returns TeamResolveResult)
  const teamResult = resolve_team_stats(teamMembers, targetIdx) as TeamResolveResult;

  // 5. Team damage with damage_context and enemy_debuffs from WASM
  const teamResults: Record<string, TalentCategoryResults> = {
    [mainDpsId]: computeAllCategories(
      mainDpsId, mainBuild, teamResult.final_stats, enemyConfig, selectedReaction,
      teamResult.damage_context, teamResult.enemy_debuffs,
    ),
  };

  // 6. Build buff breakdown for UI
  const buffBreakdown = buildBuffBreakdown(memberBuilds, memberBuffs, resonanceBuffs);

  return {
    soloResults,
    teamResults,
    resolvedStats: teamResult.final_stats,
    buffBreakdown,
  };
}
