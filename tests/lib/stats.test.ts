import { describe, it, expect } from "vitest";
import { buildStats } from "../../src/lib/stats";
import type { CharacterBuild } from "@kotenbu/genshin-calc/types";

const mockBuild: CharacterBuild = {
  character: { id: "diluc", name: "Diluc", element: "Pyro", weapon_type: "Claymore", rarity: 5, base_hp: 12981, base_atk: 335, base_def: 784, ascension_stat: "crit_dmg", ascension_stat_value: 0.384 },
  level: 90, ascension: 6, constellation: 2, talent_levels: [10, 10, 10],
  weapon: { weapon: { id: "wolfs_gravestone", name: "Wolf's Gravestone", weapon_type: "Claymore", rarity: 5, base_atk: 608, sub_stat: "atk_percent", sub_stat_value: 0.496 }, level: 90, refinement: 1 },
  artifacts: {
    stats: { base_hp: 0, base_atk: 0, base_def: 0, hp_percent: 0, atk_percent: 0.466, def_percent: 0, hp_flat: 4780, atk_flat: 311, def_flat: 0, elemental_mastery: 40, crit_rate: 0.331, crit_dmg: 0.662, energy_recharge: 0, dmg_bonus: 0.466 },
    sets: [{ id: "crimson_witch", name: "Crimson Witch of Flames" }],
    four_piece_set: { id: "crimson_witch", name: "Crimson Witch of Flames" },
  },
};

describe("buildStats", () => {
  it("assembles Stats from CharacterBuild", () => {
    const stats = buildStats(mockBuild);
    // base_hp * (1 + 0) + 4780 = 17761
    expect(stats.hp).toBeCloseTo(17761, 0);
    // (335 + 608) * (1 + 0.466 + 0.496) + 311 = 2161.17
    expect(stats.atk).toBeCloseTo(2161.17, 0);
    expect(stats.def).toBeCloseTo(784, 0);
    expect(stats.elemental_mastery).toBeCloseTo(40, 0);
    // 0.05 + 0.331 = 0.381
    expect(stats.crit_rate).toBeCloseTo(0.381, 2);
    // 0.50 + 0.662 + 0.384 = 1.546
    expect(stats.crit_dmg).toBeCloseTo(1.546, 2);
    expect(stats.energy_recharge).toBeCloseTo(1.0, 2);
    expect(stats.dmg_bonus).toBeCloseTo(0.466, 2);
  });

  it("handles build with no weapon", () => {
    const noWeapon = { ...mockBuild, weapon: null };
    const stats = buildStats(noWeapon);
    // 335 * (1 + 0.466) + 311 = 802.31
    expect(stats.atk).toBeCloseTo(802.31, 0);
  });
});
