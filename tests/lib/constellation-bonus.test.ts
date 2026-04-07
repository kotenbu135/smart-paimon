import { describe, it, expect } from "vitest";
import { applyConstellationTalentBonus } from "../../src/lib/team";

describe("applyConstellationTalentBonus", () => {
  const baseLevels: [number, number, number] = [10, 10, 10];

  it("returns unchanged levels at C0", () => {
    expect(applyConstellationTalentBonus(baseLevels, 0, "C3SkillC5Burst")).toEqual([10, 10, 10]);
  });

  it("returns unchanged levels at C2", () => {
    expect(applyConstellationTalentBonus(baseLevels, 2, "C3SkillC5Burst")).toEqual([10, 10, 10]);
  });

  it("C3SkillC5Burst: C3 adds +3 to skill", () => {
    expect(applyConstellationTalentBonus(baseLevels, 3, "C3SkillC5Burst")).toEqual([10, 13, 10]);
  });

  it("C3SkillC5Burst: C5 adds +3 to burst", () => {
    expect(applyConstellationTalentBonus(baseLevels, 5, "C3SkillC5Burst")).toEqual([10, 13, 13]);
  });

  it("C3SkillC5Burst: C6 adds +3 to both skill and burst", () => {
    expect(applyConstellationTalentBonus(baseLevels, 6, "C3SkillC5Burst")).toEqual([10, 13, 13]);
  });

  it("C3BurstC5Skill: C3 adds +3 to burst (Citlali pattern)", () => {
    expect(applyConstellationTalentBonus(baseLevels, 3, "C3BurstC5Skill")).toEqual([10, 10, 13]);
  });

  it("C3BurstC5Skill: C5 adds +3 to skill", () => {
    expect(applyConstellationTalentBonus(baseLevels, 5, "C3BurstC5Skill")).toEqual([10, 13, 13]);
  });

  it("C3BurstC5Skill: C6 adds +3 to both", () => {
    expect(applyConstellationTalentBonus(baseLevels, 6, "C3BurstC5Skill")).toEqual([10, 13, 13]);
  });

  it("caps at level 15", () => {
    const highLevels: [number, number, number] = [10, 14, 14];
    expect(applyConstellationTalentBonus(highLevels, 6, "C3SkillC5Burst")).toEqual([10, 15, 15]);
  });

  it("returns unchanged levels when pattern is undefined", () => {
    expect(applyConstellationTalentBonus(baseLevels, 6, undefined)).toEqual([10, 10, 10]);
  });

  it("does not modify normal attack level", () => {
    const levels: [number, number, number] = [8, 10, 10];
    const result = applyConstellationTalentBonus(levels, 6, "C3SkillC5Burst");
    expect(result[0]).toBe(8);
  });
});
