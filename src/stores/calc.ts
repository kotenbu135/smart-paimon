import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Enemy, Reaction } from "../types/wasm";

interface CalcState {
  selectedCharacterId: string | null;
  enemyConfig: Enemy;
  selectedReaction: Reaction | null;
  selectCharacter: (id: string | null) => void;
  setEnemy: (config: Enemy) => void;
  setReaction: (reaction: Reaction | null) => void;
}

export const useCalcStore = create<CalcState>()(
  persist(
    (set) => ({
      selectedCharacterId: null,
      enemyConfig: { level: 90, resistance: 0.1, def_reduction: 0 },
      selectedReaction: null,
      selectCharacter: (selectedCharacterId) => set({ selectedCharacterId }),
      setEnemy: (enemyConfig) => set({ enemyConfig }),
      setReaction: (selectedReaction) => set({ selectedReaction }),
    }),
    {
      name: "smart-paimon-calc",
    },
  ),
);
