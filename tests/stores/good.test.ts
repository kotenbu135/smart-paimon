import { describe, it, expect, beforeEach, vi } from "vitest";
import { useGoodStore } from "../../src/stores/good";

vi.mock("@kotenbu135/genshin-calc-wasm", () => ({
  import_good: vi.fn(),
}));

import { import_good } from "@kotenbu135/genshin-calc-wasm";

const mockBuild = {
  character: {
    id: "diluc", name: "Diluc", element: "Pyro", weapon_type: "Claymore",
    rarity: 5, base_hp: 12981, base_atk: 335, base_def: 784,
    ascension_stat: "crit_dmg", ascension_stat_value: 0.384,
  },
  level: 90, ascension: 6, constellation: 2,
  talent_levels: [10, 10, 10] as [number, number, number],
  weapon: {
    weapon: { id: "wolfs_gravestone", name: "Wolf's Gravestone", weapon_type: "Claymore", rarity: 5, base_atk: 608, sub_stat: "atk_percent", sub_stat_value: 0.496 },
    level: 90, refinement: 1,
  },
  artifacts: {
    stats: { base_hp: 0, base_atk: 0, base_def: 0, hp_percent: 0, atk_percent: 0.466, def_percent: 0, hp_flat: 4780, atk_flat: 311, def_flat: 0, elemental_mastery: 40, crit_rate: 0.331, crit_dmg: 0.662, energy_recharge: 0, dmg_bonus: 0.466 },
    sets: [{ id: "crimson_witch", name: "Crimson Witch of Flames" }],
    four_piece_set: { id: "crimson_witch", name: "Crimson Witch of Flames" },
  },
};

describe("GoodStore", () => {
  beforeEach(() => { useGoodStore.getState().clear(); vi.clearAllMocks(); });

  it("has empty initial state", () => {
    const s = useGoodStore.getState();
    expect(s.builds).toEqual([]);
    expect(s.warnings).toEqual([]);
    expect(s.error).toBeNull();
    expect(s.rawJson).toBeNull();
  });

  it("imports GOOD data", () => {
    vi.mocked(import_good).mockReturnValue({ source: "test", version: 1, builds: [mockBuild], warnings: [] });
    useGoodStore.getState().importGood('{"foo":"bar"}');
    expect(useGoodStore.getState().builds).toHaveLength(1);
    expect(useGoodStore.getState().builds[0].character.id).toBe("diluc");
    expect(useGoodStore.getState().rawJson).toBe('{"foo":"bar"}');
  });

  it("stores warnings", () => {
    vi.mocked(import_good).mockReturnValue({ source: "test", version: 1, builds: [], warnings: [{ kind: "unknown_character", message: "Unknown: Foo" }] });
    useGoodStore.getState().importGood("{}");
    expect(useGoodStore.getState().warnings).toHaveLength(1);
  });

  it("handles import errors", () => {
    vi.mocked(import_good).mockImplementation(() => { throw new Error("Invalid GOOD format"); });
    useGoodStore.getState().importGood("bad");
    expect(useGoodStore.getState().builds).toEqual([]);
    expect(useGoodStore.getState().error).toBe("Invalid GOOD format");
    expect(useGoodStore.getState().rawJson).toBeNull();
  });

  it("finds build by ID", () => {
    vi.mocked(import_good).mockReturnValue({ source: "test", version: 1, builds: [mockBuild], warnings: [] });
    useGoodStore.getState().importGood("{}");
    expect(useGoodStore.getState().getBuild("diluc")).toBeDefined();
    expect(useGoodStore.getState().getBuild("unknown")).toBeUndefined();
  });

  it("clears state", () => {
    vi.mocked(import_good).mockReturnValue({ source: "test", version: 1, builds: [mockBuild], warnings: [] });
    useGoodStore.getState().importGood("{}");
    useGoodStore.getState().clear();
    expect(useGoodStore.getState().builds).toEqual([]);
    expect(useGoodStore.getState().rawJson).toBeNull();
  });
});
