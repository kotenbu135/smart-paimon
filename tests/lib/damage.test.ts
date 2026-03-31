import { describe, it, expect, vi } from "vitest";

vi.mock("@kotenbu/genshin-calc", () => ({
  calculate_damage: vi.fn(),
  calculate_transformative: vi.fn(),
  calculate_lunar: vi.fn(),
  find_character: vi.fn(),
}));

import { isTransformative, isLunar, isAmplifyingOrAdditive, getReactionBonus } from "../../src/lib/damage";

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

describe("getReactionBonus", () => {
  it("returns bonus for Crimson Witch + Vaporize", () => {
    expect(getReactionBonus({ id: "crimson_witch", name: "CW" }, "Vaporize")).toBe(0.15);
  });

  it("returns bonus for Crimson Witch + Melt", () => {
    expect(getReactionBonus({ id: "crimson_witch", name: "CW" }, "Melt")).toBe(0.15);
  });

  it("returns bonus for Thundering Fury + Aggravate", () => {
    expect(getReactionBonus({ id: "thundering_fury", name: "TF" }, "Aggravate")).toBe(0.20);
  });

  it("returns 0 for no set", () => {
    expect(getReactionBonus(null, "Vaporize")).toBe(0);
  });

  it("returns 0 for null reaction", () => {
    expect(getReactionBonus({ id: "crimson_witch", name: "CW" }, null)).toBe(0);
  });

  it("returns 0 for unmatched set/reaction", () => {
    expect(getReactionBonus({ id: "crimson_witch", name: "CW" }, "Superconduct")).toBe(0);
  });

  it("returns 0 for Swirl (object reaction)", () => {
    expect(getReactionBonus({ id: "crimson_witch", name: "CW" }, { Swirl: "Pyro" })).toBe(0);
  });
});
