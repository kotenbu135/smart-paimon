import { resolve_team_stats, apply_team_debuffs, find_character, build_team_member as wasmBuildTeamMember } from "@kotenbu135/genshin-calc-wasm";
import { buildStats } from "./stats";
import {
  computeTalentDamage,
  type TalentRow,
} from "./damage";
import { assembleResonanceBuffs, buildBuffBreakdown } from "./buffs";
import type {
  CharacterBuild,
  Enemy,
  Reaction,
  Stats,
  TeamMember,
  DamageResult,
  DamageType,
  Element as GenshinElement,
  ResolvedBuff,
} from "../types/wasm";
import type { BuffBreakdown, MemberActivations, TalentCategoryResults } from "../stores/team";

// ---------- TeamMember assembly (WASM v0.5.0) ----------

export function buildTeamMember(
  build: CharacterBuild,
  rawJson: string,
  activations?: MemberActivations | null,
  travelerElement?: string | null,
): TeamMember {
  const [weaponActs = [], artifactActs = [], talentActs = []] = activations ?? [[], [], []];
  return wasmBuildTeamMember(rawJson, build.character.id, weaponActs, artifactActs, talentActs, travelerElement) as TeamMember;
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
    name: r.name,
    non_crit: r.nonCrit,
    crit: r.crit,
    average: r.average,
    reaction: null,
  }));
}

/** Apply C3/C5 constellation talent level bonuses (+3) based on constellation_pattern */
export function applyConstellationTalentBonus(
  talentLevels: readonly [number, number, number],
  constellation: number,
  pattern: string | undefined,
): [number, number, number] {
  if (!pattern || constellation < 3) return [...talentLevels];
  const [normalLv, skillLv, burstLv] = talentLevels;

  let effectiveSkill = skillLv;
  let effectiveBurst = burstLv;

  if (pattern === "C3SkillC5Burst") {
    if (constellation >= 3) effectiveSkill = Math.min(skillLv + 3, 15);
    if (constellation >= 5) effectiveBurst = Math.min(burstLv + 3, 15);
  } else if (pattern === "C3BurstC5Skill") {
    if (constellation >= 3) effectiveBurst = Math.min(burstLv + 3, 15);
    if (constellation >= 5) effectiveSkill = Math.min(skillLv + 3, 15);
  }

  return [normalLv, effectiveSkill, effectiveBurst];
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
  const [normalLv, skillLv, burstLv] = applyConstellationTalentBonus(
    build.talent_levels, build.constellation, charData.constellation_pattern,
  );
  const el = build.character.element;
  const reactionBonus = damageContext?.amplifying_bonus ?? 0;

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
  readonly activations: readonly (MemberActivations | null)[];
  readonly getBuild: (id: string) => CharacterBuild | undefined;
  readonly rawJson: string | null;
  readonly travelerElement?: string | null;
}

export interface ResolveTeamOutput {
  readonly soloResults: Record<string, TalentCategoryResults>;
  readonly teamResults: Record<string, TalentCategoryResults>;
  readonly resolvedStats: Stats | null;
  readonly buffBreakdown: readonly BuffBreakdown[];
}

export function resolveTeamDamage(input: ResolveTeamInput): ResolveTeamOutput {
  const { members, mainDpsIndex, enemyConfig, selectedReaction, activations, getBuild, rawJson, travelerElement } = input;

  const mainDpsId = members[mainDpsIndex];
  if (!mainDpsId || !rawJson) {
    return { soloResults: {}, teamResults: {}, resolvedStats: null, buffBreakdown: [] };
  }

  const mainBuild = getBuild(mainDpsId);
  if (!mainBuild) {
    return { soloResults: {}, teamResults: {}, resolvedStats: null, buffBreakdown: [] };
  }

  // 1. Solo stats via build_stats_from_good
  const soloStats = buildStats(rawJson, mainDpsId, travelerElement);
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
    const member = buildTeamMember(build, rawJson, activations[i], travelerElement);
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

  // Add resonance buffs to only the first member to avoid duplication.
  // resolve_team_stats aggregates buffs from ALL members, so adding to every member
  // would count the resonance N times.
  if (resonanceBuffs.length > 0 && teamMembers.length > 0) {
    teamMembers[0].buffs_provided = [...teamMembers[0].buffs_provided, ...resonanceBuffs];
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
  const buffBreakdown = buildBuffBreakdown(memberBuilds, memberBuffs, resonanceBuffs, targetIdx);

  return {
    soloResults,
    teamResults,
    resolvedStats: teamResult.final_stats,
    buffBreakdown,
  };
}
