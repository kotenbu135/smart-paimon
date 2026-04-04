import { describe, it, expect } from "vitest";
import { isMoonsignCharacter, MOONSIGN_CHARACTERS } from "../../src/utils/moonsign";

describe("moonsign", () => {
  it("identifies moonsign characters", () => {
    expect(isMoonsignCharacter("ineffa")).toBe(true);
    expect(isMoonsignCharacter("flins")).toBe(true);
    expect(isMoonsignCharacter("columbina")).toBe(true);
    expect(isMoonsignCharacter("aino")).toBe(true);
  });

  it("rejects non-moonsign characters", () => {
    expect(isMoonsignCharacter("hu_tao")).toBe(false);
    expect(isMoonsignCharacter("xingqiu")).toBe(false);
    expect(isMoonsignCharacter("")).toBe(false);
  });

  it("has exactly 9 moonsign characters", () => {
    expect(MOONSIGN_CHARACTERS.size).toBe(9);
  });
});
