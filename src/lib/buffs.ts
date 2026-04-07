import type { Element as GenshinElement, ResolvedBuff } from "../types/wasm";
import type { BuffBreakdown, BuffBreakdownEntry } from "../stores/team";
import { getResonanceBuffs } from "../data/resonance";

// ---------- Element resonance (applied as if from a virtual "resonance" member) ----------

export function assembleResonanceBuffs(
  elements: readonly (GenshinElement | null)[],
): readonly ResolvedBuff[] {
  return getResonanceBuffs(elements);
}

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

  // Element resonance buffs (grouped by element)
  if (resonanceBuffs.length > 0) {
    const byElement = new Map<GenshinElement, ResolvedBuff[]>();
    for (const b of resonanceBuffs) {
      // resonance source format: "resonance:pyro" → element = "Pyro"
      const colonIdx = b.source.indexOf(":");
      const label = colonIdx === -1 ? b.source : b.source.slice(colonIdx + 1);
      const element = (label.charAt(0).toUpperCase() + label.slice(1)) as GenshinElement;
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
