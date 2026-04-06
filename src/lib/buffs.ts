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

  // Self-buffs for the target (main DPS) character — weapon passives, artifact set effects, talent passives
  if (targetIndex !== undefined) {
    const targetInfo = memberBuilds[targetIndex];
    const targetBuffs = memberBuffs[targetIndex];
    if (targetInfo && targetBuffs) {
      const selfBuffs = targetBuffs.filter((b) => b.target === "OnlySelf");
      if (selfBuffs.length > 0) {
        breakdowns.push({
          sourceCharacterId: targetInfo.characterId,
          sourceCharacterName: targetInfo.characterName,
          sourceElement: targetInfo.element,
          buffs: selfBuffs.map((b): BuffBreakdownEntry => ({
            name: b.source,
            stat: b.stat,
            value: b.value,
            target: b.target,
          })),
        });
      }
    }
  }

  // Per-character buffs (exclude OnlySelf — those are self-buffs, not team contributions)
  // Always include members even with 0 buffs so conditional toggle buttons remain visible
  for (let i = 0; i < memberBuilds.length; i++) {
    const info = memberBuilds[i];
    const buffs = memberBuffs[i];
    if (!info || !buffs) continue;

    const teamBuffs = buffs.filter((b) => b.target !== "OnlySelf");

    // Skip target character with no team buffs — they already have a self-buff card above
    if (i === targetIndex && teamBuffs.length === 0) continue;

    breakdowns.push({
      sourceCharacterId: info.characterId,
      sourceCharacterName: info.characterName,
      sourceElement: info.element,
      buffs: teamBuffs.map((b): BuffBreakdownEntry => ({
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
