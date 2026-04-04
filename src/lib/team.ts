import { resolve_team_stats, find_character } from "@kotenbu135/genshin-calc-wasm";
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
  Element as GenshinElement,
  ResolvedBuff,
} from "../types/wasm";
import type { BuffBreakdown, TalentCategoryResults } from "../stores/team";

// ---------- StatProfile assembly ----------

const STAT_KEY_MAP: Record<string, keyof StatProfile> = {
  Hp: "hp_percent",
  Atk: "atk_percent",
  Def: "def_percent",
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

function weaponLevelToAscension(level: number): number {
  if (level <= 20) return 0;
  if (level <= 40) return 1;
  if (level <= 50) return 2;
  if (level <= 60) return 3;
  if (level <= 70) return 4;
  if (level <= 80) return 5;
  return 6;
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
  const { character, ascension, weapon, artifacts } = build;

  const baseHp = clampIndex(character.base_hp, ascension);
  const baseAtk = clampIndex(character.base_atk, ascension);
  const baseDef = clampIndex(character.base_def, ascension);

  let weaponBaseAtk = 0;
  if (weapon) {
    const wAsc = weaponLevelToAscension(weapon.level);
    weaponBaseAtk = clampIndex(weapon.weapon.base_atk, wAsc);
  }

  // Start with artifact stats, then overlay base stats
  let profile: StatProfile = {
    ...artifacts.stats,
    base_hp: baseHp,
    base_atk: baseAtk + weaponBaseAtk,
    base_def: baseDef,
  };

  // Add weapon substat
  if (weapon?.weapon.sub_stat) {
    const wAsc = weaponLevelToAscension(weapon.level);
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
): TalentCategoryResults {
  const charData = find_character(characterId);
  if (!charData?.talents) {
    return { normal: [], charged: [], plunging: [], skill: [], burst: [] };
  }

  const talents = charData.talents;
  const [normalLv, skillLv, burstLv] = build.talent_levels;
  const el = build.character.element;
  const reactionBonus = getReactionBonus(build.artifacts.four_piece_set, reaction);

  return {
    normal: talentRowsToDamageResults(
      computeTalentDamage(talents.normal_attack?.hits, normalLv, stats, build.level, el, enemy, reaction, "Normal", reactionBonus),
    ),
    charged: talentRowsToDamageResults(
      computeTalentDamage(talents.normal_attack?.charged, normalLv, stats, build.level, el, enemy, reaction, "Charged", reactionBonus),
    ),
    plunging: talentRowsToDamageResults(
      computeTalentDamage(talents.normal_attack?.plunging, normalLv, stats, build.level, el, enemy, reaction, "Plunging", reactionBonus),
    ),
    skill: talentRowsToDamageResults(
      computeTalentDamage(talents.elemental_skill?.scalings, skillLv, stats, build.level, el, enemy, reaction, "Skill", reactionBonus),
    ),
    burst: talentRowsToDamageResults(
      computeTalentDamage(talents.elemental_burst?.scalings, burstLv, stats, build.level, el, enemy, reaction, "Burst", reactionBonus),
    ),
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

  // 4. Call WASM resolve_team_stats
  const teamStats: Stats = resolve_team_stats(teamMembers, targetIdx);

  // 5. Team damage
  const teamResults: Record<string, TalentCategoryResults> = {
    [mainDpsId]: computeAllCategories(mainDpsId, mainBuild, teamStats, enemyConfig, selectedReaction),
  };

  // 6. Build buff breakdown for UI
  const buffBreakdown = buildBuffBreakdown(memberBuilds, memberBuffs, resonanceBuffs);

  return {
    soloResults,
    teamResults,
    resolvedStats: teamStats,
    buffBreakdown,
  };
}
