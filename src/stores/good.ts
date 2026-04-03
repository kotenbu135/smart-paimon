import { create } from "zustand";
import { import_good } from "@kotenbu135/genshin-calc-wasm";
import type { CharacterBuild, ImportWarning } from "../types/wasm";

const STORAGE_KEY = "smart-paimon-good";

interface GoodState {
  builds: CharacterBuild[];
  warnings: ImportWarning[];
  error: string | null;
  rawJson: string | null;
  importGood: (json: string) => void;
  restoreFromStorage: () => boolean;
  hasSavedData: () => boolean;
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
      try { localStorage.setItem(STORAGE_KEY, json); } catch { /* quota exceeded */ }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Import failed";
      set({ builds: [], warnings: [], error: message, rawJson: null });
    }
  },

  restoreFromStorage: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return false;
    try {
      const result = import_good(saved);
      set({ builds: result.builds, warnings: result.warnings, error: null, rawJson: saved });
      return true;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
  },

  hasSavedData: () => localStorage.getItem(STORAGE_KEY) !== null,

  getBuild: (characterId) => get().builds.find((b) => b.character.id === characterId),
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ builds: [], warnings: [], error: null, rawJson: null });
  },
}));
