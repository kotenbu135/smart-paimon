import { describe, it, expect, vi } from "vitest";

vi.mock("@kotenbu135/genshin-calc-wasm", () => ({
  calculate_damage: vi.fn(),
  calculate_transformative: vi.fn(),
  calculate_lunar: vi.fn(),
  find_character: vi.fn(),
}));

import { isTransformative, isLunar, isAmplifyingOrAdditive } from "../../src/lib/damage";

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
