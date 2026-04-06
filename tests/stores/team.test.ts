import { describe, it, expect, beforeEach } from "vitest";
import { useTeamStore } from "../../src/stores/team";
import type { TalentCategoryResults } from "../../src/stores/team";

const INITIAL_ENEMY = { level: 90, resistance: 0.1, def_reduction: 0 };

describe("TeamStore", () => {
  beforeEach(() => {
    useTeamStore.setState({
      members: [null, null, null, null],
      mainDpsIndex: 0,
      enemyConfig: INITIAL_ENEMY,
      selectedReaction: null,
      resolvedStats: null,
      soloResults: {} as Record<string, TalentCategoryResults>,
      teamResults: {} as Record<string, TalentCategoryResults>,
      buffBreakdown: [],
      savedTeams: [],
      isResolving: false,
      resolveError: null,
    });
    localStorage.clear();
  });

  it("has correct initial state", () => {
    const s = useTeamStore.getState();
    expect(s.members).toEqual([null, null, null, null]);
    expect(s.mainDpsIndex).toBe(0);
    expect(s.isResolving).toBe(false);
  });

  it("sets a member at index", () => {
    useTeamStore.getState().setMember(0, "hu_tao");
    expect(useTeamStore.getState().members[0]).toBe("hu_tao");
    expect(useTeamStore.getState().members[1]).toBeNull();
  });

  it("removes a member by setting null", () => {
    useTeamStore.getState().setMember(0, "hu_tao");
    useTeamStore.getState().setMember(0, null);
    expect(useTeamStore.getState().members[0]).toBeNull();
  });

  it("sets mainDpsIndex to first placed member", () => {
    useTeamStore.getState().setMember(1, "hu_tao");
    expect(useTeamStore.getState().mainDpsIndex).toBe(1);
  });

  it("swaps members", () => {
    useTeamStore.getState().setMember(0, "hu_tao");
    useTeamStore.getState().setMember(1, "xingqiu");
    useTeamStore.getState().swapMembers(0, 1);
    const s = useTeamStore.getState();
    expect(s.members[0]).toBe("xingqiu");
    expect(s.members[1]).toBe("hu_tao");
  });

  it("swaps updates mainDpsIndex when DPS is swapped", () => {
    useTeamStore.getState().setMember(0, "hu_tao");
    useTeamStore.getState().setMainDps(0);
    useTeamStore.getState().setMember(1, "xingqiu");
    useTeamStore.getState().swapMembers(0, 1);
    expect(useTeamStore.getState().mainDpsIndex).toBe(1);
  });

  it("sets enemy config", () => {
    useTeamStore.getState().setEnemy({ level: 110, resistance: 0.7, def_reduction: 0 });
    expect(useTeamStore.getState().enemyConfig.level).toBe(110);
  });

  it("sets reaction", () => {
    useTeamStore.getState().setReaction("Vaporize");
    expect(useTeamStore.getState().selectedReaction).toBe("Vaporize");
  });

  it("saves and loads teams from localStorage", () => {
    useTeamStore.getState().setMember(0, "hu_tao");
    useTeamStore.getState().setMember(1, "xingqiu");
    useTeamStore.getState().saveTeam("Test Team");

    const saved = useTeamStore.getState().savedTeams;
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe("Test Team");
    expect(saved[0].members[0]).toBe("hu_tao");

    const raw = localStorage.getItem("smart-paimon-team");
    expect(raw).toBeTruthy();
    const persisted = JSON.parse(raw!);
    expect(persisted.state.savedTeams).toHaveLength(1);
  });

  it("loads a saved team", () => {
    useTeamStore.getState().setMember(0, "hu_tao");
    useTeamStore.getState().setMember(1, "xingqiu");
    useTeamStore.getState().saveTeam("Team A");

    useTeamStore.getState().setMember(0, null);
    useTeamStore.getState().setMember(1, null);

    useTeamStore.getState().loadTeam(0);
    const s = useTeamStore.getState();
    expect(s.members[0]).toBe("hu_tao");
    expect(s.members[1]).toBe("xingqiu");
  });

  it("deletes a saved team", () => {
    useTeamStore.getState().setMember(0, "hu_tao");
    useTeamStore.getState().saveTeam("To Delete");
    useTeamStore.getState().deleteTeam(0);
    expect(useTeamStore.getState().savedTeams).toHaveLength(0);
  });

  it("does not change mainDpsIndex when DPS slot is occupied", () => {
    useTeamStore.getState().setMember(0, "hu_tao");
    useTeamStore.getState().setMainDps(0);
    useTeamStore.getState().setMember(2, "xiangling");
    expect(useTeamStore.getState().mainDpsIndex).toBe(0);
  });

  it("resolveTeam transitions isResolving correctly", async () => {
    await useTeamStore.getState().resolveTeam();
    const s = useTeamStore.getState();
    expect(s.isResolving).toBe(false);
    expect(s.resolveError).toBeNull();
  });
});
