import { create } from "zustand";

interface UIState {
  locale: "ja" | "en";
  wasmReady: boolean;
  wasmError: string | null;
  setLocale: (locale: "ja" | "en") => void;
  setWasmReady: (ready: boolean) => void;
  setWasmError: (error: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  locale: "ja",
  wasmReady: false,
  wasmError: null,
  setLocale: (locale) => set({ locale }),
  setWasmReady: (wasmReady) => set({ wasmReady }),
  setWasmError: (wasmError) => set({ wasmError, wasmReady: false }),
}));
