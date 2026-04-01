import { create } from "zustand";
import { import_good } from "@kotenbu/genshin-calc";
import type { CharacterBuild, ImportWarning } from "@kotenbu/genshin-calc/types";

interface GoodState {
  builds: CharacterBuild[];
  warnings: ImportWarning[];
  error: string | null;
  rawJson: string | null;
  importGood: (json: string) => void;
  getBuild: (characterId: string) => CharacterBuild | undefined;
  clear: () => void;
}

export const useGoodStore = create<GoodState>((set, get) => ({
  builds: [],
  warnings: [],
  error: null,
  rawJson: null,

  importGood: (json) => {
    try {
      const result = import_good(json);
      set({ builds: result.builds, warnings: result.warnings, error: null, rawJson: json });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Import failed";
      set({ builds: [], warnings: [], error: message, rawJson: null });
    }
  },

  getBuild: (characterId) => get().builds.find((b) => b.character.id === characterId),
  clear: () => set({ builds: [], warnings: [], error: null, rawJson: null }),
}));
