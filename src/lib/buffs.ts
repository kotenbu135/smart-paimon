import type { Element as GenshinElement, ResolvedBuff } from "../types/wasm";
import type { BuffBreakdown, BuffBreakdownEntry } from "../stores/team";

// Map WASM resonance source names to their element
const RESONANCE_ELEMENT: Record<string, GenshinElement> = {
  FerventFlames: "Pyro",
  SoothingWater: "Hydro",
  ShatteringIce: "Cryo",
  HighVoltage: "Electro",
  ImpetuousWinds: "Anemo",
  EnduringRock: "Geo",
  SprawlingGreenery: "Dendro",
};

// ---------- BuffBreakdown for UI ----------

interface BuildInfo {
  readonly characterId: string;
  readonly characterName: string;
  readonly element: GenshinElement;
}

export function buildBuffBreakdown(
  memberBuilds: readonly (BuildInfo | null)[],
  memberBuffs: readonly (readonly ResolvedBuff[])[],
  resonanceBuffs: readonly ResolvedBuff[],
  targetIndex?: number,
): readonly BuffBreakdown[] {
  const breakdowns: BuffBreakdown[] = [];

  // Per-character buffs
  // For the target (main DPS): include both OnlySelf and team buffs in a single card
  // For others: exclude OnlySelf (those are self-buffs irrelevant to the target)
  // Always include members even with 0 buffs so conditional toggle buttons remain visible
  for (let i = 0; i < memberBuilds.length; i++) {
    const info = memberBuilds[i];
    const buffs = memberBuffs[i];
    if (!info || !buffs) continue;

    const filteredBuffs = i === targetIndex
      ? buffs
      : buffs.filter((b) => b.target !== "OnlySelf");

    breakdowns.push({
      sourceCharacterId: info.characterId,
      sourceCharacterName: info.characterName,
      sourceElement: info.element,
      buffs: filteredBuffs.map((b): BuffBreakdownEntry => ({
        name: b.source,
        stat: b.stat,
        value: b.value,
        target: b.target,
      })),
    });
  }

  // Element resonance buffs from WASM (grouped by element)
  if (resonanceBuffs.length > 0) {
    const byElement = new Map<GenshinElement, ResolvedBuff[]>();
    for (const b of resonanceBuffs) {
      const element = RESONANCE_ELEMENT[b.source];
      if (!element) continue;
      const arr = byElement.get(element);
      if (arr) arr.push(b);
      else byElement.set(element, [b]);
    }
    for (const [element, buffs] of byElement) {
      breakdowns.push({
        sourceCharacterId: "resonance",
        sourceCharacterName: "Element Resonance",
        sourceElement: element,
        buffs: buffs.map((b): BuffBreakdownEntry => ({
          name: b.source,
          stat: b.stat,
          value: b.value,
          target: b.target,
        })),
      });
    }
  }

  return breakdowns;
}
