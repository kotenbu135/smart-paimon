import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Enemy,
  Reaction,
  Stats,
  DamageResult,
  Element as GenshinElement,
  BuffableStat,
  BuffTarget,
} from "../types/wasm";
import { resolveTeamDamage } from "../lib/team";
import { useGoodStore } from "./good";

export interface BuffBreakdownEntry {
  readonly name: string;
  readonly stat: BuffableStat;
  readonly value: number;
  readonly target: BuffTarget;
  readonly condition?: string;
  readonly duration?: string;
}

export interface BuffBreakdown {
  readonly sourceCharacterId: string;
  readonly sourceCharacterName: string;
  readonly sourceElement: GenshinElement;
  readonly buffs: readonly BuffBreakdownEntry[];
}

export interface SavedTeam {
  readonly name: string;
  readonly members: readonly (string | null)[];
  readonly mainDpsIndex: number;
  readonly enemyConfig: Enemy;
}

export interface TalentCategoryResults {
  readonly normal: readonly DamageResult[];
  readonly charged: readonly DamageResult[];
  readonly plunging: readonly DamageResult[];
  readonly skill: readonly DamageResult[];
  readonly burst: readonly DamageResult[];
}

interface TeamState {
  members: (string | null)[];
  mainDpsIndex: number;
  enemyConfig: Enemy;
  selectedReaction: Reaction | null;
  resolvedStats: Stats | null;
  soloResults: Record<string, TalentCategoryResults>;
  teamResults: Record<string, TalentCategoryResults>;
  buffBreakdown: BuffBreakdown[];
  savedTeams: SavedTeam[];
  isResolving: boolean;
  resolveError: string | null;

  setMember: (index: number, characterId: string | null) => void;
  swapMembers: (fromIndex: number, toIndex: number) => void;
  setMainDps: (index: number) => void;
  setEnemy: (config: Enemy) => void;
  setReaction: (reaction: Reaction | null) => void;
  resolveTeam: () => Promise<void>;
  saveTeam: (name: string) => void;
  loadTeam: (index: number) => void;
  deleteTeam: (index: number) => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
  members: [null, null, null, null],
  mainDpsIndex: 0,
  enemyConfig: { level: 90, resistance: 0.1, def_reduction: 0 },
  selectedReaction: null,
  resolvedStats: null,
  soloResults: {},
  teamResults: {},
  buffBreakdown: [],
  savedTeams: [],
  isResolving: false,
  resolveError: null,

  setMember: (index, characterId) => {
    const members = [...get().members];
    members[index] = characterId;

    let { mainDpsIndex } = get();
    if (characterId !== null && members[mainDpsIndex] === null) {
      mainDpsIndex = index;
    }
    if (characterId === null && mainDpsIndex === index) {
      const nextIdx = members.findIndex((m) => m !== null);
      mainDpsIndex = nextIdx === -1 ? 0 : nextIdx;
    }

    set({ members, mainDpsIndex });
  },

  swapMembers: (fromIndex, toIndex) => {
    const members = [...get().members];
    [members[fromIndex], members[toIndex]] = [members[toIndex], members[fromIndex]];

    let { mainDpsIndex } = get();
    if (mainDpsIndex === fromIndex) mainDpsIndex = toIndex;
    else if (mainDpsIndex === toIndex) mainDpsIndex = fromIndex;

    set({ members, mainDpsIndex });
  },

  setMainDps: (index) => set({ mainDpsIndex: index }),
  setEnemy: (enemyConfig) => set({ enemyConfig }),
  setReaction: (selectedReaction) => set({ selectedReaction }),

  resolveTeam: async () => {
    set({ isResolving: true, resolveError: null });
    try {
      const { members, mainDpsIndex, enemyConfig, selectedReaction } = get();
      const goodStore = useGoodStore.getState();

      const result = resolveTeamDamage({
        members,
        mainDpsIndex,
        enemyConfig,
        selectedReaction,
        getBuild: goodStore.getBuild,
        rawJson: goodStore.rawJson,
      });

      set({
        soloResults: result.soloResults,
        teamResults: result.teamResults,
        resolvedStats: result.resolvedStats,
        buffBreakdown: [...result.buffBreakdown],
        isResolving: false,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Team calculation failed";
      set({ isResolving: false, resolveError: message });
    }
  },

  saveTeam: (name) => {
    const { members, mainDpsIndex, enemyConfig, savedTeams } = get();
    const newTeam: SavedTeam = { name, members: [...members], mainDpsIndex, enemyConfig };
    set({ savedTeams: [...savedTeams, newTeam] });
  },

  loadTeam: (index) => {
    const { savedTeams } = get();
    const team = savedTeams[index];
    if (!team) return;
    set({
      members: [...team.members],
      mainDpsIndex: team.mainDpsIndex,
      enemyConfig: { ...team.enemyConfig },
    });
  },

  deleteTeam: (index) => {
    set({ savedTeams: get().savedTeams.filter((_, i) => i !== index) });
  },
    }),
    {
      name: "smart-paimon-team",
      partialize: (state) => ({
        members: state.members,
        mainDpsIndex: state.mainDpsIndex,
        enemyConfig: state.enemyConfig,
        selectedReaction: state.selectedReaction,
        savedTeams: state.savedTeams,
      }),
    },
  ),
);
