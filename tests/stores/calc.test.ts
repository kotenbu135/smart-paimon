import { describe, it, expect, beforeEach } from "vitest";
import { useCalcStore } from "../../src/stores/calc";

describe("CalcStore", () => {
  beforeEach(() => {
    useCalcStore.setState({
      selectedCharacterId: null,
      enemyConfig: { level: 90, resistance: 0.1, def_reduction: 0 },
      selectedReaction: null,
    });
  });

  it("has correct initial state", () => {
    const s = useCalcStore.getState();
    expect(s.selectedCharacterId).toBeNull();
    expect(s.enemyConfig).toEqual({ level: 90, resistance: 0.1, def_reduction: 0 });
    expect(s.selectedReaction).toBeNull();
  });

  it("sets enemy config", () => {
    useCalcStore.getState().setEnemy({ level: 110, resistance: 0.7, def_reduction: 0 });
    expect(useCalcStore.getState().enemyConfig.level).toBe(110);
  });

  it("sets reaction", () => {
    useCalcStore.getState().setReaction("Vaporize");
    expect(useCalcStore.getState().selectedReaction).toBe("Vaporize");
  });

  it("clears reaction", () => {
    useCalcStore.getState().setReaction("Vaporize");
    useCalcStore.getState().setReaction(null);
    expect(useCalcStore.getState().selectedReaction).toBeNull();
  });

  it("selects character", () => {
    useCalcStore.getState().selectCharacter("hu_tao");
    expect(useCalcStore.getState().selectedCharacterId).toBe("hu_tao");
  });
});
