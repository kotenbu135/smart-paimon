import type { CharacterBuild, ResolvedBuff, StatProfile } from "../types/wasm";

type BuffProvider = (build: CharacterBuild) => readonly ResolvedBuff[];

interface CharacterBuffDef {
  readonly characterId: string;
  readonly getBuffs: BuffProvider;
}

// Computes total ATK from a StatProfile (base + flat + percentage)
function totalAtk(s: StatProfile): number {
  return s.base_atk * (1 + s.atk_percent) + s.atk_flat;
}

// Character passive/constellation buffs that are provided to the team.
// Only commonly-used support characters are included in V1.
// Each entry defines buffs based on the character's own build (level, constellation, stats).
const CHARACTER_BUFF_DEFS: readonly CharacterBuffDef[] = [
  {
    // Bennett Q: ATK buff based on Bennett's base ATK * talent multiplier
    // Simplified: using ~1.0x multiplier (talent lv 10 gives ~1.008, lv 13 ~1.19)
    // The buff only applies the base_atk portion (character base + weapon base)
    characterId: "bennett",
    getBuffs: (build) => {
      const burstLv = build.talent_levels[2];
      // Approximate multiplier by talent level (lv1: 0.56, lv10: 1.01, lv13: 1.19)
      const multipliers = [0.56, 0.60, 0.64, 0.68, 0.72, 0.76, 0.82, 0.88, 0.94, 1.01, 1.06, 1.12, 1.19];
      const mult = multipliers[Math.min(burstLv, 13) - 1] ?? 1.01;
      const baseAtk = build.character.base_atk[Math.min(build.ascension, build.character.base_atk.length - 1)] ?? 0;
      const weaponBaseAtk = build.weapon?.weapon.base_atk[Math.min(build.weapon.weapon.base_atk.length - 1, 6)] ?? 0;
      const atkBuff = (baseAtk + weaponBaseAtk) * mult;
      const buffs: ResolvedBuff[] = [
        { source: "bennett:burst", stat: "AtkFlat", value: Math.round(atkBuff), target: "Team" },
      ];
      // C6: Pyro DMG bonus for sword/claymore/polearm users
      if (build.constellation >= 6) {
        buffs.push({ source: "bennett:c6", stat: { ElementalDmgBonus: "Pyro" }, value: 0.15, target: "Team" });
      }
      return buffs;
    },
  },
  {
    // Kazuha A4 passive: After triggering Swirl, grants elemental DMG bonus = 0.04% per EM
    characterId: "kaedehara_kazuha",
    getBuffs: (build) => {
      if (build.ascension < 4) return [];
      const em = build.artifacts.stats.elemental_mastery + (build.character.ascension_stat["ElementalMastery"] ?? 0);
      const dmgBonus = em * 0.0004;
      return [{ source: "kazuha:a4", stat: "DmgBonus", value: Math.round(dmgBonus * 1000) / 1000, target: "Team" }];
    },
  },
  {
    // Nahida A1: EM buff to party members within Shrine of Maya
    // Highest EM in party - 900 = base, excess * 0.25 = bonus EM (max 250)
    // Simplified: provide flat EM based on Nahida's own EM
    characterId: "nahida",
    getBuffs: (build) => {
      if (build.ascension < 1) return [];
      const em = build.artifacts.stats.elemental_mastery + (build.character.ascension_stat["ElementalMastery"] ?? 0);
      const bonus = Math.min(Math.max((em - 200) * 0.25, 0), 250);
      if (bonus <= 0) return [];
      return [{ source: "nahida:a1", stat: "ElementalMastery", value: Math.round(bonus), target: "TeamExcludeSelf" }];
    },
  },
  {
    // Mona Q (Stellaris Phantasm): Omen DMG bonus
    // Talent lv 1: 42%, lv 10: 60%, lv 13: 60% (caps at lv 10)
    characterId: "mona",
    getBuffs: (build) => {
      const burstLv = build.talent_levels[2];
      const values = [0.42, 0.44, 0.46, 0.48, 0.50, 0.52, 0.54, 0.56, 0.58, 0.60, 0.60, 0.60, 0.60];
      const bonus = values[Math.min(burstLv, 13) - 1] ?? 0.60;
      return [{ source: "mona:burst", stat: "DmgBonus", value: bonus, target: "Team" }];
    },
  },
  {
    // Shenhe E: Quill DMG based on Shenhe's ATK
    // Provides flat Cryo DMG addition (NormalAtkFlatDmg etc. for Cryo attacks)
    characterId: "shenhe",
    getBuffs: (build) => {
      const skillLv = build.talent_levels[1];
      const multipliers = [0.457, 0.491, 0.525, 0.571, 0.605, 0.640, 0.685, 0.731, 0.777, 0.822, 0.868, 0.914, 0.971];
      const mult = multipliers[Math.min(skillLv, 13) - 1] ?? 0.822;
      const atk = totalAtk(build.artifacts.stats);
      const flat = Math.round(atk * mult);
      return [
        { source: "shenhe:skill", stat: "NormalAtkFlatDmg", value: flat, target: "Team" },
        { source: "shenhe:skill", stat: "ChargedAtkFlatDmg", value: flat, target: "Team" },
        { source: "shenhe:skill", stat: "PlungingAtkFlatDmg", value: flat, target: "Team" },
        { source: "shenhe:skill", stat: "SkillFlatDmg", value: flat, target: "Team" },
        { source: "shenhe:skill", stat: "BurstFlatDmg", value: flat, target: "Team" },
      ];
    },
  },
  {
    // Kujou Sara E/Q: ATK buff based on Sara's base ATK
    characterId: "kujou_sara",
    getBuffs: (build) => {
      const skillLv = build.talent_levels[1];
      const multipliers = [0.429, 0.461, 0.493, 0.536, 0.568, 0.600, 0.643, 0.686, 0.729, 0.772, 0.814, 0.857, 0.911];
      const mult = multipliers[Math.min(skillLv, 13) - 1] ?? 0.772;
      const baseAtk = build.character.base_atk[Math.min(build.ascension, build.character.base_atk.length - 1)] ?? 0;
      const weaponBaseAtk = build.weapon?.weapon.base_atk[Math.min(build.weapon.weapon.base_atk.length - 1, 6)] ?? 0;
      const atkBuff = Math.round((baseAtk + weaponBaseAtk) * mult);
      const buffs: ResolvedBuff[] = [
        { source: "sara:skill", stat: "AtkFlat", value: atkBuff, target: "Team" },
      ];
      // C6: CRIT DMG +60% for Electro DMG
      if (build.constellation >= 6) {
        buffs.push({ source: "sara:c6", stat: "CritDmg", value: 0.60, target: "Team" });
      }
      return buffs;
    },
  },
  {
    // Yun Jin Q: Normal ATK DMG bonus based on DEF
    characterId: "yun_jin",
    getBuffs: (build) => {
      const burstLv = build.talent_levels[2];
      const multipliers = [0.322, 0.346, 0.370, 0.402, 0.426, 0.451, 0.483, 0.515, 0.547, 0.579, 0.612, 0.644, 0.684];
      const mult = multipliers[Math.min(burstLv, 13) - 1] ?? 0.579;
      const def = build.artifacts.stats.base_def * (1 + build.artifacts.stats.def_percent) + build.artifacts.stats.def_flat;
      const flat = Math.round(def * mult);
      return [{ source: "yun_jin:burst", stat: "NormalAtkFlatDmg", value: flat, target: "Team" }];
    },
  },
  {
    // Zhongli shield: All RES reduction -20% (not representable as a stat buff)
    // Furina Q: DMG bonus based on Fanfare points (simplified as flat bonus)
    characterId: "furina",
    getBuffs: (build) => {
      const burstLv = build.talent_levels[2];
      // Max Fanfare at 300 points: ~0.25% per point at lv 10
      const perPoint = [0.09, 0.11, 0.13, 0.14, 0.16, 0.17, 0.19, 0.20, 0.22, 0.23, 0.25, 0.27, 0.28];
      const rate = (perPoint[Math.min(burstLv, 13) - 1] ?? 0.23) / 100;
      // Assume ~200 average Fanfare points in practical scenarios
      const bonus = rate * 200;
      return [{ source: "furina:burst", stat: "DmgBonus", value: Math.round(bonus * 1000) / 1000, target: "Team" }];
    },
  },
];

const BUFF_MAP = new Map(CHARACTER_BUFF_DEFS.map((d) => [d.characterId, d.getBuffs]));

export function getCharacterBuffs(build: CharacterBuild): readonly ResolvedBuff[] {
  const provider = BUFF_MAP.get(build.character.id);
  if (!provider) return [];
  try {
    return provider(build);
  } catch {
    return [];
  }
}
