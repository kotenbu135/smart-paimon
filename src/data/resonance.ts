import type { Element as GenshinElement, ResolvedBuff } from "../types/wasm";

interface ResonanceDef {
  readonly elements: readonly GenshinElement[];
  readonly count: number;
  readonly buffs: readonly ResolvedBuff[];
}

// Genshin Impact element resonance definitions
// Only stat-representable resonance effects are included.
// Conditional effects (e.g. Cryo requires Cryo-affected target) are noted but still applied.
const RESONANCE_DEFS: readonly ResonanceDef[] = [
  {
    // Fervent Flames: ATK +25%
    elements: ["Pyro"],
    count: 2,
    buffs: [{ source: "resonance:pyro", stat: "AtkPercent", value: 0.25, target: "Team" }],
  },
  {
    // Soothing Water: HP +25%
    elements: ["Hydro"],
    count: 2,
    buffs: [{ source: "resonance:hydro", stat: "HpPercent", value: 0.25, target: "Team" }],
  },
  {
    // High Voltage: no direct stat buff (particle generation)
    elements: ["Electro"],
    count: 2,
    buffs: [],
  },
  {
    // Shattering Ice: CRIT Rate +15% (against Cryo-affected enemies)
    elements: ["Cryo"],
    count: 2,
    buffs: [{ source: "resonance:cryo", stat: "CritRate", value: 0.15, target: "Team" }],
  },
  {
    // Impetuous Winds: no direct damage stat buff (movement/stamina/CD)
    elements: ["Anemo"],
    count: 2,
    buffs: [],
  },
  {
    // Enduring Rock: DMG +15% when shielded
    elements: ["Geo"],
    count: 2,
    buffs: [{ source: "resonance:geo", stat: "DmgBonus", value: 0.15, target: "Team" }],
  },
  {
    // Sprawling Greenery: EM +50 (base), +30 after Burning/Quicken/Bloom
    // Only applying the base +50 EM
    elements: ["Dendro"],
    count: 2,
    buffs: [{ source: "resonance:dendro", stat: "ElementalMastery", value: 50, target: "Team" }],
  },
];

export function getResonanceBuffs(
  elements: readonly (GenshinElement | null)[],
): readonly ResolvedBuff[] {
  const counts = new Map<GenshinElement, number>();
  for (const el of elements) {
    if (el) counts.set(el, (counts.get(el) ?? 0) + 1);
  }

  const result: ResolvedBuff[] = [];
  for (const def of RESONANCE_DEFS) {
    for (const el of def.elements) {
      if ((counts.get(el) ?? 0) >= def.count) {
        result.push(...def.buffs);
      }
    }
  }
  return result;
}
