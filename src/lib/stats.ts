import { build_stats_from_good } from "@kotenbu135/genshin-calc-wasm";
import type { ExtendedStats } from "../types/wasm";

export function buildStats(rawJson: string, characterId: string, travelerElement?: string | null): ExtendedStats | null {
  try {
    return build_stats_from_good(rawJson, characterId, travelerElement) as ExtendedStats | null;
  } catch (e) {
    console.warn("[buildStats] Failed to compute stats:", e);
    return null;
  }
}
