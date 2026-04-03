import wasmInit, { init } from "@kotenbu135/genshin-calc-wasm";
import { useUIStore } from "./stores/ui";

export async function initWasm(): Promise<void> {
  try {
    await wasmInit();
    init();
    useUIStore.getState().setWasmReady(true);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown WASM error";
    useUIStore.getState().setWasmError(message);
  }
}
