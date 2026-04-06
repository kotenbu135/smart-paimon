import { describe, it, expect, vi } from "vitest";

vi.mock("@kotenbu135/genshin-calc-wasm", () => ({
  calculate_damage: vi.fn(),
  calculate_transformative: vi.fn(),
  calculate_lunar: vi.fn(),
  find_character: vi.fn(),
}));

import { isTransformative, isLunar, isAmplifyingOrAdditive, getAvailableReactionKeys } from "../../src/lib/damage";

describe("reaction categorization", () => {
  it("identifies amplifying reactions", () => {
    expect(isAmplifyingOrAdditive("Vaporize")).toBe(true);
    expect(isAmplifyingOrAdditive("Melt")).toBe(true);
    expect(isAmplifyingOrAdditive("Aggravate")).toBe(true);
    expect(isAmplifyingOrAdditive("Overloaded")).toBe(false);
  });

  it("identifies transformative reactions", () => {
    expect(isTransformative("Overloaded")).toBe(true);
    expect(isTransformative("Superconduct")).toBe(true);
    expect(isTransformative({ Swirl: "Pyro" })).toBe(true);
    expect(isTransformative("Vaporize")).toBe(false);
  });

  it("identifies lunar reactions", () => {
    expect(isLunar("LunarBloom")).toBe(true);
    expect(isLunar("Vaporize")).toBe(false);
  });
});

describe("getAvailableReactionKeys", () => {
  it("returns correct reactions for Pyro", () => {
    const keys = getAvailableReactionKeys("Pyro");
    expect(keys).toContain("vaporize");
    expect(keys).toContain("melt");
    expect(keys).toContain("overloaded");
    expect(keys).toContain("burning");
    expect(keys).toContain("burgeon");
    expect(keys).not.toContain("superconduct");
    expect(keys).not.toContain("bloom");
    expect(keys).not.toContain("aggravate");
    expect(keys).not.toContain("swirl");
  });

  it("returns correct reactions for Hydro", () => {
    const keys = getAvailableReactionKeys("Hydro");
    expect(keys).toContain("vaporize");
    expect(keys).toContain("electroCharged");
    expect(keys).toContain("bloom");
    expect(keys).toContain("lunarElectroCharged");
    expect(keys).toContain("lunarBloom");
    expect(keys).not.toContain("melt");
    expect(keys).not.toContain("superconduct");
  });

  it("returns correct reactions for Electro", () => {
    const keys = getAvailableReactionKeys("Electro");
    expect(keys).toContain("overloaded");
    expect(keys).toContain("superconduct");
    expect(keys).toContain("electroCharged");
    expect(keys).toContain("aggravate");
    expect(keys).toContain("hyperbloom");
    expect(keys).toContain("lunarElectroCharged");
    expect(keys).not.toContain("vaporize");
    expect(keys).not.toContain("bloom");
  });

  it("returns correct reactions for Cryo", () => {
    const keys = getAvailableReactionKeys("Cryo");
    expect(keys).toContain("melt");
    expect(keys).toContain("superconduct");
    expect(keys).toHaveLength(2);
  });

  it("returns correct reactions for Dendro", () => {
    const keys = getAvailableReactionKeys("Dendro");
    expect(keys).toContain("bloom");
    expect(keys).toContain("burning");
    expect(keys).toContain("spread");
    expect(keys).toContain("lunarBloom");
    expect(keys).not.toContain("vaporize");
  });

  it("returns correct reactions for Anemo", () => {
    const keys = getAvailableReactionKeys("Anemo");
    expect(keys).toContain("swirl");
    expect(keys).toHaveLength(1);
  });

  it("returns correct reactions for Geo", () => {
    const keys = getAvailableReactionKeys("Geo");
    expect(keys).toContain("lunarCrystallize");
    expect(keys).toContain("lunarCrystallizeSecondary");
    expect(keys).toHaveLength(2);
  });
});
