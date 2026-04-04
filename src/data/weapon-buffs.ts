import type { CharacterBuild, ResolvedBuff } from "../types/wasm";

interface WeaponBuffDef {
  readonly weaponId: string;
  readonly getBuffs: (build: CharacterBuild) => readonly ResolvedBuff[];
}

// Refinement index helper (refinement 1-5 → array index 0-4)
function refIdx(build: CharacterBuild): number {
  return Math.min(Math.max((build.weapon?.refinement ?? 1) - 1, 0), 4);
}

// Weapons that provide team-wide buffs.
// Self-only weapon passives are already included in the character's own stats.
const WEAPON_TEAM_BUFFS: readonly WeaponBuffDef[] = [
  {
    // Thrilling Tales of Dragon Slayers: ATK +24/30/36/42/48% to next character
    weaponId: "thrilling_tales_of_dragon_slayers",
    getBuffs: (build) => {
      const values = [0.24, 0.30, 0.36, 0.42, 0.48];
      return [{ source: `${build.character.id}:weapon:ttds`, stat: "AtkPercent", value: values[refIdx(build)], target: "TeamExcludeSelf" }];
    },
  },
  {
    // Elegy for the End: Millennial Movement - ATK +20/25/30/35/40% and EM +100/125/150/175/200
    weaponId: "elegy_for_the_end",
    getBuffs: (build) => {
      const atkValues = [0.20, 0.25, 0.30, 0.35, 0.40];
      const emValues = [100, 125, 150, 175, 200];
      const r = refIdx(build);
      return [
        { source: `${build.character.id}:weapon:elegy`, stat: "AtkPercent", value: atkValues[r], target: "Team" },
        { source: `${build.character.id}:weapon:elegy`, stat: "ElementalMastery", value: emValues[r], target: "Team" },
      ];
    },
  },
  {
    // Freedom-Sworn: Millennial Movement - Normal/Charged/Plunging +16/20/24/28/32% and ATK +20/25/30/35/40%
    weaponId: "freedom_sworn",
    getBuffs: (build) => {
      const naValues = [0.16, 0.20, 0.24, 0.28, 0.32];
      const atkValues = [0.20, 0.25, 0.30, 0.35, 0.40];
      const r = refIdx(build);
      return [
        { source: `${build.character.id}:weapon:freedom`, stat: "NormalAtkDmgBonus", value: naValues[r], target: "Team" },
        { source: `${build.character.id}:weapon:freedom`, stat: "ChargedAtkDmgBonus", value: naValues[r], target: "Team" },
        { source: `${build.character.id}:weapon:freedom`, stat: "PlungingAtkDmgBonus", value: naValues[r], target: "Team" },
        { source: `${build.character.id}:weapon:freedom`, stat: "AtkPercent", value: atkValues[r], target: "Team" },
      ];
    },
  },
  {
    // Wolf's Gravestone: ATK +40/50/60/70/80% to all party members when hitting enemies < 30% HP
    weaponId: "wolfs_gravestone",
    getBuffs: (build) => {
      const values = [0.40, 0.50, 0.60, 0.70, 0.80];
      return [{ source: `${build.character.id}:weapon:wgs`, stat: "AtkPercent", value: values[refIdx(build)], target: "Team" }];
    },
  },
  {
    // Hakushin Ring: Elemental DMG bonus for party after Electro reactions
    // +10/12.5/15/17.5/20% to the other element involved
    weaponId: "hakushin_ring",
    getBuffs: (build) => {
      const values = [0.10, 0.125, 0.15, 0.175, 0.20];
      return [{ source: `${build.character.id}:weapon:hakushin`, stat: "DmgBonus", value: values[refIdx(build)], target: "Team" }];
    },
  },
  {
    // Sapwood Blade: EM +60/75/90/105/120 to the character picking up the Leaf
    weaponId: "sapwood_blade",
    getBuffs: (build) => {
      const values = [60, 75, 90, 105, 120];
      return [{ source: `${build.character.id}:weapon:sapwood`, stat: "ElementalMastery", value: values[refIdx(build)], target: "TeamExcludeSelf" }];
    },
  },
];

const WEAPON_MAP = new Map(WEAPON_TEAM_BUFFS.map((d) => [d.weaponId, d.getBuffs]));

export function getWeaponTeamBuffs(build: CharacterBuild): readonly ResolvedBuff[] {
  if (!build.weapon) return [];
  const provider = WEAPON_MAP.get(build.weapon.weapon.id);
  if (!provider) return [];
  try {
    return provider(build);
  } catch {
    return [];
  }
}
