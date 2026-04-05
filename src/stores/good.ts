import { create } from "zustand";
import { import_good_with_options } from "@kotenbu135/genshin-calc-wasm";
import type { CharacterBuild, ImportWarning } from "../types/wasm";

const STORAGE_KEY = "smart-paimon-good";
const TRAVELER_ELEMENT_KEY = "smart-paimon-traveler-element";

interface GoodState {
  builds: CharacterBuild[];
  warnings: ImportWarning[];
  error: string | null;
  rawJson: string | null;
  travelerElement: string | null;
  importGood: (json: string) => void;
  setTravelerElement: (element: string | null) => void;
  restoreFromStorage: () => boolean;
  hasSavedData: () => boolean;
  getBuild: (characterId: string) => CharacterBuild | undefined;
  clear: () => void;
}

function doImport(json: string, travelerElement: string | null) {
  return import_good_with_options(json, travelerElement) as {
    builds: CharacterBuild[];
    warnings: ImportWarning[];
  };
}

export const useGoodStore = create<GoodState>((set, get) => ({
  builds: [],
  warnings: [],
  error: null,
  rawJson: null,
  travelerElement: localStorage.getItem(TRAVELER_ELEMENT_KEY),

  importGood: (json) => {
    try {
      const result = doImport(json, get().travelerElement);
      set({ builds: result.builds, warnings: result.warnings, error: null, rawJson: json });
      try { localStorage.setItem(STORAGE_KEY, json); } catch { /* quota exceeded */ }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Import failed";
      set({ builds: [], warnings: [], error: message, rawJson: null });
    }
  },

  setTravelerElement: (element) => {
    set({ travelerElement: element });
    if (element) {
      localStorage.setItem(TRAVELER_ELEMENT_KEY, element);
    } else {
      localStorage.removeItem(TRAVELER_ELEMENT_KEY);
    }
    // Re-import with new traveler element if we have data
    const rawJson = get().rawJson;
    if (rawJson) {
      try {
        const result = doImport(rawJson, element);
        set({ builds: result.builds, warnings: result.warnings, error: null });
      } catch { /* keep existing state */ }
    }
  },

  restoreFromStorage: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return false;
    try {
      const result = doImport(saved, get().travelerElement);
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
