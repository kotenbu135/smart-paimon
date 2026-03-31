import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "../../src/stores/ui";

describe("UIStore", () => {
  beforeEach(() => {
    useUIStore.setState({ locale: "ja", wasmReady: false, wasmError: null });
  });

  it("has correct initial state", () => {
    const state = useUIStore.getState();
    expect(state.locale).toBe("ja");
    expect(state.wasmReady).toBe(false);
    expect(state.wasmError).toBeNull();
  });

  it("sets locale", () => {
    useUIStore.getState().setLocale("en");
    expect(useUIStore.getState().locale).toBe("en");
  });

  it("sets wasmReady", () => {
    useUIStore.getState().setWasmReady(true);
    expect(useUIStore.getState().wasmReady).toBe(true);
  });

  it("sets wasmError and resets wasmReady", () => {
    useUIStore.getState().setWasmReady(true);
    useUIStore.getState().setWasmError("Failed to load");
    expect(useUIStore.getState().wasmError).toBe("Failed to load");
    expect(useUIStore.getState().wasmReady).toBe(false);
  });
});
