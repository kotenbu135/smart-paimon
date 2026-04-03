import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildStats } from "../../src/lib/stats";

vi.mock("@kotenbu135/genshin-calc-wasm", () => ({
  build_stats_from_good: vi.fn(),
}));

import { build_stats_from_good } from "@kotenbu135/genshin-calc-wasm";

const mockStats = {
  hp: 17761,
  atk: 2161.17,
  def: 784,
  elemental_mastery: 40,
  crit_rate: 0.381,
  crit_dmg: 1.546,
  energy_recharge: 1.0,
  dmg_bonus: 0.466,
  pyro_dmg_bonus: 0,
  hydro_dmg_bonus: 0,
  electro_dmg_bonus: 0,
  cryo_dmg_bonus: 0,
  dendro_dmg_bonus: 0,
  anemo_dmg_bonus: 0,
  geo_dmg_bonus: 0,
  physical_dmg_bonus: 0,
};

describe("buildStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("assembles Stats from JSON and characterId", () => {
    vi.mocked(build_stats_from_good).mockReturnValue(mockStats);
    const stats = buildStats('{"test":"data"}', "diluc");
    expect(stats).toEqual(mockStats);
    expect(build_stats_from_good).toHaveBeenCalledWith('{"test":"data"}', "diluc");
  });

  it("returns null on error", () => {
    vi.mocked(build_stats_from_good).mockImplementation(() => {
      throw new Error("WASM error");
    });
    const stats = buildStats('{"invalid":"json"}', "diluc");
    expect(stats).toBeNull();
  });
});
